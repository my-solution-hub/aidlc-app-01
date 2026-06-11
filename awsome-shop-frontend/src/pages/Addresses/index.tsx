import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../../services/api/address";
import type { AddressDTO, SaveAddressRequest } from "../../types/api";
import { useAuthStore } from "../../store/useAuthStore";
import { AppSnackbar, useSnackbar } from "../../components/AppSnackbar";
import ConfirmDialog from "../../components/ConfirmDialog";
import { BusinessError } from "../../services/request";

const fieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14, "& fieldset": { borderColor: "#E2E8F0" } },
};

export default function Addresses() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const user = useAuthStore((s) => s.user);

  const [list, setList] = useState<AddressDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<{ mode: "create" } | { mode: "edit"; address: AddressDTO } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AddressDTO | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(() => {
    if (!user) return;
    setLoading(true);
    listAddresses(user.userId)
      .then(setList)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await deleteAddress(deleteTarget.id);
      snackbar.showSuccess(t("common.deleteSuccess"));
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      snackbar.showError(err instanceof BusinessError ? err.message : t("common.deleteFailed"));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: "24px 32px" }}>
      <Button
        startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
        onClick={() => navigate(-1)}
        sx={{ alignSelf: "flex-start", textTransform: "none", color: "#64748B", fontSize: 14, fontWeight: 500 }}
      >
        {t("employee.back")}
      </Button>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#1E293B" }}>
            {t("employee.address.title")}
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#64748B" }}>
            {t("employee.address.subtitle")}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 16 }} />}
          onClick={() => setDialog({ mode: "create" })}
          sx={{ textTransform: "none", borderRadius: "8px", fontWeight: 600 }}
        >
          {t("employee.address.add")}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : list.length === 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 2 }}>
          <LocationOnIcon sx={{ fontSize: 48, color: "#CBD5E1" }} />
          <Typography sx={{ fontSize: 14, color: "#64748B" }}>{t("employee.address.empty")}</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: 720 }}>
          {list.map((addr) => (
            <Box
              key={addr.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                bgcolor: "#fff",
                borderRadius: "12px",
                border: "1px solid #F1F5F9",
                p: "20px",
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#1E293B" }}>{addr.receiver}</Typography>
                  <Typography sx={{ fontSize: 14, color: "#64748B" }}>{addr.phone}</Typography>
                  {addr.isDefault === 1 && (
                    <Box sx={{ borderRadius: "6px", bgcolor: "#EFF6FF", px: "8px", py: "2px" }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#2563EB" }}>
                        {t("employee.address.default")}
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Typography sx={{ fontSize: 13, color: "#64748B" }}>
                  {addr.region} {addr.detail}
                  {addr.postalCode ? `  (${addr.postalCode})` : ""}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <Button
                  size="small"
                  onClick={() => setDialog({ mode: "edit", address: addr })}
                  sx={{ textTransform: "none", fontSize: 13, color: "#2563EB", minWidth: "auto" }}
                >
                  {t("employee.address.edit")}
                </Button>
                <Button
                  size="small"
                  onClick={() => setDeleteTarget(addr)}
                  sx={{ textTransform: "none", fontSize: 13, color: "#DC2626", minWidth: "auto" }}
                >
                  {t("employee.address.delete")}
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {dialog && user && (
        <AddressDialog
          userId={user.userId}
          address={dialog.mode === "edit" ? dialog.address : undefined}
          onClose={() => setDialog(null)}
          onDone={() => {
            setDialog(null);
            fetchData();
            snackbar.showSuccess(t("common.saveSuccess"));
          }}
          onError={(msg) => snackbar.showError(msg)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={t("employee.address.deleteTitle")}
        message={t("employee.address.deleteMessage", { name: deleteTarget?.receiver ?? "" })}
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <AppSnackbar state={snackbar.state} onClose={snackbar.close} />
    </Box>
  );
}

/**
 * Shared create/edit shipping-address dialog (C1).
 * Reused by the address book page and the confirm-redemption inline picker.
 */
export function AddressDialog({
  userId,
  address,
  onClose,
  onDone,
  onError,
}: {
  userId: number;
  address?: AddressDTO;
  onClose: () => void;
  onDone: (saved?: AddressDTO) => void;
  onError: (msg: string) => void;
}) {
  const { t } = useTranslation();
  const editing = !!address;
  const [receiver, setReceiver] = useState(address?.receiver ?? "");
  const [phone, setPhone] = useState(address?.phone ?? "");
  const [region, setRegion] = useState(address?.region ?? "");
  const [detail, setDetail] = useState(address?.detail ?? "");
  const [postalCode, setPostalCode] = useState(address?.postalCode ?? "");
  const [isDefault, setIsDefault] = useState((address?.isDefault ?? 0) === 1);
  const [loading, setLoading] = useState(false);

  const canSubmit = receiver.trim() && phone.trim() && region.trim() && detail.trim();

  const field = (label: string, required: boolean, node: React.ReactNode) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <Box sx={{ display: "flex", gap: "2px" }}>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B" }}>{label}</Typography>
        {required && <Typography sx={{ fontSize: 13, color: "#DC2626" }}>*</Typography>}
      </Box>
      {node}
    </Box>
  );

  const handleSave = async () => {
    if (!canSubmit) return;
    setLoading(true);
    const payload: SaveAddressRequest = {
      userId,
      receiver: receiver.trim(),
      phone: phone.trim(),
      region: region.trim(),
      detail: detail.trim(),
      postalCode: postalCode.trim() || undefined,
      isDefault: isDefault ? 1 : 0,
    };
    try {
      const saved = editing && address ? await updateAddress(address.id, payload) : await createAddress(payload);
      onDone(saved);
    } catch (err) {
      onError(err instanceof BusinessError ? err.message : t("common.saveFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onClose={onClose} slotProps={{ paper: { sx: { borderRadius: "12px", width: 460 } } }}>
      <DialogTitle sx={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>
        {editing ? t("employee.address.editTitle") : t("employee.address.addTitle")}
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: "16px", pt: "8px !important" }}>
        {field(
          t("employee.address.receiver"),
          true,
          <TextField fullWidth size="small" placeholder={t("employee.address.receiverPlaceholder")} value={receiver} onChange={(e) => setReceiver(e.target.value)} sx={fieldSx} />,
        )}
        {field(
          t("employee.address.phone"),
          true,
          <TextField fullWidth size="small" placeholder={t("employee.address.phonePlaceholder")} value={phone} onChange={(e) => setPhone(e.target.value)} sx={fieldSx} />,
        )}
        {field(
          t("employee.address.region"),
          true,
          <TextField fullWidth size="small" placeholder={t("employee.address.regionPlaceholder")} value={region} onChange={(e) => setRegion(e.target.value)} sx={fieldSx} />,
        )}
        {field(
          t("employee.address.detail"),
          true,
          <TextField fullWidth size="small" multiline minRows={2} placeholder={t("employee.address.detailPlaceholder")} value={detail} onChange={(e) => setDetail(e.target.value)} sx={fieldSx} />,
        )}
        {field(
          t("employee.address.postalCode"),
          false,
          <TextField fullWidth size="small" placeholder={t("employee.address.postalCodePlaceholder")} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} sx={fieldSx} />,
        )}
        <FormControlLabel
          control={<Switch checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />}
          label={<Typography sx={{ fontSize: 13, color: "#1E293B" }}>{t("employee.address.setDefault")}</Typography>}
        />
      </DialogContent>
      <DialogActions sx={{ p: "16px 24px" }}>
        <Button onClick={onClose} disabled={loading} sx={{ textTransform: "none", color: "#64748B", border: "1px solid #E2E8F0", borderRadius: "8px", px: "20px" }}>
          {t("common.cancel")}
        </Button>
        <Button variant="contained" disabled={loading || !canSubmit} onClick={handleSave} sx={{ textTransform: "none", borderRadius: "8px", px: "20px", minWidth: 100 }}>
          {loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
