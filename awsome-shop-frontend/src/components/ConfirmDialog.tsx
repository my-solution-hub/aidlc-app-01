import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import { useTranslation } from "react-i18next";

export default function ConfirmDialog({
  open,
  title,
  message,
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      slotProps={{ paper: { sx: { borderRadius: "12px", width: 400 } } }}
    >
      <DialogTitle
        sx={{
          fontSize: 18,
          fontWeight: 700,
          color: "#1E293B",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography
          sx={{
            fontSize: 14,
            color: "#64748B",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: "16px 24px" }}>
        <ButtonBase
          onClick={onCancel}
          disabled={loading}
          sx={{
            borderRadius: "8px",
            border: "1px solid #E2E8F0",
            px: "20px",
            py: "8px",
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 500,
              color: "#1E293B",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {t("common.cancel")}
          </Typography>
        </ButtonBase>
        <ButtonBase
          onClick={onConfirm}
          disabled={loading}
          sx={{
            borderRadius: "8px",
            bgcolor: "#DC2626",
            px: "20px",
            py: "8px",
            "&:hover": { bgcolor: "#B91C1C" },
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {t("common.confirm")}
          </Typography>
        </ButtonBase>
      </DialogActions>
    </Dialog>
  );
}
