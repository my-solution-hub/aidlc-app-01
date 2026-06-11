import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import CancelIcon from "@mui/icons-material/Cancel";
import type { StatusLogDTO } from "../types/api";

const STEPS: { key: string; icon: React.ElementType }[] = [
  { key: "submitted", icon: ReceiptLongIcon },
  { key: "pending", icon: Inventory2OutlinedIcon },
  { key: "delivering", icon: LocalShippingIcon },
  { key: "completed", icon: TaskAltIcon },
];

const STATUS_TO_DONE: Record<string, number> = {
  PENDING_DELIVERY: 1,
  DELIVERING: 2,
  COMPLETED: 4,
};

/**
 * Horizontal 4-step order progress bar.
 * Shared by the employee order detail / list and the admin exchange detail
 * to keep the redemption-status visualization consistent.
 *
 * - `compact` renders a smaller bar without per-step timestamps (for list cards).
 * - `timeline` (optional) supplies per-step timestamps in the full variant.
 */
export default function OrderProgress({
  status,
  timeline,
  compact = false,
}: {
  status: string;
  timeline?: StatusLogDTO[];
  compact?: boolean;
}) {
  const { t } = useTranslation();

  if (status === "CANCELLED") {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px", bgcolor: "#FEF2F2", borderRadius: "10px", p: compact ? "8px 12px" : "16px" }}>
        <CancelIcon sx={{ fontSize: compact ? 18 : 22, color: "#DC2626" }} />
        <Typography sx={{ fontSize: compact ? 12 : 14, color: "#991B1B" }}>
          {t("employee.orderDetail.cancelled")}
        </Typography>
      </Box>
    );
  }

  const doneCount = STATUS_TO_DONE[status] ?? 0;
  const fmt = (s?: string) => (s ? s.slice(5, 16).replace("T", " ") : "");
  const timeOf = (s: string) => timeline?.find((l) => l.status === s)?.time;

  const circle = compact ? 26 : 38;
  const iconSize = compact ? 14 : 20;

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", pt: compact ? 0 : "8px" }}>
      {STEPS.map((step, i) => {
        const done = i < doneCount;
        const current = i === doneCount;
        const Icon = done ? CheckCircleIcon : step.icon;
        const color = done ? "#16A34A" : current ? "#2563EB" : "#CBD5E1";
        const stepTime =
          step.key === "submitted"
            ? timeOf("PENDING_DELIVERY")
            : step.key === "pending"
              ? timeOf("PENDING_DELIVERY")
              : step.key === "delivering"
                ? timeOf("DELIVERING")
                : timeOf("COMPLETED");
        return (
          <Box key={step.key} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            {i < STEPS.length - 1 && (
              <Box
                sx={{
                  position: "absolute",
                  top: circle / 2 - 1.5,
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
                width: circle,
                height: circle,
                borderRadius: "50%",
                bgcolor: done ? "#DCFCE7" : current ? "#EFF6FF" : "#F1F5F9",
                border: `2px solid ${color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon sx={{ fontSize: iconSize, color }} />
            </Box>
            <Typography
              sx={{
                fontSize: compact ? 11 : 12,
                fontWeight: current ? 700 : 500,
                color: done ? "#16A34A" : current ? "#2563EB" : "#94A3B8",
                mt: "6px",
                textAlign: "center",
              }}
            >
              {t(`employee.orderDetail.steps.${step.key}`)}
            </Typography>
            {!compact && (
              <Typography sx={{ fontSize: 11, color: "#CBD5E1", mt: "2px", textAlign: "center", minHeight: 14 }}>
                {fmt(stepTime)}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
