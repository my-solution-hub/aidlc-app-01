import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import TollIcon from "@mui/icons-material/Toll";
import AddIcon from "@mui/icons-material/Add";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { getProduct } from "../../services/api/product";
import { getBalance } from "../../services/api/point";
import { redeemProduct } from "../../services/api/order";
import { listAddresses } from "../../services/api/address";
import type { ProductDTO, AddressDTO } from "../../types/api";
import { useAuthStore } from "../../store/useAuthStore";
import { AppSnackbar, useSnackbar } from "../../components/AppSnackbar";
import { BusinessError } from "../../services/request";
import { AddressDialog } from "../Addresses";
import { resolveImageUrl } from "../../utils/image";

const CATEGORY_STYLES: Record<string, { bg: string; color: string }> = {
  数码电子: { bg: "#DBEAFE", color: "#2563EB" },
  智能穿戴: { bg: "#EDE9FE", color: "#7C3AED" },
  礼品卡: { bg: "#DCFCE7", color: "#16A34A" },
  生活百货: { bg: "#FEF3C7", color: "#D97706" },
  办公用品: { bg: "#FCE7F3", color: "#DB2777" },
};

function getCategoryStyle(category: string) {
  return CATEGORY_STYLES[category] || { bg: "#F1F5F9", color: "#64748B" };
}

function Card({ title, action, children }: { title?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #F1F5F9", p: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
      {title && (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#1E293B" }}>{title}</Typography>
            {action}
          </Box>
          <Box sx={{ height: "1px", bgcolor: "#F1F5F9" }} />
        </>
      )}
      {children}
    </Box>
  );
}

function SummaryRow({
  label,
  value,
  valueColor,
  bold,
}: {
  label: string;
  value: string;
  valueColor?: string;
  bold?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography sx={{ fontSize: 14, color: "#64748B" }}>{label}</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <TollIcon sx={{ fontSize: 16, color: valueColor ?? "#1E293B" }} />
        <Typography
          sx={{
            fontSize: bold ? 18 : 14,
            fontWeight: bold ? 700 : 600,
            color: valueColor ?? "#1E293B",
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export default function ConfirmRedemption() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const { showError } = snackbar;
  const user = useAuthStore((s) => s.user);
  const { productId } = useParams<{ productId: string }>();

  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [addresses, setAddresses] = useState<AddressDTO[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);

  const loadAddresses = useCallback(async () => {
    if (!user) return;
    try {
      const list = await listAddresses(user.userId);
      setAddresses(list);
      setSelectedAddressId((prev) => {
        if (prev && list.some((a) => a.id === prev)) return prev;
        const def = list.find((a) => a.isDefault === 1) ?? list[0];
        return def ? def.id : null;
      });
    } catch {
      // address book is best-effort; redemption can still proceed if backend allows
    }
  }, [user]);

  const fetchData = useCallback(async () => {
    if (!productId || !user) return;
    setLoading(true);
    try {
      const [p, b] = await Promise.all([
        getProduct(Number(productId)),
        getBalance(user.userId),
      ]);
      setProduct(p);
      setBalance(b.balance);
      await loadAddresses();
    } catch {
      showError(t("employee.confirmRedemption.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [productId, user, showError, t, loadAddresses]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentBalance = balance ?? 0;
  const cost = product?.pointsPrice ?? 0;
  const remaining = currentBalance - cost;
  const insufficient = remaining < 0;
  const unavailable =
    !product || product.status !== 1 || product.stock <= 0;
  const needAddress = addresses.length > 0 && selectedAddressId == null;

  const handleConfirm = async () => {
    if (!product || !user || insufficient) return;
    setRedeeming(true);
    try {
      const record = await redeemProduct({
        productId: product.id,
        quantity: 1,
        userId: user.userId,
        employeeName: user.displayName,
        addressId: selectedAddressId ?? undefined,
      });
      navigate("/orders/success", {
        replace: true,
        state: { record, remaining },
      });
    } catch (err) {
      snackbar.showError(
        err instanceof BusinessError
          ? err.message
          : t("employee.redeemFailed"),
      );
    } finally {
      setRedeeming(false);
    }
  };

  const style = product
    ? getCategoryStyle(product.category)
    : { bg: "#F1F5F9", color: "#64748B" };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 3, p: "24px 32px" }}
    >
      <Button
        startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
        onClick={() => navigate(-1)}
        sx={{
          alignSelf: "flex-start",
          textTransform: "none",
          color: "#64748B",
          fontSize: 14,
          fontWeight: 500,
          "&:hover": { bgcolor: "#F8FAFC" },
        }}
      >
        {t("employee.back")}
      </Button>

      <Box>
        <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#1E293B" }}>
          {t("employee.confirmRedemption.title")}
        </Typography>
        <Typography sx={{ fontSize: 14, color: "#64748B" }}>
          {t("employee.confirmRedemption.subtitle")}
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : !product ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 8,
            gap: 2,
          }}
        >
          <Inventory2Icon sx={{ fontSize: 48, color: "#CBD5E1" }} />
          <Typography sx={{ fontSize: 14, color: "#64748B" }}>
            {t("employee.noProducts")}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            maxWidth: 600,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Product card */}
          <Card title={t("employee.confirmRedemption.product")}>
            <Box sx={{ display: "flex", gap: "16px" }}>
              <Box
                sx={{
                  width: 88,
                  height: 88,
                  flexShrink: 0,
                  borderRadius: "10px",
                  bgcolor: style.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {product.imageUrl ? (
                  <Box
                    component="img"
                    src={resolveImageUrl(product.imageUrl)}
                    alt={product.name}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <Inventory2Icon sx={{ fontSize: 40, color: style.color }} />
                )}
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: "6px", justifyContent: "center" }}>
                <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#1E293B" }}>
                  {product.name}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#64748B" }}>{product.category}</Typography>
              </Box>
            </Box>
          </Card>

          {/* Points detail card */}
          <Card title={t("employee.confirmRedemption.summaryTitle")}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <SummaryRow
                label={t("employee.confirmRedemption.pointsCost")}
                value={cost.toLocaleString()}
                valueColor="#D97706"
              />
              <SummaryRow
                label={t("employee.confirmRedemption.currentBalance")}
                value={currentBalance.toLocaleString()}
              />
              <Box sx={{ height: "1px", bgcolor: "#F1F5F9" }} />
              <SummaryRow
                label={t("employee.confirmRedemption.remaining")}
                value={remaining.toLocaleString()}
                valueColor={insufficient ? "#DC2626" : "#10B981"}
                bold
              />
              {insufficient && (
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#DC2626" }}>
                  {t("employee.confirmRedemption.insufficient")}
                </Typography>
              )}
            </Box>
          </Card>

          {/* Shipping address card (C1/C2) */}
          <Card
            title={t("employee.confirmRedemption.shippingTitle")}
            action={
              <Box sx={{ display: "flex", gap: "4px" }}>
                <Button
                  size="small"
                  onClick={() => navigate("/addresses")}
                  sx={{ textTransform: "none", fontSize: 12, color: "#64748B", minWidth: "auto" }}
                >
                  {t("employee.address.title")}
                </Button>
                <Button
                  size="small"
                  startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                  onClick={() => setAddressDialogOpen(true)}
                  sx={{ textTransform: "none", fontSize: 12, color: "#2563EB", minWidth: "auto" }}
                >
                  {t("employee.address.add")}
                </Button>
              </Box>
            }
          >
            {addresses.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  bgcolor: "#F8FAFC",
                  borderRadius: "8px",
                  p: "14px 16px",
                }}
              >
                <LocationOnIcon sx={{ fontSize: 18, color: "#CBD5E1" }} />
                <Typography sx={{ fontSize: 13, color: "#64748B" }}>
                  {t("employee.confirmRedemption.noAddress")}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {addresses.map((addr) => {
                  const active = selectedAddressId === addr.id;
                  return (
                    <Box
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      sx={{
                        cursor: "pointer",
                        borderRadius: "8px",
                        border: `1px solid ${active ? "#2563EB" : "#E2E8F0"}`,
                        bgcolor: active ? "#EFF6FF" : "#fff",
                        p: "12px 16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>
                          {addr.receiver}
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: "#64748B" }}>{addr.phone}</Typography>
                        {addr.isDefault === 1 && (
                          <Box sx={{ borderRadius: "6px", bgcolor: "#DBEAFE", px: "6px", py: "1px" }}>
                            <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#2563EB" }}>
                              {t("employee.address.default")}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <Typography sx={{ fontSize: 12, color: "#64748B" }}>
                        {addr.region} {addr.detail}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Card>

          {/* Tips card */}
          <Card title={t("employee.confirmRedemption.tipsTitle")}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {["tip1", "tip2", "tip3"].map((k) => (
                <Box key={k} sx={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#CBD5E1", mt: "7px", flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 13, color: "#64748B", lineHeight: 1.6 }}>
                    {t(`employee.confirmRedemption.${k}`)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <Button
              onClick={() => navigate(-1)}
              disabled={redeeming}
              sx={{
                textTransform: "none",
                color: "#64748B",
                borderRadius: "10px",
                px: "24px",
                py: "10px",
                border: "1px solid #E2E8F0",
                "&:hover": { bgcolor: "#F8FAFC" },
              }}
            >
              {t("employee.confirmRedemption.cancel")}
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={redeeming || insufficient || unavailable || needAddress}
              sx={{
                textTransform: "none",
                borderRadius: "10px",
                px: "32px",
                py: "10px",
                fontWeight: 600,
                minWidth: 140,
              }}
            >
              {redeeming ? (
                <CircularProgress size={18} sx={{ color: "#fff" }} />
              ) : (
                t("employee.confirmRedemption.confirm")
              )}
            </Button>
          </Box>
        </Box>
      )}

      {addressDialogOpen && user && (
        <AddressDialog
          userId={user.userId}
          onClose={() => setAddressDialogOpen(false)}
          onDone={(saved) => {
            setAddressDialogOpen(false);
            if (saved) setSelectedAddressId(saved.id);
            loadAddresses();
          }}
          onError={(msg) => snackbar.showError(msg)}
        />
      )}

      <AppSnackbar state={snackbar.state} onClose={snackbar.close} />
    </Box>
  );
}
