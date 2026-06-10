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
import { getBalance, listTransactions } from "../../services/api/point";
import { listMyOrders } from "../../services/api/order";
import type { PointBalanceDTO, PointTransactionDTO, PageResult } from "../../types/api";
import { useAuthStore } from "../../store/useAuthStore";

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
  const [data, setData] = useState<PageResult<PointTransactionDTO> | null>(null);
  const [exchangeCount, setExchangeCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [b, txns, orders] = await Promise.all([
        getBalance(user.userId).catch(() => null),
        listTransactions({ userId: user.userId, page: 1, size: 50 }).catch(() => null),
        listMyOrders({ userId: user.userId, page: 1, size: 1 }).catch(() => null),
      ]);
      if (b) setBalance(b);
      if (txns) setData(txns);
      if (orders) setExchangeCount(orders.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const transactions = data?.records ?? [];
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
            return (
              <Box
                key={txn.id}
                sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: "20px", py: "14px", borderTop: "1px solid #F8FAFC" }}
              >
                <Box>
                  <Typography sx={{ fontSize: 14, color: "#1E293B" }}>{txn.description}</Typography>
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
      </Box>
    </Box>
  );
}
