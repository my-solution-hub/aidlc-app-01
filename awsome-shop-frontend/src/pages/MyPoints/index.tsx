import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import StarIcon from "@mui/icons-material/Star";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import RuleIcon from "@mui/icons-material/Rule";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CelebrationIcon from "@mui/icons-material/Celebration";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import TollIcon from "@mui/icons-material/Toll";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getBalance, listTransactions } from "../../services/api/point";
import { listMyOrders } from "../../services/api/order";
import type { PointBalanceDTO, PointTransactionDTO } from "../../types/api";
import { useAuthStore } from "../../store/useAuthStore";
import { pointTypeLabel, pointTypeStyle } from "../../utils/pointType";

const PAGE_SIZE = 10;

const EARN_WAYS = [
  { key: "seniority", icon: WorkHistoryIcon, color: "#2563EB", bg: "#EFF6FF" },
  { key: "performance", icon: EmojiEventsIcon, color: "#D97706", bg: "#FFF7ED" },
  { key: "holiday", icon: CelebrationIcon, color: "#16A34A", bg: "#DCFCE7" },
  { key: "contribution", icon: VolunteerActivismIcon, color: "#DC2626", bg: "#FEE2E2" },
];

const FILTERS = [
  { key: "all", test: () => true },
  { key: "income", test: (t: PointTransactionDTO) => t.amount >= 0 },
  { key: "expense", test: (t: PointTransactionDTO) => t.amount < 0 },
];

export default function MyPoints() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [balance, setBalance] = useState<PointBalanceDTO | null>(null);
  const [transactions, setTransactions] = useState<PointTransactionDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [exchangeCount, setExchangeCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState("all");

  // Initial load: balance, exchange count and the first page of transactions.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const userId = user.userId;
    (async () => {
      setLoading(true);
      try {
        const [b, txns, orders] = await Promise.all([
          getBalance(userId).catch(() => null),
          listTransactions({ userId, page: 1, size: PAGE_SIZE }).catch(() => null),
          listMyOrders({ userId, page: 1, size: 1 }).catch(() => null),
        ]);
        if (cancelled) return;
        if (b) setBalance(b);
        if (txns) {
          setTransactions(txns.records ?? []);
          setTotal(txns.total ?? 0);
        }
        if (orders) setExchangeCount(orders.total ?? 0);
        setPage(1);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const loadMore = useCallback(async () => {
    if (!user) return;
    const next = page + 1;
    setLoadingMore(true);
    try {
      const res = await listTransactions({ userId: user.userId, page: next, size: PAGE_SIZE });
      setTransactions((prev) => [...prev, ...(res.records ?? [])]);
      setTotal(res.total ?? 0);
      setPage(next);
    } catch {
      // handled by interceptor
    } finally {
      setLoadingMore(false);
    }
  }, [user, page]);

  const hasMore = transactions.length < total;
  const activeFilter = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
  const filtered = useMemo(() => transactions.filter(activeFilter.test), [transactions, activeFilter]);

  const quickEntries = [
    { key: "shop", icon: StorefrontIcon, color: "#2563EB", bg: "#EFF6FF", onClick: () => navigate("/") },
    { key: "orders", icon: ReceiptLongIcon, color: "#D97706", bg: "#FFF7ED", onClick: () => navigate("/orders") },
    { key: "rules", icon: RuleIcon, color: "#16A34A", bg: "#DCFCE7", onClick: () => document.getElementById("earn-ways")?.scrollIntoView({ behavior: "smooth" }) },
    { key: "help", icon: HelpOutlineIcon, color: "#DC2626", bg: "#FEE2E2", onClick: () => document.getElementById("earn-ways")?.scrollIntoView({ behavior: "smooth" }) },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: "24px 32px" }}>
      {/* Gradient hero card */}
      <Box
        sx={{
          borderRadius: "12px",
          background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
          p: "28px 32px",
          color: "#fff",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>
              {t("employee.pointsCenter.availableTitle")}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: "8px", mt: "4px" }}>
              <Typography sx={{ fontSize: 44, fontWeight: 700, lineHeight: 1 }}>
                {(balance?.balance ?? 0).toLocaleString()}
              </Typography>
              <Typography sx={{ fontSize: 16, color: "rgba(255,255,255,0.85)" }}>
                {t("employee.points")}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <StarIcon sx={{ fontSize: 26, color: "#fff" }} />
          </Box>
        </Box>

        <Box sx={{ display: "flex", mt: "24px", gap: "32px" }}>
          {[
            { label: t("employee.pointsCenter.totalEarned"), value: balance?.totalEarned ?? 0 },
            { label: t("employee.pointsCenter.totalUsed"), value: balance?.totalUsed ?? 0 },
            { label: t("employee.pointsCenter.exchangeCount"), value: exchangeCount },
          ].map((stat, i) => (
            <Box key={i} sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
                {stat.value.toLocaleString()}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>{stat.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Quick entries */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {quickEntries.map((entry) => {
          const Icon = entry.icon;
          return (
            <Box
              key={entry.key}
              onClick={entry.onClick}
              sx={{
                bgcolor: "#fff",
                borderRadius: "12px",
                border: "1px solid #F1F5F9",
                p: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                "&:hover": { boxShadow: 2 },
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  bgcolor: entry.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon sx={{ fontSize: 22, color: entry.color }} />
              </Box>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#1E293B" }}>
                {t(`employee.pointsCenter.quick.${entry.key}`)}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Earn ways */}
      <Box
        id="earn-ways"
        sx={{ bgcolor: "#fff", borderRadius: "12px", border: "1px solid #F1F5F9", p: "24px", display: "flex", flexDirection: "column", gap: "16px" }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#1E293B" }}>
          {t("employee.pointsCenter.earnWaysTitle")}
        </Typography>
        <Box sx={{ height: "1px", bgcolor: "#F1F5F9" }} />
        {EARN_WAYS.map((way) => {
          const Icon = way.icon;
          return (
            <Box key={way.key} sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Box
                sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: way.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                <Icon sx={{ fontSize: 20, color: way.color }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>
                  {t(`employee.pointsCenter.earnWays.${way.key}.title`)}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#64748B" }}>
                  {t(`employee.pointsCenter.earnWays.${way.key}.desc`)}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#16A34A" }}>
                {t(`employee.pointsCenter.earnWays.${way.key}.amount`)}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Transactions */}
      <Box sx={{ bgcolor: "#fff", borderRadius: "12px", border: "1px solid #F1F5F9", overflow: "hidden" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: "20px", borderBottom: "1px solid #F1F5F9" }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#1E293B" }}>
            {t("employee.pointsCenter.transactions")}
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
                  {t(`employee.pointsCenter.filter.${f.key}`)}
                </Button>
              );
            })}
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6, gap: 2 }}>
            <TollIcon sx={{ fontSize: 40, color: "#CBD5E1" }} />
            <Typography sx={{ fontSize: 14, color: "#64748B" }}>
              {t("employee.pointsCenter.noTransactions")}
            </Typography>
          </Box>
        ) : (
          filtered.map((txn) => {
            const positive = txn.amount >= 0;
            const typeStyle = pointTypeStyle(txn.type);
            return (
              <Box
                key={txn.id}
                sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: "20px", py: "14px", borderTop: "1px solid #F8FAFC" }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Typography sx={{ fontSize: 14, color: "#1E293B" }}>{txn.description}</Typography>
                    <Box sx={{ borderRadius: "10px", bgcolor: typeStyle.bgColor, px: "8px", py: "2px", flexShrink: 0 }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 600, color: typeStyle.textColor, whiteSpace: "nowrap" }}>
                        {pointTypeLabel(txn.type, t)}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: 12, color: "#94A3B8" }}>
                    {(txn.createdAt ?? "").slice(0, 16).replace("T", " ")}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: positive ? "#16A34A" : "#DC2626" }}>
                    {positive ? "+" : ""}
                    {txn.amount.toLocaleString()}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "#94A3B8" }}>
                    {t("employee.pointsCenter.thBalance")}: {txn.balance?.toLocaleString() ?? "—"}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}

        {/* Load more */}
        {!loading && hasMore && (
          <Box sx={{ display: "flex", justifyContent: "center", py: "14px", borderTop: "1px solid #F8FAFC" }}>
            <Button
              onClick={loadMore}
              disabled={loadingMore}
              endIcon={loadingMore ? <CircularProgress size={14} /> : <ExpandMoreIcon />}
              sx={{ textTransform: "none", fontSize: 13, fontWeight: 500, color: "#2563EB" }}
            >
              {t("employee.pointsCenter.loadMore")}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
