import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import Chip from "@mui/material/Chip";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import GroupIcon from "@mui/icons-material/Group";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import TollIcon from "@mui/icons-material/Toll";
import AdminPageHeader from "../../components/AdminPageHeader";
import { listProducts, getProductStats } from "../../services/api/product";
import { listUsers, getUserStats } from "../../services/api/user";
import {
  listExchangeRecords,
  getExchangeRecordStats,
} from "../../services/api/exchangeRecord";
import type { ExchangeRecordDTO } from "../../types/api";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  COMPLETED: { label: "已完成", color: "#166534", bg: "#DCFCE7" },
  PENDING_DELIVERY: { label: "待发货", color: "#1E40AF", bg: "#DBEAFE" },
  DELIVERING: { label: "配送中", color: "#92400E", bg: "#FEF3C7" },
  CANCELLED: { label: "已取消", color: "#991B1B", bg: "#FEE2E2" },
};

function fmtTime(s?: string): string {
  if (!s) return "—";
  return s.replace("T", " ").slice(5, 16);
}

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [totalProducts, setTotalProducts] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRedemptions, setTotalRedemptions] = useState(0);
  const [pointsConsumed, setPointsConsumed] = useState(0);
  const [recentOrders, setRecentOrders] = useState<ExchangeRecordDTO[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [productStats, userStats, stats, orders] = await Promise.all([
          getProductStats().catch(() => null),
          getUserStats().catch(() => null),
          getExchangeRecordStats(),
          listExchangeRecords({ page: 1, size: 5 }),
        ]);
        // Fall back to list totals if the dedicated stats endpoints are unavailable.
        if (productStats) {
          setTotalProducts(productStats.totalProducts ?? 0);
        } else {
          const p = await listProducts({ page: 1, size: 1 }).catch(() => null);
          setTotalProducts(p?.total ?? 0);
        }
        if (userStats) {
          setTotalUsers(userStats.totalUsers ?? 0);
        } else {
          const u = await listUsers({ page: 1, size: 1 }).catch(() => null);
          setTotalUsers(u?.total ?? 0);
        }
        setTotalRedemptions(stats.totalCount ?? 0);
        setPointsConsumed(stats.totalPointsConsumed ?? 0);
        setRecentOrders(orders.records ?? []);
      } catch {
        /* 后端不可用时保持 0 值，不阻塞渲染 */
      }
    })();
  }, []);

  const METRICS = [
    {
      key: "totalProducts",
      value: String(totalProducts),
      change: t("admin.metrics.totalProducts"),
      changeColor: "#64748B",
      icon: Inventory2Icon,
      iconColor: "#2563EB",
      iconBg: "#EFF6FF",
    },
    {
      key: "totalUsers",
      value: String(totalUsers),
      change: t("admin.metrics.totalUsers"),
      changeColor: "#64748B",
      icon: GroupIcon,
      iconColor: "#16A34A",
      iconBg: "#DCFCE7",
    },
    {
      key: "monthlyRedemptions",
      value: String(totalRedemptions),
      change: t("admin.metrics.monthlyRedemptions"),
      changeColor: "#D97706",
      icon: ShoppingCartIcon,
      iconColor: "#D97706",
      iconBg: "#FEF3C7",
    },
    {
      key: "pointsCirculation",
      value: pointsConsumed.toLocaleString(),
      change: t("admin.metrics.pointsCirculation"),
      changeColor: "#64748B",
      icon: TollIcon,
      iconColor: "#7C3AED",
      iconBg: "#EDE9FE",
    },
  ];

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: "24px", p: "32px" }}
    >
      <AdminPageHeader title={t("admin.dashboard")} />

      {/* Metric Cards - design: gap 20 */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
        }}
      >
        {METRICS.map((metric) => {
          const IconComp = metric.icon;
          return (
            <Paper
              key={metric.key}
              elevation={0}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "#F1F5F9",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                  {t(`admin.metrics.${metric.key}`)}
                </Typography>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: metric.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconComp sx={{ fontSize: 20, color: metric.iconColor }} />
                </Box>
              </Box>
              <Typography
                sx={{ fontSize: 28, fontWeight: 700, color: "text.primary" }}
              >
                {metric.value}
              </Typography>
              <Typography sx={{ fontSize: 12, color: metric.changeColor }}>
                {metric.change}
              </Typography>
            </Paper>
          );
        })}
      </Box>

      {/* Recent Orders Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "#F1F5F9",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2.5,
            py: 2,
            borderBottom: "1px solid",
            borderColor: "#F1F5F9",
          }}
        >
          <Typography
            sx={{ fontSize: 16, fontWeight: 600, color: "text.primary" }}
          >
            {t("admin.recentOrders")}
          </Typography>
          <Link
            component="button"
            underline="none"
            onClick={() => navigate("/admin/orders")}
            sx={{ fontSize: 13, color: "primary.main" }}
          >
            {t("admin.viewAll")} →
          </Link>
        </Box>

        {recentOrders.length === 0 ? (
          <Box sx={{ textAlign: "center", py: "32px", color: "text.secondary", fontSize: 13 }}>
            暂无兑换记录
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {recentOrders.map((order) => {
              const statusCfg = STATUS_CONFIG[order.status] ?? {
                label: order.status,
                color: "#64748B",
                bg: "#F1F5F9",
              };
              const initial = (order.employeeName || "?").charAt(0);
              return (
                <Box
                  key={order.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    px: "20px",
                    py: "14px",
                    borderTop: "1px solid #F1F5F9",
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      bgcolor: "#EFF6FF",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#2563EB" }}>{initial}</Typography>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}>
                      {order.employeeName}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 12, color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {order.productName}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#D97706", flexShrink: 0 }}>
                    {order.pointsCost?.toLocaleString()}
                  </Typography>
                  <Chip
                    label={statusCfg.label}
                    size="small"
                    sx={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: statusCfg.color,
                      bgcolor: statusCfg.bg,
                      borderRadius: "12px",
                      height: 24,
                      flexShrink: 0,
                    }}
                  />
                  <Typography sx={{ fontSize: 12, color: "text.secondary", width: 90, textAlign: "right", flexShrink: 0 }}>
                    {fmtTime(order.exchangeTime)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
