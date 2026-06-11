import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import InputBase from "@mui/material/InputBase";
import CircularProgress from "@mui/material/CircularProgress";
import SearchIcon from "@mui/icons-material/Search";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import { listMyOrders } from "../../services/api/order";
import type { ExchangeRecordDTO, PageResult } from "../../types/api";
import { useAuthStore } from "../../store/useAuthStore";
import { statusStyle, STATUS_I18N } from "../../utils/orderStatus";

const PAGE_SIZE = 5;

const TABS: { key: string; status: string }[] = [
  { key: "all", status: "" },
  { key: "pending", status: "PENDING_DELIVERY" },
  { key: "delivering", status: "DELIVERING" },
  { key: "completed", status: "COMPLETED" },
  { key: "cancelled", status: "CANCELLED" },
];

export default function MyOrders() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [data, setData] = useState<PageResult<ExchangeRecordDTO> | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce the keyword input by 300ms before filtering.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await listMyOrders({
        userId: user.userId,
        page,
        size: PAGE_SIZE,
        status: tab || undefined,
      });
      setData(res);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [user, page, tab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const records = data?.records ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  // Client-side keyword filter (employee list endpoint has no keyword param).
  const filtered = useMemo(() => {
    const kw = debouncedSearch.trim().toLowerCase();
    if (!kw) return records;
    return records.filter(
      (r) =>
        r.orderNo?.toLowerCase().includes(kw) ||
        r.productName?.toLowerCase().includes(kw),
    );
  }, [records, debouncedSearch]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: "24px 32px" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#1E293B" }}>
            {t("employee.orders.title")}
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#64748B" }}>
            {t("employee.orders.subtitle")}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            width: 280,
            height: 40,
            borderRadius: "8px",
            border: "1px solid #E2E8F0",
            bgcolor: "#fff",
            px: "12px",
          }}
        >
          <SearchIcon sx={{ fontSize: 18, color: "#64748B" }} />
          <InputBase
            placeholder={t("employee.orders.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, fontSize: 13, "& input::placeholder": { color: "#CBD5E1", opacity: 1 } }}
          />
        </Box>
      </Box>

      {/* Tabs */}
      <Box
        sx={{
          display: "flex",
          gap: "8px",
          bgcolor: "#fff",
          border: "1px solid #F1F5F9",
          borderRadius: "10px",
          p: "8px",
        }}
      >
        {TABS.map((tabItem) => {
          const active = tab === tabItem.status;
          return (
            <Button
              key={tabItem.key}
              onClick={() => {
                setTab(tabItem.status);
                setPage(1);
              }}
              sx={{
                textTransform: "none",
                borderRadius: "8px",
                px: "16px",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? "#fff" : "#64748B",
                bgcolor: active ? "#2563EB" : "transparent",
                "&:hover": { bgcolor: active ? "#2563EB" : "#F8FAFC" },
              }}
            >
              {t(`employee.orders.tab.${tabItem.key}`)}
            </Button>
          );
        })}
      </Box>

      {/* List */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 2 }}>
          <ReceiptLongIcon sx={{ fontSize: 48, color: "#CBD5E1" }} />
          <Typography sx={{ fontSize: 14, color: "#64748B" }}>
            {t("employee.orders.noRecords")}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filtered.map((record) => {
            const style = statusStyle(record.status);
            return (
              <Box
                key={record.id}
                sx={{ bgcolor: "#fff", borderRadius: "12px", border: "1px solid #F1F5F9", overflow: "hidden" }}
              >
                {/* Card header */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: "20px",
                    py: "12px",
                    borderBottom: "1px solid #F8FAFC",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Typography sx={{ fontSize: 13, color: "#64748B" }}>
                      {t("employee.orders.thOrderNo")}: {record.orderNo}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#94A3B8" }}>
                      {(record.exchangeTime ?? record.createdAt ?? "").slice(0, 16).replace("T", " ")}
                    </Typography>
                  </Box>
                  <Box sx={{ borderRadius: "12px", bgcolor: style.bgColor, px: "10px", py: "3px" }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: style.textColor }}>
                      {STATUS_I18N[record.status] ? t(STATUS_I18N[record.status]) : record.status}
                    </Typography>
                  </Box>
                </Box>

                {/* Product row */}
                <Box sx={{ display: "flex", alignItems: "center", gap: "12px", px: "20px", py: "14px" }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "8px",
                      bgcolor: "#EFF6FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {record.productImageUrl ? (
                      <Box component="img" src={record.productImageUrl} alt={record.productName} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <Inventory2Icon sx={{ fontSize: 28, color: "#2563EB" }} />
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>
                      {record.productName}
                    </Typography>
                    {record.productDesc && (
                      <Typography sx={{ fontSize: 12, color: "#64748B" }}>{record.productDesc}</Typography>
                    )}
                    {record.quantity != null && (
                      <Typography sx={{ fontSize: 12, color: "#94A3B8" }}>x{record.quantity}</Typography>
                    )}
                  </Box>
                  <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#2563EB" }}>
                    {(record.pointsCost ?? 0).toLocaleString()} {t("employee.points")}
                  </Typography>
                </Box>

                {/* Card footer */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: "20px",
                    py: "12px",
                    borderTop: "1px solid #F8FAFC",
                  }}
                >
                  <Typography sx={{ fontSize: 12, color: "#64748B" }}>
                    {record.trackingNumber
                      ? `${t("employee.orders.tracking")}: ${record.trackingNumber}`
                      : ""}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/orders/${record.id}`)}
                    sx={{ textTransform: "none", borderRadius: "8px", fontSize: 12, fontWeight: 600 }}
                  >
                    {t("employee.orders.viewDetail")}
                  </Button>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Pagination */}
      {total > 0 && pages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: "4px" }}>
          <Typography sx={{ fontSize: 13, color: "#64748B" }}>
            {t("employee.orders.showRange", { start: (page - 1) * PAGE_SIZE + 1, end: Math.min(page * PAGE_SIZE, total), total })}
          </Typography>
          <Box sx={{ display: "flex", gap: "4px" }}>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                onClick={() => setPage(p)}
                sx={{
                  minWidth: 32,
                  height: 32,
                  p: 0,
                  borderRadius: "6px",
                  border: p === page ? "none" : "1px solid #E2E8F0",
                  bgcolor: p === page ? "#2563EB" : "#fff",
                  color: p === page ? "#fff" : "#64748B",
                  fontSize: 13,
                  "&:hover": { bgcolor: p === page ? "#2563EB" : "#F8FAFC" },
                }}
              >
                {p}
              </Button>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
