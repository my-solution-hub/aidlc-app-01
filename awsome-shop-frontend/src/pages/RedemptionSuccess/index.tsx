import { useTranslation } from "react-i18next";
import { useNavigate, useLocation, Navigate } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import type { ExchangeRecordDTO } from "../../types/api";

interface SuccessState {
  record: ExchangeRecordDTO;
  remaining: number;
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Typography sx={{ fontSize: 14, color: "#64748B" }}>{label}</Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: valueColor ?? "#1E293B" }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function RedemptionSuccess() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as SuccessState | null;

  // Direct visits without redemption context fall back to the order list.
  if (!state?.record) {
    return <Navigate to="/orders" replace />;
  }

  const { record, remaining } = state;

  return (
    <Box sx={{ display: "flex", justifyContent: "center", p: "48px 32px" }}>
      <Box
        sx={{
          width: "100%",
          maxWidth: 520,
          bgcolor: "#fff",
          borderRadius: "12px",
          border: "1px solid #F1F5F9",
          p: "40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: "#DCFCE7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 44, color: "#16A34A" }} />
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ fontSize: 24, fontWeight: 700, color: "#1E293B" }}>
            {t("employee.redemptionSuccess.title")}
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#64748B", mt: "6px" }}>
            {t("employee.redemptionSuccess.subtitle")}
          </Typography>
        </Box>

        <Box sx={{ width: "100%", height: "1px", bgcolor: "#F1F5F9" }} />

        {/* Summary */}
        <Box
          sx={{
            width: "100%",
            bgcolor: "#F8FAFC",
            borderRadius: "8px",
            p: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <InfoRow label={t("employee.redemptionSuccess.orderNo")} value={record.orderNo} />
          <InfoRow
            label={t("employee.redemptionSuccess.product")}
            value={record.productName}
          />
          <InfoRow
            label={t("employee.redemptionSuccess.pointsDeducted")}
            value={`${(record.pointsCost ?? 0).toLocaleString()} ${t("employee.points")}`}
            valueColor="#D97706"
          />
          <InfoRow
            label={t("employee.redemptionSuccess.remaining")}
            value={`${remaining.toLocaleString()} ${t("employee.points")}`}
          />
          <InfoRow
            label={t("employee.redemptionSuccess.estimatedDelivery")}
            value={t("employee.redemptionSuccess.estimatedDeliveryValue")}
          />
        </Box>

        <Box sx={{ width: "100%", height: "1px", bgcolor: "#F1F5F9" }} />

        {/* Actions */}
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<ReceiptLongIcon sx={{ fontSize: 18 }} />}
            onClick={() => navigate(`/orders/${record.id}`)}
            sx={{ textTransform: "none", borderRadius: "8px", py: "12px", fontWeight: 600 }}
          >
            {t("employee.redemptionSuccess.viewOrder")}
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<ShoppingBagIcon sx={{ fontSize: 18 }} />}
            onClick={() => navigate("/")}
            sx={{ textTransform: "none", borderRadius: "8px", py: "12px", fontWeight: 600 }}
          >
            {t("employee.redemptionSuccess.continue")}
          </Button>
          <Button
            fullWidth
            onClick={() => navigate("/")}
            sx={{ textTransform: "none", color: "#64748B", fontWeight: 500 }}
          >
            {t("employee.redemptionSuccess.backHome")}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
