import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TuneIcon from "@mui/icons-material/Tune";
import TollIcon from "@mui/icons-material/Toll";
import { getBalance, listTransactions } from "../../services/api/point";
import type {
  UserPointDTO,
  PointTransactionDTO,
  PageResult,
} from "../../types/api";
import { AppSnackbar, useSnackbar } from "../../components/AppSnackbar";
import AdjustDialog from "./AdjustDialog";

const PAGE_SIZE = 10;

const FILTERS = [
  { key: "all", test: () => true },
  { key: "income", test: (txn: PointTransactionDTO) => txn.amount >= 0 },
  { key: "expense", test: (txn: PointTransactionDTO) => txn.amount < 0 },
];

function StatCard({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <Box sx={{ flex: 1, bgcolor: "#fff", borderRadius: "12px", border: "1px solid #F1F5F9", p: "20px" }}>
      <Typography sx={{ fontSize: 13, color: "#64748B" }}>{label}</Typography>
      <Typography sx={{ fontSize: 26, fontWeight: 700, color: valueColor ?? "#1E293B", mt: "4px" }}>{value}</Typography>
    </Box>
  );
}

/**
 * US-020 detail: per-employee points change history (Admin - User Points History).
 * Reached from the employee points list via the history action.
 * Header info is passed through navigation state when available, otherwise the
 * balance is fetched so the page also works on a direct URL visit / refresh.
 */
export default function UserPointsHistory() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const snackbar = useSnackbar();
  const { userId: userIdParam } = useParams<{ userId: string }>();
  const userId = Number(userIdParam);

  const passed = (location.state as { user?: UserPointDTO } | null)?.user;
  const [target, setTarget] = useState<UserPointDTO | null>(passed ?? null);
  const [data, setData] = useState<PageResult<PointTransactionDTO> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [adjustOpen, setAdjustOpen] = useState(false);

  // Fetch balance to (re)build the header when state is missing or after an adjust.
  const refreshTarget = useCallback(async () => {
    if (!userId) return;
    try {
      const b = await getBalance(userId);
      setTarget((prev) => ({
        userId,
        username: prev?.username ?? "",
        nickname: prev?.nickname ?? prev?.username ?? `#${userId}`,
        employeeNo: prev?.employeeNo ?? "",
        balance: b.balance,
        totalEarned: b.totalEarned,
        totalUsed: b.totalUsed,
        updatedAt: prev?.updatedAt ?? "",
      }));
    } catch {
      // balance is best-effort; the history table is the core content
    }
  }, [userId]);

  useEffect(() => {
    // Always refresh balance/stats; keep passed name/employeeNo if present.
    refreshTarget();
  }, [refreshTarget]);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await listTransactions({ userId, page, size: PAGE_SIZE });
      setData(res);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [userId, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const transactions = data?.records ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;
  const start = transactions.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const end = start + transactions.length - 1;
  const activeFilter = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
  const filtered = transactions.filter(activeFilter.test);

  const fmt = (s?: string) => (s ? s.slice(0, 16).replace("T", " ") : "—");

  return (
    <Box sx={{ p: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Breadcrumb + title */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mb: "6px" }}>
            <Typography
              onClick={() => navigate("/admin/user-points")}
              sx={{ fontSize: 13, color: "#2563EB", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
            >
              {t("admin.userPoints.title")}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#CBD5E1" }}>/</Typography>
            <Typography sx={{ fontSize: 13, color: "#64748B" }}>{t("admin.userPoints.historyBreadcrumb")}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#1E293B" }}>
              {t("admin.userPoints.historyTitle", { name: target?.nickname || target?.username || `#${userId}` })}
            </Typography>
          </Box>
          {target?.employeeNo && (
            <Typography sx={{ fontSize: 13, color: "#94A3B8", mt: "4px" }}>
              {t("admin.userPoints.employeeNoLabel")}: {target.employeeNo}
            </Typography>
          )}
        </Box>
        {target && (
          <Button
            variant="contained"
            startIcon={<TuneIcon sx={{ fontSize: 16 }} />}
            onClick={() => setAdjustOpen(true)}
            sx={{ textTransform: "none", borderRadius: "8px", fontSize: 13, fontWeight: 600 }}
          >
            {t("admin.userPoints.adjust")}
          </Button>
        )}
      </Box>

      {/* Stat cards */}
      <Box sx={{ display: "flex", gap: "16px" }}>
        <StatCard label={t("admin.userPoints.currentBalance")} value={(target?.balance ?? 0).toLocaleString()} valueColor="#D97706" />
        <StatCard label={t("admin.userPoints.thEarned")} value={(target?.totalEarned ?? 0).toLocaleString()} valueColor="#16A34A" />
        <StatCard label={t("admin.userPoints.thUsed")} value={(target?.totalUsed ?? 0).toLocaleString()} />
        <StatCard label={t("admin.userPoints.historyChangeCount")} value={total.toLocaleString()} valueColor="#2563EB" />
      </Box>

      {/* Filter + table */}
      <Box sx={{ borderRadius: "12px", border: "1px solid #F1F5F9", bgcolor: "#fff", overflow: "hidden" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: "20px", py: "14px", borderBottom: "1px solid #F1F5F9" }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#1E293B" }}>
            {t("admin.userPoints.historyTableTitle")}
          </Typography>
          <Box sx={{ display: "flex", gap: "4px" }}>
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <Button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  sx={{
                    textTransform: "none",
                    borderRadius: "6px",
                    minWidth: "auto",
                    px: "12px",
                    py: "4px",
                    fontSize: 12,
                    fontWeight: active ? 600 : 400,
                    color: active ? "#fff" : "#64748B",
                    bgcolor: active ? "#2563EB" : "transparent",
                    "&:hover": { bgcolor: active ? "#2563EB" : "#F8FAFC" },
                  }}
                >
                  {t(`admin.userPoints.filter.${f.key}`)}
                </Button>
              );
            })}
          </Box>
        </Box>

        {/* Table header */}
        <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#F8FAFC", px: "20px", py: "12px" }}>
          <Box sx={{ width: 150 }}><Th t={t} k="historyThTime" /></Box>
          <Box sx={{ width: 100 }}><Th t={t} k="historyThType" /></Box>
          <Box sx={{ width: 100 }}><Th t={t} k="historyThAmount" /></Box>
          <Box sx={{ width: 120 }}><Th t={t} k="historyThBalance" /></Box>
          <Box sx={{ flex: 1 }}><Th t={t} k="historyThReason" /></Box>
          <Box sx={{ width: 110 }}><Th t={t} k="historyThOperator" /></Box>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 2 }}>
            <TollIcon sx={{ fontSize: 44, color: "#CBD5E1" }} />
            <Typography sx={{ fontSize: 14, color: "#64748B" }}>{t("admin.userPoints.historyNoData")}</Typography>
          </Box>
        ) : (
          filtered.map((txn) => {
            const positive = txn.amount >= 0;
            return (
              <Box key={txn.id} sx={{ display: "flex", alignItems: "center", px: "20px", py: "13px", borderTop: "1px solid #F1F5F9" }}>
                <Box sx={{ width: 150 }}>
                  <Typography sx={{ fontSize: 12, color: "#64748B" }}>{fmt(txn.createdAt)}</Typography>
                </Box>
                <Box sx={{ width: 100 }}>
                  <Typography sx={{ fontSize: 12, color: "#1E293B" }}>{txn.type || "—"}</Typography>
                </Box>
                <Box sx={{ width: 100 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: positive ? "#16A34A" : "#DC2626" }}>
                    {positive ? "+" : ""}
                    {txn.amount.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ width: 120 }}>
                  <Typography sx={{ fontSize: 13, color: "#1E293B" }}>{txn.balance?.toLocaleString() ?? "—"}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 13, color: "#64748B" }}>{txn.description || "—"}</Typography>
                </Box>
                <Box sx={{ width: 110 }}>
                  <Typography sx={{ fontSize: 13, color: "#64748B" }}>{txn.operator || "—"}</Typography>
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      {/* Pagination */}
      {total > 0 && pages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: "4px" }}>
          <Typography sx={{ fontSize: 13, color: "#64748B" }}>
            {t("admin.userPoints.showRangeRecords", { start, end, total })}
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

      {adjustOpen && target && (
        <AdjustDialog
          target={target}
          onClose={() => setAdjustOpen(false)}
          onDone={() => {
            setAdjustOpen(false);
            refreshTarget();
            fetchData();
            snackbar.showSuccess(t("admin.userPoints.adjustSuccess"));
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
