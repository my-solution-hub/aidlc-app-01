import { useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import { adjustUserPoints } from "../../services/api/pointAdmin";
import type { UserPointDTO } from "../../types/api";
import { BusinessError } from "../../services/request";

const fieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14, "& fieldset": { borderColor: "#E2E8F0" } },
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B" }}>{label}</Typography>
      {children}
    </Box>
  );
}

/**
 * US-021: manual points adjustment dialog.
 * Shared by the employee points list (UserPoints) and the per-employee
 * points history page so both can trigger an adjustment with identical UX.
 */
export default function AdjustDialog({
  target,
  onClose,
  onDone,
  onError,
}: {
  target: UserPointDTO;
  onClose: () => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const { t } = useTranslation();
  const [direction, setDirection] = useState<"add" | "deduct">("add");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const numAmount = Number(amount);
  const signed = direction === "add" ? numAmount : -numAmount;
  const balanceAfter = (target.balance ?? 0) + signed;
  const insufficient = balanceAfter < 0;
  const canSubmit = amount !== "" && numAmount > 0 && reason.trim() !== "" && !insufficient;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await adjustUserPoints({ userId: target.userId, amount: signed, reason: reason.trim() });
      onDone();
    } catch (err) {
      onError(err instanceof BusinessError ? err.message : t("admin.userPoints.adjustFailed"));
    } finally {
      setLoading(false);
    }
  };

  const dirBtn = (key: "add" | "deduct", color: string) => (
    <Button
      onClick={() => setDirection(key)}
      sx={{
        flex: 1,
        textTransform: "none",
        borderRadius: "8px",
        fontWeight: 600,
        color: direction === key ? "#fff" : "#64748B",
        bgcolor: direction === key ? color : "#fff",
        border: `1px solid ${direction === key ? color : "#E2E8F0"}`,
        "&:hover": { bgcolor: direction === key ? color : "#F8FAFC" },
      }}
    >
      {t(`admin.userPoints.${key === "add" ? "directionAdd" : "directionDeduct"}`)}
    </Button>
  );

  return (
    <Dialog open onClose={onClose} slotProps={{ paper: { sx: { borderRadius: "12px", width: 440 } } }}>
      <DialogTitle sx={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>
        {t("admin.userPoints.adjustTitle")}
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: "16px", pt: "8px !important" }}>
        <Box sx={{ bgcolor: "#F8FAFC", borderRadius: "8px", p: "12px 16px" }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>
            {target.nickname || target.username}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#64748B" }}>
            {t("admin.userPoints.currentBalance")}: {(target.balance ?? 0).toLocaleString()}
          </Typography>
        </Box>

        <Field label={t("admin.userPoints.direction")}>
          <Box sx={{ display: "flex", gap: "10px" }}>
            {dirBtn("add", "#16A34A")}
            {dirBtn("deduct", "#DC2626")}
          </Box>
        </Field>

        <Field label={t("admin.userPoints.amount")}>
          <TextField
            fullWidth
            size="small"
            type="number"
            placeholder={t("admin.userPoints.amountPlaceholder")}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={fieldSx}
          />
        </Field>

        <Field label={t("admin.userPoints.reason")}>
          <TextField
            fullWidth
            size="small"
            multiline
            minRows={2}
            placeholder={t("admin.userPoints.reasonPlaceholder")}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={fieldSx}
          />
        </Field>

        <Typography sx={{ fontSize: 13, color: insufficient ? "#DC2626" : "#64748B" }}>
          {t("admin.userPoints.balanceAfter")}: {balanceAfter.toLocaleString()}
          {insufficient ? `  (${t("admin.userPoints.insufficient")})` : ""}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: "16px 24px" }}>
        <Button onClick={onClose} disabled={loading} sx={{ textTransform: "none", color: "#64748B", border: "1px solid #E2E8F0", borderRadius: "8px", px: "20px" }}>
          {t("common.cancel")}
        </Button>
        <Button variant="contained" disabled={loading || !canSubmit} onClick={handleSubmit} sx={{ textTransform: "none", borderRadius: "8px", px: "20px", minWidth: 100 }}>
          {loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : t("common.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
