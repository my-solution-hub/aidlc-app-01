import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import InputBase from "@mui/material/InputBase";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TollIcon from "@mui/icons-material/Toll";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import WatchIcon from "@mui/icons-material/Watch";
import RedeemIcon from "@mui/icons-material/Redeem";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import DevicesIcon from "@mui/icons-material/Devices";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AdminPageHeader from "../../components/AdminPageHeader";
import {
  listExchangeRecords,
  getExchangeRecordStats,
} from "../../services/api/exchangeRecord";
import type {
  ExchangeRecordDTO,
  ExchangeRecordStatsDTO,
  PageResult,
} from "../../types/api";
import { AppSnackbar, useSnackbar } from "../../components/AppSnackbar";

// ---- Status chip styling ----

interface StatusStyle {
  textColor: string;
  bgColor: string;
}

const STATUS_STYLES: Record<string, StatusStyle> = {
  PENDING_DELIVERY: { textColor: "#D97706", bgColor: "#FFF7ED" },
  DELIVERING: { textColor: "#2563EB", bgColor: "#EFF6FF" },
  COMPLETED: { textColor: "#166534", bgColor: "#DCFCE7" },
  CANCELLED: { textColor: "#991B1B", bgColor: "#FEE2E2" },
};

const STATUS_I18N: Record<string, string> = {
  PENDING_DELIVERY: "admin.exchangeRecords.statusPending",
  DELIVERING: "admin.exchangeRecords.statusDelivering",
  COMPLETED: "admin.exchangeRecords.statusCompleted",
  CANCELLED: "admin.exchangeRecords.statusCancelled",
};

// ---- Product row icon styles (cycle through for visual variety) ----

const PRODUCT_ICON_STYLES: {
  icon: React.ElementType;
  color: string;
  bg: string;
}[] = [
  { icon: HeadphonesIcon, color: "#2563EB", bg: "#DBEAFE" },
  { icon: WatchIcon, color: "#8B5CF6", bg: "#F5F3FF" },
  { icon: RedeemIcon, color: "#F59E0B", bg: "#FFF7ED" },
  { icon: ShoppingBagIcon, color: "#10B981", bg: "#ECFDF5" },
  { icon: DevicesIcon, color: "#EC4899", bg: "#FDF2F8" },
];

// ---- Date range helpers ----

function getDateRange(range: string): { startTime?: string; endTime?: string } {
  if (!range) return {};
  const now = new Date();
  const end = now.toISOString();
  const start = new Date(now);
  if (range === "7") start.setDate(start.getDate() - 7);
  else if (range === "30") start.setDate(start.getDate() - 30);
  else if (range === "90") start.setDate(start.getDate() - 90);
  else return {};
  return { startTime: start.toISOString(), endTime: end };
}

// ---- Component ----

export default function ExchangeRecordList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [data, setData] = useState<PageResult<ExchangeRecordDTO> | null>(null);
  const [stats, setStats] = useState<ExchangeRecordStatsDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState("30");
  const pageSize = 5;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const dateParams = getDateRange(dateRange);
      const res = await listExchangeRecords({
        page,
        size: pageSize,
        keyword: search || undefined,
        status: statusFilter || undefined,
        ...dateParams,
      });
      setData(res);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch stats once on mount
  useEffect(() => {
    getExchangeRecordStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  const records = data?.records ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;
  const start = records.length > 0 ? (page - 1) * pageSize + 1 : 0;
  const end = start + records.length - 1;

  // Open detail dialog by fetching the full record
  // Client-side CSV export of the current page's records
  const handleExport = () => {
    if (records.length === 0) {
      snackbar.showError(t("admin.exchangeRecords.exportNoData"));
      return;
    }
    const headers = [
      t("admin.exchangeRecords.thOrderNo"),
      t("admin.exchangeRecords.thProduct"),
      t("admin.exchangeRecords.thEmployee"),
      t("admin.exchangeRecords.thPoints"),
      t("admin.exchangeRecords.thTime"),
      t("admin.exchangeRecords.thStatus"),
    ];
    const escapeCsv = (val: string) =>
      `"${String(val ?? "").replace(/"/g, '""')}"`;
    const rows = records.map((r) =>
      [
        r.orderNo,
        r.productName,
        r.employeeName,
        r.pointsCost,
        r.exchangeTime,
        r.status,
      ]
        .map((v) => escapeCsv(String(v ?? "")))
        .join(","),
    );
    const csv = [headers.map(escapeCsv).join(","), ...rows].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `exchange-records-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setPage(1);
      fetchData();
    }
  };

  const formatNumber = (n: number | undefined) => {
    if (n == null) return "—";
    return n.toLocaleString();
  };

  return (
    <Box
      sx={{ p: "32px", display: "flex", flexDirection: "column", gap: "20px" }}
    >
      <AdminPageHeader
        title={t("admin.exchangeRecords.title")}
        subtitle={t("admin.exchangeRecords.subtitle")}
        actions={
          <ButtonBase
            onClick={handleExport}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              bgcolor: "#fff",
              color: "#1E293B",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
              px: "20px",
              py: "10px",
              "&:hover": { bgcolor: "#F8FAFC" },
            }}
          >
            <DownloadIcon sx={{ fontSize: 18 }} />
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 500,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {t("admin.exchangeRecords.export")}
            </Typography>
          </ButtonBase>
        }
      />

      {/* Stat Cards */}
      <Box sx={{ display: "flex", gap: "16px" }}>
        <StatCard
          icon={<ShoppingCartIcon sx={{ fontSize: 18, color: "#2563EB" }} />}
          iconBg="#EFF6FF"
          label={t("admin.exchangeRecords.statTotal")}
          value={formatNumber(stats?.totalCount)}
        />
        <StatCard
          icon={<LocalShippingIcon sx={{ fontSize: 18, color: "#F59E0B" }} />}
          iconBg="#FFF7ED"
          label={t("admin.exchangeRecords.statPending")}
          value={formatNumber(stats?.pendingDeliveryCount)}
          valueColor="#F59E0B"
        />
        <StatCard
          icon={<CheckCircleIcon sx={{ fontSize: 18, color: "#10B981" }} />}
          iconBg="#ECFDF5"
          label={t("admin.exchangeRecords.statCompleted")}
          value={formatNumber(stats?.completedCount)}
          valueColor="#10B981"
        />
        <StatCard
          icon={<TollIcon sx={{ fontSize: 18, color: "#8B5CF6" }} />}
          iconBg="#F5F3FF"
          label={t("admin.exchangeRecords.statPoints")}
          value={formatNumber(stats?.totalPointsConsumed)}
        />
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Search */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            width: 260,
            height: 38,
            borderRadius: "8px",
            border: "1px solid #E2E8F0",
            bgcolor: "#fff",
            px: "12px",
          }}
        >
          <SearchIcon sx={{ fontSize: 18, color: "#64748B" }} />
          <InputBase
            placeholder={t("admin.exchangeRecords.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{
              flex: 1,
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
              "& input::placeholder": { color: "#94A3B8", opacity: 1 },
            }}
          />
        </Box>

        {/* Status filter */}
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          displayEmpty
          size="small"
          sx={{
            height: 38,
            borderRadius: "8px",
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            color: "#1E293B",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
            "& .MuiSelect-select": { py: "8px", px: "14px" },
          }}
        >
          <MenuItem value="">{t("admin.exchangeRecords.allStatus")}</MenuItem>
          <MenuItem value="PENDING_DELIVERY">
            {t("admin.exchangeRecords.statusPending")}
          </MenuItem>
          <MenuItem value="DELIVERING">
            {t("admin.exchangeRecords.statusDelivering")}
          </MenuItem>
          <MenuItem value="COMPLETED">
            {t("admin.exchangeRecords.statusCompleted")}
          </MenuItem>
          <MenuItem value="CANCELLED">
            {t("admin.exchangeRecords.statusCancelled")}
          </MenuItem>
        </Select>

        {/* Date range filter */}
        <Select
          value={dateRange}
          onChange={(e) => {
            setDateRange(e.target.value);
            setPage(1);
          }}
          displayEmpty
          size="small"
          startAdornment={
            <CalendarTodayIcon
              sx={{ fontSize: 16, color: "#64748B", mr: "6px" }}
            />
          }
          sx={{
            height: 38,
            borderRadius: "8px",
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            color: "#1E293B",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
            "& .MuiSelect-select": {
              py: "8px",
              px: "14px",
              display: "flex",
              alignItems: "center",
            },
          }}
        >
          <MenuItem value="7">{t("admin.exchangeRecords.last7days")}</MenuItem>
          <MenuItem value="30">
            {t("admin.exchangeRecords.last30days")}
          </MenuItem>
          <MenuItem value="90">
            {t("admin.exchangeRecords.last90days")}
          </MenuItem>
          <MenuItem value="">{t("admin.exchangeRecords.allTime")}</MenuItem>
        </Select>
      </Box>

      {/* Table card — scrollable */}
      <Box>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : records.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 8,
              gap: 2,
            }}
          >
            <ReceiptLongIcon sx={{ fontSize: 48, color: "#CBD5E1" }} />
            <Typography sx={{ fontSize: 14, color: "#64748B" }}>
              {t("admin.exchangeRecords.noRecords")}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              borderRadius: "12px",
              border: "1px solid #F1F5F9",
              bgcolor: "#fff",
              overflow: "hidden",
            }}
          >
            {/* Table header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "#F8FAFC",
                px: "20px",
                py: "12px",
              }}
            >
              <Box sx={{ width: 130, display: "flex", alignItems: "center" }}>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#64748B",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {t("admin.exchangeRecords.thOrderNo")}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#64748B",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {t("admin.exchangeRecords.thProduct")}
                </Typography>
              </Box>
              <Box sx={{ width: 100, display: "flex", alignItems: "center" }}>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#64748B",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {t("admin.exchangeRecords.thEmployee")}
                </Typography>
              </Box>
              <Box sx={{ width: 90, display: "flex", alignItems: "center" }}>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#64748B",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {t("admin.exchangeRecords.thPoints")}
                </Typography>
              </Box>
              <Box sx={{ width: 110, display: "flex", alignItems: "center" }}>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#64748B",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {t("admin.exchangeRecords.thTime")}
                </Typography>
              </Box>
              <Box sx={{ width: 90, display: "flex", alignItems: "center" }}>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#64748B",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {t("admin.exchangeRecords.thStatus")}
                </Typography>
              </Box>
              <Box sx={{ width: 80, display: "flex", alignItems: "center" }}>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#64748B",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {t("admin.exchangeRecords.thActions")}
                </Typography>
              </Box>
            </Box>

            {/* Table rows */}
            {records.map((record, idx) => (
              <RecordRow
                key={record.id}
                record={record}
                rowIndex={idx}
                onDetail={() => navigate(`/admin/orders/${record.id}`)}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Pagination */}
      {total > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: "8px",
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              color: "#64748B",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {t("admin.exchangeRecords.showRange", { start, end, total })}
          </Typography>
          <Box sx={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <PageBtn
              label="<"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            />
            {buildPageNumbers(page, pages).map((p, i) =>
              p === "..." ? (
                <Typography
                  key={`ellipsis-${i}`}
                  sx={{ fontSize: 13, color: "#64748B", px: "4px" }}
                >
                  ...
                </Typography>
              ) : (
                <PageBtn
                  key={p}
                  label={String(p)}
                  active={p === page}
                  onClick={() => setPage(p as number)}
                />
              ),
            )}
            <PageBtn
              label=">"
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
            />
          </Box>
        </Box>
      )}

      {/* Detail dialog */}
      <AppSnackbar state={snackbar.state} onClose={snackbar.close} />
    </Box>
  );
}

// ---- Stat Card ----

function StatCard({
  icon,
  iconBg,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        bgcolor: "#fff",
        borderRadius: "12px",
        border: "1px solid #F1F5F9",
        padding: "18px 20px",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "8px",
            bgcolor: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 500,
            color: "#64748B",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {label}
        </Typography>
      </Box>
      <Typography
        sx={{
          fontSize: 28,
          fontWeight: 700,
          color: valueColor ?? "#1E293B",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

// ---- Record Row ----

function RecordRow({
  record,
  rowIndex,
  onDetail,
}: {
  record: ExchangeRecordDTO;
  rowIndex: number;
  onDetail: () => void;
}) {
  const { t } = useTranslation();

  const iconStyle = PRODUCT_ICON_STYLES[rowIndex % PRODUCT_ICON_STYLES.length];
  const IconComp = iconStyle.icon;

  const statusStyle = STATUS_STYLES[record.status] ?? {
    textColor: "#64748B",
    bgColor: "#F1F5F9",
  };
  const statusI18nKey = STATUS_I18N[record.status];
  const statusLabel = statusI18nKey ? t(statusI18nKey) : record.status;

  const formatDate = (dt: string | undefined) => {
    if (!dt) return "—";
    return dt.slice(0, 10);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        px: "20px",
        py: "12px",
        borderBottom: "1px solid #F1F5F9",
      }}
    >
      {/* Order No */}
      <Box sx={{ width: 130, display: "flex", alignItems: "center" }}>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 500,
            color: "#2563EB",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {record.orderNo}
        </Typography>
      </Box>

      {/* Product info */}
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: "10px" }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "6px",
            bgcolor: iconStyle.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <IconComp sx={{ fontSize: 18, color: iconStyle.color }} />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1px",
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: "#1E293B",
              fontFamily: "Inter, sans-serif",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {record.productName}
          </Typography>
          {record.productDesc && (
            <Typography
              sx={{
                fontSize: 11,
                color: "#64748B",
                fontFamily: "Inter, sans-serif",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {record.productDesc}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Employee */}
      <Box sx={{ width: 100, display: "flex", alignItems: "center" }}>
        <Typography
          sx={{
            fontSize: 12,
            color: "#1E293B",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {record.employeeName}
        </Typography>
      </Box>

      {/* Points cost */}
      <Box sx={{ width: 90, display: "flex", alignItems: "center" }}>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: "#1E293B",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {record.pointsCost?.toLocaleString() ?? "—"}
        </Typography>
      </Box>

      {/* Exchange time */}
      <Box sx={{ width: 110, display: "flex", alignItems: "center" }}>
        <Typography
          sx={{
            fontSize: 12,
            color: "#64748B",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {formatDate(record.exchangeTime)}
        </Typography>
      </Box>

      {/* Status chip */}
      <Box sx={{ width: 90, display: "flex", alignItems: "center" }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "12px",
            bgcolor: statusStyle.bgColor,
            px: "10px",
            py: "3px",
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 500,
              color: statusStyle.textColor,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {statusLabel}
          </Typography>
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ width: 80, display: "flex", alignItems: "center" }}>
        <ButtonBase
          onClick={onDetail}
          sx={{ "&:hover": { textDecoration: "underline" } }}
        >
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 500,
              color: "#2563EB",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {t("admin.exchangeRecords.detail")}
          </Typography>
        </ButtonBase>
      </Box>
    </Box>
  );
}

// ---- Page Button ----

function PageBtn({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <ButtonBase
      disabled={disabled}
      onClick={onClick}
      sx={{
        width: 32,
        height: 32,
        borderRadius: "6px",
        border: active ? "none" : "1px solid #E2E8F0",
        bgcolor: active ? "#2563EB" : "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 500,
          color: active ? "#fff" : "#64748B",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {label}
      </Typography>
    </ButtonBase>
  );
}

// ---- Pagination number builder (with ellipsis) ----

function buildPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [];
  if (current <= 3) {
    pages.push(1, 2, 3, "...", total);
  } else if (current >= total - 2) {
    pages.push(1, "...", total - 2, total - 1, total);
  } else {
    pages.push(1, "...", current, "...", total);
  }
  return pages;
}
