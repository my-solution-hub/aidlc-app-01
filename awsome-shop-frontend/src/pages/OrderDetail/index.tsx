import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import { getMyOrder } from "../../services/api/order";
import type { ExchangeRecordDTO } from "../../types/api";
import { AppSnackbar, useSnackbar } from "../../components/AppSnackbar";
import { statusStyle, STATUS_I18N } from "../../utils/orderStatus";

/** Timeline step order (cancel handled separately). */
const TIMELINE: { key: string; statuses: string[] }[] = [
  { key: "submitted", statuses: ["PENDING_DELIVERY", "DELIVERING", "COMPLETED"] },
  { key: "pending", statuses: ["PENDING_DELIVERY", "DELIVERING", "COMPLETED"] },
  { key: "delivering", statuses: ["DELIVERING", "COMPLETED"] },
  { key: "completed", statuses: ["COMPLETED"] },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: "12px",
        border: "1px solid #F1F5F9",
        p: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#1E293B" }}>{title}</Typography>
      <Box sx={{ height: "1px", bgcolor: "#F1F5F9" }} />
      {children}
    </Box>
  );
}

function Row({ label, value, valueColor }: { label: string; value: React.ReactNode; valueColor?: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Typography sx={{ fontSize: 14, color: "#64748B" }}>{label}</Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 500, color: valueColor ?? "#1E293B", textAlign: "right" }}>
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

  const [order, setOrder] = useState<ExchangeRecordDTO | null>(null);
  const [loading, setLoading] = useState(true);

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

  const fmt = (s?: string) => (s ? s.slice(0, 19).replace("T", " ") : "—");

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
        <Box sx={{ maxWidth: 800, display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box>
              <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#1E293B" }}>
                {t("employee.orderDetail.title")}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#64748B", mt: "4px" }}>
                {t("employee.orderDetail.orderNo")}: {order.orderNo}
              </Typography>
            </Box>
            <Box
              sx={{
                borderRadius: "12px",
                bgcolor: statusStyle(order.status).bgColor,
                px: "12px",
                py: "5px",
              }}
            >
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: statusStyle(order.status).textColor }}>
                {STATUS_I18N[order.status] ? t(STATUS_I18N[order.status]) : order.status}
              </Typography>
            </Box>
          </Box>

          {/* Timeline */}
          <Section title={t("employee.orderDetail.statusTitle")}>
            {order.status === "CANCELLED" ? (
              <Typography sx={{ fontSize: 14, color: "#991B1B" }}>
                {t("employee.orderDetail.cancelled")}
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {TIMELINE.map((step, idx) => {
                  const active = step.statuses.includes(order.status);
                  const isCurrent =
                    (step.key === "pending" && order.status === "PENDING_DELIVERY") ||
                    (step.key === "delivering" && order.status === "DELIVERING") ||
                    (step.key === "completed" && order.status === "COMPLETED") ||
                    (step.key === "submitted" && order.status === "PENDING_DELIVERY");
                  return (
                    <Box key={step.key} sx={{ display: "flex", gap: "12px" }}>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            bgcolor: active ? (isCurrent ? "#2563EB" : "#16A34A") : "#E2E8F0",
                          }}
                        />
                        {idx < TIMELINE.length - 1 && (
                          <Box sx={{ width: "2px", flex: 1, minHeight: 24, bgcolor: active ? "#16A34A" : "#E2E8F0" }} />
                        )}
                      </Box>
                      <Box sx={{ pb: "4px" }}>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: active ? 600 : 400,
                            color: active ? (isCurrent ? "#2563EB" : "#1E293B") : "#94A3B8",
                          }}
                        >
                          {t(`employee.orderDetail.steps.${step.key}`)}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Section>

          {/* Product */}
          <Section title={t("employee.orderDetail.productInfo")}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "8px",
                    bgcolor: "#EFF6FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {order.productImageUrl ? (
                    <Box component="img" src={order.productImageUrl} alt={order.productName} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Inventory2Icon sx={{ fontSize: 28, color: "#2563EB" }} />
                  )}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>{order.productName}</Typography>
                  {order.quantity != null && (
                    <Typography sx={{ fontSize: 12, color: "#64748B" }}>x{order.quantity}</Typography>
                  )}
                </Box>
              </Box>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#D97706" }}>
                {(order.pointsCost ?? 0).toLocaleString()} {t("employee.points")}
              </Typography>
            </Box>
          </Section>

          {/* Order info */}
          <Section title={t("employee.orderDetail.orderInfo")}>
            <Row label={t("employee.orderDetail.orderNo")} value={order.orderNo} />
            <Row label={t("employee.orderDetail.orderTime")} value={fmt(order.exchangeTime || order.createdAt)} />
            <Row label={t("employee.orderDetail.payMethod")} value={t("employee.orderDetail.payByPoints")} />
            {order.trackingNumber && (
              <Row label={t("employee.orderDetail.tracking")} value={order.trackingNumber} />
            )}
            <Row label={t("employee.orderDetail.recipient")} value={order.employeeName || "—"} />
          </Section>
        </Box>
      )}

      <AppSnackbar state={snackbar.state} onClose={snackbar.close} />
    </Box>
  );
}
