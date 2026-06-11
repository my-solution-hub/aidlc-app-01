import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import CancelIcon from "@mui/icons-material/Cancel";
import { getMyOrder, confirmReceipt } from "../../services/api/order";
import type { ExchangeRecordDTO } from "../../types/api";
import { useAuthStore } from "../../store/useAuthStore";
import { AppSnackbar, useSnackbar } from "../../components/AppSnackbar";
import { BusinessError } from "../../services/request";
import { STATUS_I18N } from "../../utils/orderStatus";
import { resolveImageUrl } from "../../utils/image";

/** Horizontal progress steps (cancel handled separately). */
const STEPS: { key: string; icon: React.ElementType }[] = [
  { key: "submitted", icon: ReceiptLongIcon },
  { key: "pending", icon: Inventory2OutlinedIcon },
  { key: "delivering", icon: LocalShippingIcon },
  { key: "completed", icon: TaskAltIcon },
];

/** Map a backend status to how many steps are completed. */
const STATUS_TO_DONE: Record<string, number> = {
  PENDING_DELIVERY: 1,
  DELIVERING: 2,
  COMPLETED: 4,
};

function Card({
  title,
  action,
  children,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: "16px",
        border: "1px solid #F1F5F9",
        p: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
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

function Row({ label, value, valueColor, bold }: { label: string; value: React.ReactNode; valueColor?: string; bold?: boolean }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Typography sx={{ fontSize: 14, color: "#64748B" }}>{label}</Typography>
      <Typography sx={{ fontSize: bold ? 16 : 14, fontWeight: bold ? 700 : 500, color: valueColor ?? "#1E293B", textAlign: "right" }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function OrderDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const { showError } = snackbar;
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);

  const [order, setOrder] = useState<ExchangeRecordDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      setOrder(await getMyOrder(Number(id)));
    } catch {
      showError(t("employee.orderDetail.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [id, showError, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleConfirmReceipt = async () => {
    if (!order || !user) return;
    setConfirming(true);
    try {
      const updated = await confirmReceipt(order.id, user.userId);
      setOrder(updated);
      snackbar.showSuccess(t("employee.orderDetail.confirmReceiptSuccess"));
    } catch (err) {
      snackbar.showError(
        err instanceof BusinessError ? err.message : t("employee.orderDetail.confirmReceiptFailed"),
      );
    } finally {
      setConfirming(false);
    }
  };

  const fmt = (s?: string) => (s ? s.slice(0, 19).replace("T", " ") : "—");
  const timeOfStatus = (o: ExchangeRecordDTO, status: string) =>
    o.timeline?.find((l) => l.status === status)?.time;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: "24px 32px" }}>
      <Button
        startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
        onClick={() => navigate("/orders")}
        sx={{ alignSelf: "flex-start", textTransform: "none", color: "#64748B", fontSize: 14, fontWeight: 500 }}
      >
        {t("employee.orderDetail.backToList")}
      </Button>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : !order ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 2 }}>
          <Inventory2Icon sx={{ fontSize: 48, color: "#CBD5E1" }} />
          <Typography sx={{ fontSize: 14, color: "#64748B" }}>{t("employee.orderDetail.notFound")}</Typography>
        </Box>
      ) : (
        (() => {
          const cancelled = order.status === "CANCELLED";
          const doneCount = STATUS_TO_DONE[order.status] ?? 0;
          return (
            <Box sx={{ maxWidth: 860, width: "100%", mx: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Hero status card */}
              <Box
                sx={{
                  borderRadius: "16px",
                  p: "28px 32px",
                  color: "#fff",
                  background: cancelled
                    ? "linear-gradient(135deg, #64748B 0%, #475569 100%)"
                    : order.status === "COMPLETED"
                      ? "linear-gradient(135deg, #16A34A 0%, #15803D 100%)"
                      : "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {cancelled ? (
                      <CancelIcon sx={{ fontSize: 26 }} />
                    ) : order.status === "COMPLETED" ? (
                      <CheckCircleIcon sx={{ fontSize: 26 }} />
                    ) : (
                      <LocalShippingIcon sx={{ fontSize: 26 }} />
                    )}
                    <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
                      {STATUS_I18N[order.status] ? t(STATUS_I18N[order.status]) : order.status}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.85)", mt: "8px" }}>
                    {t("employee.orderDetail.orderNo")}: {order.orderNo}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.85)", mt: "2px" }}>
                    {t("employee.orderDetail.orderTime")}: {fmt(order.exchangeTime || order.createdAt)}
                  </Typography>
                </Box>
                {order.status === "DELIVERING" && (
                  <Button
                    variant="contained"
                    startIcon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                    onClick={handleConfirmReceipt}
                    disabled={confirming}
                    sx={{
                      textTransform: "none",
                      borderRadius: "10px",
                      fontWeight: 700,
                      bgcolor: "#fff",
                      color: "#2563EB",
                      "&:hover": { bgcolor: "#F1F5F9" },
                    }}
                  >
                    {confirming ? <CircularProgress size={18} sx={{ color: "#2563EB" }} /> : t("employee.orderDetail.confirmReceipt")}
                  </Button>
                )}
              </Box>

              {/* Progress stepper / cancelled banner */}
              <Card title={t("employee.orderDetail.progressTitle")}>
                {cancelled ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: "10px", bgcolor: "#FEF2F2", borderRadius: "10px", p: "16px" }}>
                    <CancelIcon sx={{ fontSize: 22, color: "#DC2626" }} />
                    <Typography sx={{ fontSize: 14, color: "#991B1B" }}>{t("employee.orderDetail.cancelled")}</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", alignItems: "flex-start", pt: "8px" }}>
                    {STEPS.map((step, i) => {
                      const done = i < doneCount;
                      const current = i === doneCount;
                      const Icon = done ? CheckCircleIcon : step.icon;
                      const color = done ? "#16A34A" : current ? "#2563EB" : "#CBD5E1";
                      const stepTime =
                        step.key === "submitted"
                          ? order.exchangeTime || order.createdAt
                          : step.key === "pending"
                            ? timeOfStatus(order, "PENDING_DELIVERY")
                            : step.key === "delivering"
                              ? timeOfStatus(order, "DELIVERING")
                              : timeOfStatus(order, "COMPLETED");
                      return (
                        <Box key={step.key} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                          {/* connector to next */}
                          {i < STEPS.length - 1 && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: 18,
                                left: "50%",
                                width: "100%",
                                height: "3px",
                                bgcolor: i < doneCount ? "#16A34A" : "#E2E8F0",
                              }}
                            />
                          )}
                          <Box
                            sx={{
                              zIndex: 1,
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              bgcolor: done ? "#DCFCE7" : current ? "#EFF6FF" : "#F1F5F9",
                              border: `2px solid ${color}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Icon sx={{ fontSize: 20, color }} />
                          </Box>
                          <Typography
                            sx={{
                              fontSize: 12,
                              fontWeight: current ? 700 : 500,
                              color: done ? "#16A34A" : current ? "#2563EB" : "#94A3B8",
                              mt: "8px",
                              textAlign: "center",
                            }}
                          >
                            {t(`employee.orderDetail.steps.${step.key}`)}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: "#CBD5E1", mt: "2px", textAlign: "center", minHeight: 14 }}>
                            {stepTime ? fmt(stepTime).slice(5, 16) : ""}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Card>

              {/* Product */}
              <Card title={t("employee.orderDetail.productInfo")}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ display: "flex", gap: "14px", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: "10px",
                        bgcolor: "#EFF6FF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      {order.productImageUrl ? (
                        <Box component="img" src={resolveImageUrl(order.productImageUrl)} alt={order.productName} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <Inventory2Icon sx={{ fontSize: 30, color: "#2563EB" }} />
                      )}
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#1E293B" }}>{order.productName}</Typography>
                      {order.productDesc && <Typography sx={{ fontSize: 12, color: "#64748B", mt: "2px" }}>{order.productDesc}</Typography>}
                      {order.quantity != null && <Typography sx={{ fontSize: 12, color: "#94A3B8", mt: "2px" }}>x{order.quantity}</Typography>}
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#D97706" }}>
                    {(order.pointsCost ?? 0).toLocaleString()} {t("employee.points")}
                  </Typography>
                </Box>
              </Card>

              {/* Points detail */}
              <Card title={t("employee.orderDetail.pointsDetail")}>
                <Row label={t("employee.orderDetail.productPoints")} value={`${(order.pointsCost ?? 0).toLocaleString()} ${t("employee.points")}`} />
                {order.freightPoints != null && (
                  <Row label={t("employee.orderDetail.freightPoints")} value={`${order.freightPoints.toLocaleString()} ${t("employee.points")}`} />
                )}
                {order.balanceAfter != null && (
                  <>
                    <Box sx={{ height: "1px", bgcolor: "#F1F5F9" }} />
                    <Row label={t("employee.orderDetail.balanceAfter")} value={`${order.balanceAfter.toLocaleString()} ${t("employee.points")}`} valueColor="#16A34A" bold />
                  </>
                )}
              </Card>

              {/* Shipping info */}
              {(order.receiver || order.receiverPhone || order.receiverAddress) && (
                <Card title={t("employee.orderDetail.shippingInfo")}>
                  {order.receiver && <Row label={t("employee.orderDetail.shipReceiver")} value={order.receiver} />}
                  {order.receiverPhone && <Row label={t("employee.orderDetail.shipPhone")} value={order.receiverPhone} />}
                  {order.receiverAddress && <Row label={t("employee.orderDetail.shipAddress")} value={order.receiverAddress} />}
                </Card>
              )}

              {/* Order info */}
              <Card title={t("employee.orderDetail.orderInfo")}>
                <Row label={t("employee.orderDetail.orderNo")} value={order.orderNo} />
                <Row label={t("employee.orderDetail.orderTime")} value={fmt(order.exchangeTime || order.createdAt)} />
                <Row label={t("employee.orderDetail.payMethod")} value={t("employee.orderDetail.payByPoints")} />
                {order.carrier && <Row label={t("employee.orderDetail.carrier")} value={order.carrier} />}
                {order.trackingNumber && <Row label={t("employee.orderDetail.tracking")} value={order.trackingNumber} />}
              </Card>

              {/* Detailed status log */}
              {order.timeline && order.timeline.length > 0 && (
                <Card title={t("employee.orderDetail.statusLog")}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    {order.timeline.map((log, idx) => {
                      const last = idx === order.timeline!.length - 1;
                      return (
                        <Box key={idx} sx={{ display: "flex", gap: "12px" }}>
                          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: last ? "#2563EB" : "#16A34A" }} />
                            {!last && <Box sx={{ width: "2px", flex: 1, minHeight: 22, bgcolor: "#E2E8F0" }} />}
                          </Box>
                          <Box sx={{ pb: "2px" }}>
                            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>
                              {STATUS_I18N[log.status] ? t(STATUS_I18N[log.status]) : log.status}
                            </Typography>
                            {log.remark && <Typography sx={{ fontSize: 12, color: "#64748B", mt: "2px" }}>{log.remark}</Typography>}
                            <Typography sx={{ fontSize: 12, color: "#94A3B8", mt: "2px" }}>{fmt(log.time)}</Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Card>
              )}

              {/* Bottom actions */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                {order.status === "DELIVERING" && (
                  <Button
                    variant="contained"
                    startIcon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                    onClick={handleConfirmReceipt}
                    disabled={confirming}
                    sx={{ textTransform: "none", borderRadius: "10px", fontWeight: 600 }}
                  >
                    {confirming ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : t("employee.orderDetail.confirmReceipt")}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  onClick={() => navigate("/orders")}
                  sx={{ textTransform: "none", borderRadius: "10px", fontWeight: 600, color: "#64748B", borderColor: "#E2E8F0" }}
                >
                  {t("employee.orderDetail.backToList")}
                </Button>
              </Box>
            </Box>
          );
        })()
      )}

      <AppSnackbar state={snackbar.state} onClose={snackbar.close} />
    </Box>
  );
}
