import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";
import SearchIcon from "@mui/icons-material/Search";
import TollIcon from "@mui/icons-material/Toll";
import TuneIcon from "@mui/icons-material/Tune";
import EditIcon from "@mui/icons-material/Edit";
import HistoryIcon from "@mui/icons-material/History";
import {
  listUserPoints,
  getDistributionConfig,
  updateDistributionConfig,
  getPointGrantStats,
} from "../../services/api/pointAdmin";
import type {
  UserPointDTO,
  PageResult,
  DistributionConfigDTO,
  PointGrantStatsDTO,
} from "../../types/api";
import AdminPageHeader from "../../components/AdminPageHeader";
import { AppSnackbar, useSnackbar } from "../../components/AppSnackbar";
import { BusinessError } from "../../services/request";
import AdjustDialog from "./AdjustDialog";

const PAGE_SIZE = 10;

function StatCard({
  label,
  value,
  hint,
  valueColor,
}: {
  label: string;
  value: string;
  hint?: string;
  valueColor?: string;
}) {
  return (
    <Box sx={{ flex: 1, bgcolor: "#fff", borderRadius: "12px", border: "1px solid #F1F5F9", p: "20px" }}>
      <Typography sx={{ fontSize: 13, color: "#64748B" }}>{label}</Typography>
      <Typography sx={{ fontSize: 28, fontWeight: 700, color: valueColor ?? "#1E293B", mt: "4px" }}>
        {value}
      </Typography>
      {hint && <Typography sx={{ fontSize: 12, color: "#94A3B8", mt: "2px" }}>{hint}</Typography>}
    </Box>
  );
}

export default function UserPoints() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [data, setData] = useState<PageResult<UserPointDTO> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState<PointGrantStatsDTO | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<UserPointDTO | null>(null);
  const [configOpen, setConfigOpen] = useState(false);

  const fetchData = useCallback(() => {
    listUserPoints({ page, size: PAGE_SIZE, keyword: search.trim() || undefined })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search]);

  const fetchStats = useCallback(() => {
    getPointGrantStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const rows = data?.records ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;
  const start = rows.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const end = start + rows.length - 1;

  return (
    <Box sx={{ p: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <AdminPageHeader
        title={t("admin.userPoints.title")}
        actions={
          <Button
            variant="contained"
            startIcon={<TuneIcon sx={{ fontSize: 16 }} />}
            onClick={() => setConfigOpen(true)}
            sx={{ textTransform: "none", borderRadius: "8px", fontSize: 13, fontWeight: 600 }}
          >
            {t("admin.userPoints.configBtn")}
          </Button>
        }
      />

      {/* Stat cards */}
      <Box sx={{ display: "flex", gap: "16px" }}>
        <StatCard
          label={t("admin.userPoints.statMonthly")}
          value={(stats?.grantedTotal ?? 0).toLocaleString()}
          valueColor="#D97706"
        />
        <StatCard
          label={t("admin.userPoints.statEmployees")}
          value={(stats?.coveredEmployees ?? 0).toLocaleString()}
          valueColor="#2563EB"
        />
        <StatCard
          label={t("admin.userPoints.statLastGrant")}
          value={stats?.lastGrantedAt ? stats.lastGrantedAt.slice(0, 10) : "—"}
        />
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: "8px", width: 280, height: 40, borderRadius: "8px", border: "1px solid #E2E8F0", bgcolor: "#fff", px: "12px" }}
        >
          <SearchIcon sx={{ fontSize: 18, color: "#64748B" }} />
          <InputBase
            placeholder={t("admin.userPoints.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setPage(1);
            }}
            sx={{ flex: 1, fontSize: 13, "& input::placeholder": { color: "#CBD5E1", opacity: 1 } }}
          />
        </Box>
        <Typography sx={{ fontSize: 13, color: "#64748B" }}>
          {t("admin.userPoints.totalCount", { count: total })}
        </Typography>
      </Box>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : rows.length === 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 2 }}>
          <TollIcon sx={{ fontSize: 48, color: "#CBD5E1" }} />
          <Typography sx={{ fontSize: 14, color: "#64748B" }}>{t("admin.userPoints.noData")}</Typography>
        </Box>
      ) : (
        <Box sx={{ borderRadius: "12px", border: "1px solid #F1F5F9", bgcolor: "#fff", overflow: "hidden" }}>
          <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#F8FAFC", px: "20px", py: "14px" }}>
            <Box sx={{ flex: 1 }}><Th t={t} k="thEmployee" /></Box>
            <Box sx={{ width: 120 }}><Th t={t} k="thBalance" /></Box>
            <Box sx={{ width: 120 }}><Th t={t} k="thEarned" /></Box>
            <Box sx={{ width: 120 }}><Th t={t} k="thUsed" /></Box>
            <Box sx={{ width: 90 }}><Th t={t} k="thActions" /></Box>
          </Box>
          {rows.map((u) => (
            <Box key={u.userId} sx={{ display: "flex", alignItems: "center", px: "20px", py: "14px", borderTop: "1px solid #F1F5F9" }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>
                  {u.nickname || u.username}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#94A3B8" }}>
                  {t("admin.userPoints.employeeNoLabel")}: {u.employeeNo || "—"}
                </Typography>
              </Box>
              <Box sx={{ width: 120 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#D97706" }}>
                  {(u.balance ?? 0).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ width: 120 }}>
                <Typography sx={{ fontSize: 13, color: "#16A34A" }}>
                  {(u.totalEarned ?? 0).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ width: 120 }}>
                <Typography sx={{ fontSize: 13, color: "#64748B" }}>
                  {(u.totalUsed ?? 0).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ width: 90, display: "flex", gap: "4px" }}>
                <Tooltip title={t("admin.userPoints.viewHistory")}>
                  <IconButton
                    size="small"
                    onClick={() =>
                      navigate(`/admin/user-points/${u.userId}`, { state: { user: u } })
                    }
                  >
                    <HistoryIcon sx={{ fontSize: 18, color: "#64748B" }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("admin.userPoints.adjust")}>
                  <IconButton size="small" onClick={() => setAdjustTarget(u)}>
                    <EditIcon sx={{ fontSize: 18, color: "#2563EB" }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Pagination */}
      {total > 0 && (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: "8px" }}>
          <Typography sx={{ fontSize: 13, color: "#64748B" }}>
            {t("admin.userPoints.showRange", { start, end, total })}
          </Typography>
          <Box sx={{ display: "flex", gap: "4px" }}>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                onClick={() => setPage(p)}
                sx={{ minWidth: 32, height: 32, p: 0, borderRadius: "6px", border: p === page ? "none" : "1px solid #E2E8F0", bgcolor: p === page ? "#2563EB" : "#fff", color: p === page ? "#fff" : "#64748B", fontSize: 13, "&:hover": { bgcolor: p === page ? "#2563EB" : "#F8FAFC" } }}
              >
                {p}
              </Button>
            ))}
          </Box>
        </Box>
      )}

      {adjustTarget && (
        <AdjustDialog
          target={adjustTarget}
          onClose={() => setAdjustTarget(null)}
          onDone={() => {
            setAdjustTarget(null);
            fetchData();
            fetchStats();
            snackbar.showSuccess(t("admin.userPoints.adjustSuccess"));
          }}
          onError={(msg) => snackbar.showError(msg)}
        />
      )}

      {configOpen && (
        <ConfigDialog
          onClose={() => setConfigOpen(false)}
          onDone={() => {
            setConfigOpen(false);
            fetchStats();
            snackbar.showSuccess(t("admin.userPoints.configSuccess"));
          }}
          onError={(msg) => snackbar.showError(msg)}
        />
      )}

      <AppSnackbar state={snackbar.state} onClose={snackbar.close} />
    </Box>
  );
}

function Th({ t, k }: { t: (k: string) => string; k: string }) {
  return <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>{t(`admin.userPoints.${k}`)}</Typography>;
}

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

// ---- US-022: distribution config dialog ----
function ConfigDialog({
  onClose,
  onDone,
  onError,
}: {
  onClose: () => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const { t } = useTranslation();
  const [config, setConfig] = useState<DistributionConfigDTO | null>(null);
  const [amount, setAmount] = useState("");
  const [grantDay, setGrantDay] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDistributionConfig()
      .then((c) => {
        setConfig(c);
        setAmount(c.amount != null ? String(c.amount) : "");
        setGrantDay(c.grantDay != null ? String(c.grantDay) : "");
        setEnabled(!!c.enabled);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const day = Number(grantDay);
  const canSave =
    amount !== "" && Number(amount) > 0 && day >= 1 && day <= 28;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await updateDistributionConfig({
        amount: Number(amount),
        grantDay: day,
        enabled,
        cycle: config?.cycle || "MONTHLY",
        targetRole: config?.targetRole || "employee",
      });
      onDone();
    } catch (err) {
      onError(err instanceof BusinessError ? err.message : t("admin.userPoints.configFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={onClose} slotProps={{ paper: { sx: { borderRadius: "12px", width: 440 } } }}>
      <DialogTitle sx={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>
        {t("admin.userPoints.configTitle")}
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: "16px", pt: "8px !important" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Field label={t("admin.userPoints.configAmount")}>
              <TextField fullWidth size="small" type="number" placeholder={t("admin.userPoints.configAmountPlaceholder")} value={amount} onChange={(e) => setAmount(e.target.value)} sx={fieldSx} />
            </Field>
            <Field label={t("admin.userPoints.configGrantDay")}>
              <TextField fullWidth size="small" type="number" placeholder="1-28" value={grantDay} onChange={(e) => setGrantDay(e.target.value)} sx={fieldSx} />
            </Field>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B" }}>
                {t("admin.userPoints.configEnabled")}
              </Typography>
              <Switch checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            </Box>
            <Typography sx={{ fontSize: 12, color: "#94A3B8" }}>
              {t("admin.userPoints.configCycleHint")}
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: "16px 24px" }}>
        <Button onClick={onClose} disabled={saving} sx={{ textTransform: "none", color: "#64748B", border: "1px solid #E2E8F0", borderRadius: "8px", px: "20px" }}>
          {t("common.cancel")}
        </Button>
        <Button variant="contained" disabled={saving || loading || !canSave} onClick={handleSave} sx={{ textTransform: "none", borderRadius: "8px", px: "20px", minWidth: 100 }}>
          {saving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
