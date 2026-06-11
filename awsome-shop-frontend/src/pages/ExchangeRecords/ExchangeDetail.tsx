import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CancelIcon from "@mui/icons-material/Cancel";
import PrintIcon from "@mui/icons-material/Print";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import {
  getExchangeRecord,
  updateExchangeRecordStatus,
} from "../../services/api/exchangeRecord";
import type { ExchangeRecordDTO } from "../../types/api";
import { AppSnackbar, useSnackbar } from "../../components/AppSnackbar";
import { BusinessError } from "../../services/request";
import { statusStyle, STATUS_I18N, nextStatuses } from "../../utils/orderStatus";
import { resolveImageUrl } from "../../utils/image";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: "12px", border: "1px solid #F1F5F9", p: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#1E293B" }}>{title}</Typography>
      <Box sx={{ height: "1px", bgcolor: "#F1F5F9" }} />
      {children}
    </Box>
  );
}

function Row({ label, value, valueColor, bold }: { label: string; value: React.ReactNode; valueColor?: string; bold?: boolean }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Typography sx={{ fontSize: 13, color: "#64748B" }}>{label}</Typography>
      <Typography sx={{ fontSize: bold ? 15 : 13, fontWeight: bold ? 700 : 500, color: valueColor ?? "#1E293B", textAlign: "right" }}>{value}</Typography>
    </Box>
  );
}

export default function ExchangeDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const { showError } = snackbar;
  const { id } = useParams<{ id: string }>();

  const [record, setRecord] = useState<ExchangeRecordDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      setRecord(await getExchangeRecord(Number(id)));
    } catch {
      showError(t("common.operationFailed"));
    } finally {
      setLoading(false);
    }
  }, [id, showError, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const doUpdate = async (status: string, trackingNumber?: string, carrier?: string) => {
    if (!record) return;
    setActionLoading(true);
    try {
      const updated = await updateExchangeRecordStatus({ id: record.id, status, trackingNumber, carrier });
      setRecord(updated);
      setDialogOpen(false);
      snackbar.showSuccess(t("admin.exchangeRecords.statusUpdateSuccess"));
    } catch (err) {
      snackbar.showError(err instanceof BusinessError ? err.message : t("admin.exchangeRecords.statusUpdateFailed"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    if (!record) return;
    if (!window.confirm(t("admin.exchangeRecords.cancelOrderConfirm"))) return;
    doUpdate("CANCELLED", record.trackingNumber);
  };

  const fmt = (s?: string) => (s ? s.slice(0, 19).replace("T", " ") : "—");

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!record) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10, gap: 2 }}>
        <Inventory2Icon sx={{ fontSize: 48, color: "#CBD5E1" }} />
        <Typography sx={{ fontSize: 14, color: "#64748B" }}>{t("admin.exchangeRecords.noRecords")}</Typography>
      </Box>
    );
  }

  const style = statusStyle(record.status);
  const canModify = nextStatuses(record.status).length > 0;

  return (
    <Box sx={{ p: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mb: "6px" }}>
            <Typography onClick={() => navigate("/admin/orders")} sx={{ fontSize: 13, color: "#2563EB", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
              {t("admin.exchangeRecords.title")}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#CBD5E1" }}>/</Typography>
            <Typography sx={{ fontSize: 13, color: "#64748B" }}>{t("admin.exchangeRecords.detailBreadcrumb")}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#1E293B" }}>{record.orderNo}</Typography>
            <Box sx={{ borderRadius: "10px", bgcolor: style.bgColor, px: "10px", py: "3px" }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: style.textColor }}>
                {STATUS_I18N[record.status] ? t(STATUS_I18N[record.status]) : record.status}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: "8px" }}>
          {record.status !== "CANCELLED" && record.status !== "COMPLETED" && (
            <Button variant="outlined" startIcon={<CancelIcon sx={{ fontSize: 16 }} />} onClick={handleCancel} disabled={actionLoading}
              sx={{ textTransform: "none", borderRadius: "8px", fontSize: 13, fontWeight: 600, color: "#DC2626", borderColor: "#FECACA" }}>
              {t("admin.exchangeRecords.cancelOrder")}
            </Button>
          )}
          <Button variant="outlined" startIcon={<PrintIcon sx={{ fontSize: 16 }} />} onClick={() => window.print()}
            sx={{ textTransform: "none", borderRadius: "8px", fontSize: 13, fontWeight: 600, color: "#64748B", borderColor: "#E2E8F0" }}>
            {t("admin.exchangeRecords.printDetail")}
          </Button>
          {canModify && (
            <Button variant="contained" startIcon={<LocalShippingIcon sx={{ fontSize: 16 }} />} onClick={() => setDialogOpen(true)}
              sx={{ textTransform: "none", borderRadius: "8px", fontSize: 13, fontWeight: 600 }}>
              {t("admin.exchangeRecords.modifyShipping")}
            </Button>
          )}
        </Box>
      </Box>

      {/* Body two columns */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "20px", alignItems: "start" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Product */}
          <Card title={t("admin.exchangeRecords.productInfo")}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <Box sx={{ width: 56, height: 56, borderRadius: "8px", bgcolor: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {record.productImageUrl ? (
                    <Box component="img" src={resolveImageUrl(record.productImageUrl)} alt={record.productName} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Inventory2Icon sx={{ fontSize: 28, color: "#2563EB" }} />
                  )}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>{record.productName}</Typography>
                  {record.productDesc && <Typography sx={{ fontSize: 12, color: "#64748B" }}>{record.productDesc}</Typography>}
                </Box>
              </Box>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#2563EB" }}>
                {(record.pointsCost ?? 0).toLocaleString()} {t("admin.exchangeRecords.fieldPoints")}
              </Typography>
            </Box>
          </Card>

          {/* Points detail */}
          <Card title={t("admin.exchangeRecords.pointsDetail")}>
            <Row label={t("admin.exchangeRecords.productPoints")} value={(record.pointsCost ?? 0).toLocaleString()} />
            {record.freightPoints != null && (
              <Row label={t("admin.exchangeRecords.freightPoints")} value={record.freightPoints.toLocaleString()} />
            )}
            <Box sx={{ height: "1px", bgcolor: "#F1F5F9" }} />
            <Row label={t("admin.exchangeRecords.totalConsumed")} value={`${(record.pointsCost ?? 0).toLocaleString()} ${t("admin.exchangeRecords.fieldPoints")}`} valueColor="#2563EB" bold />
            {record.balanceAfter != null && (
              <Row label={t("admin.exchangeRecords.balanceAfter")} value={`${record.balanceAfter.toLocaleString()} ${t("admin.exchangeRecords.fieldPoints")}`} valueColor="#16A34A" />
            )}
          </Card>

          {/* Employee */}
          <Card title={t("admin.exchangeRecords.exchangeEmployee")}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Row label={t("admin.exchangeRecords.employeeName")} value={record.employeeName || "—"} />
            </Box>
          </Card>

          {/* Status timeline (B3) */}
          {record.timeline && record.timeline.length > 0 && (
            <Card title={t("admin.exchangeRecords.statusLog")}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {record.timeline.map((log, idx) => {
                  const last = idx === record.timeline!.length - 1;
                  return (
                    <Box key={idx} sx={{ display: "flex", gap: "12px" }}>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: last ? "#2563EB" : "#16A34A" }} />
                        {!last && <Box sx={{ width: "2px", flex: 1, minHeight: 20, bgcolor: "#16A34A" }} />}
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>
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
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Order info */}
          <Card title={t("admin.exchangeRecords.orderInfo")}>
            <Row label={t("admin.exchangeRecords.fieldOrderNo")} value={record.orderNo} />
            <Row label={t("admin.exchangeRecords.orderTime")} value={fmt(record.exchangeTime || record.createdAt)} />
            {record.carrier && <Row label={t("admin.exchangeRecords.fieldCarrier")} value={record.carrier} />}
            {record.trackingNumber && <Row label={t("admin.exchangeRecords.fieldTracking")} value={record.trackingNumber} />}
          </Card>

          {/* Shipping info (C2) */}
          {(record.receiver || record.receiverPhone || record.receiverAddress) && (
            <Card title={t("admin.exchangeRecords.shippingInfo")}>
              {record.receiver && <Row label={t("admin.exchangeRecords.shipReceiver")} value={record.receiver} />}
              {record.receiverPhone && <Row label={t("admin.exchangeRecords.shipPhone")} value={record.receiverPhone} />}
              {record.receiverAddress && <Row label={t("admin.exchangeRecords.shipAddress")} value={record.receiverAddress} />}
            </Card>
          )}
        </Box>
      </Box>

      {dialogOpen && (
        <ShippingDialog record={record} loading={actionLoading} onConfirm={doUpdate} onClose={() => setDialogOpen(false)} />
      )}

      <AppSnackbar state={snackbar.state} onClose={snackbar.close} />
    </Box>
  );
}

// ---- dlg-09 修改发货状态 ----
function ShippingDialog({ record, loading, onConfirm, onClose }: { record: ExchangeRecordDTO; loading?: boolean; onConfirm: (status: string, tracking?: string, carrier?: string) => void; onClose: () => void }) {
  const { t } = useTranslation();
  const options = nextStatuses(record.status);
  const [status, setStatus] = useState<string>(options[0] ?? record.status);
  const [tracking, setTracking] = useState(record.trackingNumber ?? "");
  const [carrier, setCarrier] = useState(record.carrier ?? "");

  const fieldSx = { "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14, "& fieldset": { borderColor: "#E2E8F0" } } };
  const needTracking = status === "DELIVERING";

  return (
    <Dialog open onClose={onClose} slotProps={{ paper: { sx: { borderRadius: "12px", width: 440 } } }}>
      <DialogTitle sx={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>{t("admin.exchangeRecords.shippingTitle")}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: "16px", pt: "8px !important" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", bgcolor: "#FFF7ED", borderRadius: "8px", p: "12px 16px" }}>
          <Typography sx={{ fontSize: 13, color: "#64748B" }}>{t("admin.exchangeRecords.currentStatus")}:</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#D97706" }}>
            {STATUS_I18N[record.status] ? t(STATUS_I18N[record.status]) : record.status}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B" }}>{t("admin.exchangeRecords.targetStatus")}</Typography>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} size="small" sx={{ height: 40, borderRadius: "8px", fontSize: 14, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" } }}>
            {options.map((s) => (
              <MenuItem key={s} value={s}>{STATUS_I18N[s] ? t(STATUS_I18N[s]) : s}</MenuItem>
            ))}
          </Select>
        </Box>
        {needTracking && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B" }}>{t("admin.exchangeRecords.fieldCarrier")}</Typography>
            <TextField fullWidth size="small" placeholder={t("admin.exchangeRecords.carrierPlaceholder")} value={carrier} onChange={(e) => setCarrier(e.target.value)} sx={fieldSx} />
          </Box>
        )}
        {needTracking && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B" }}>{t("admin.exchangeRecords.fieldTracking")}</Typography>
            <TextField fullWidth size="small" placeholder={t("admin.exchangeRecords.trackingPlaceholder")} value={tracking} onChange={(e) => setTracking(e.target.value)} sx={fieldSx} />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: "16px 24px" }}>
        <Button onClick={onClose} disabled={loading} sx={{ textTransform: "none", color: "#64748B", border: "1px solid #E2E8F0", borderRadius: "8px", px: "20px" }}>
          {t("common.cancel")}
        </Button>
        <Button onClick={() => onConfirm(status, tracking.trim() || undefined, carrier.trim() || undefined)} disabled={loading} variant="contained" sx={{ textTransform: "none", borderRadius: "8px", px: "20px" }}>
          {t("admin.exchangeRecords.confirmModify")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
