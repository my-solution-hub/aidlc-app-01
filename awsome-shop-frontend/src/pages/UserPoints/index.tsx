import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import InputBase from "@mui/material/InputBase";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import GroupIcon from "@mui/icons-material/Group";
import TollIcon from "@mui/icons-material/Toll";
import { listUserPoints, adjustUserPoints } from "../../services/api/userPoint";
import { listTransactions } from "../../services/api/point";
import type {
  UserPointDTO,
  PointTransactionDTO,
  PageResult,
} from "../../types/api";
import AdminPageHeader from "../../components/AdminPageHeader";
import { AppSnackbar, useSnackbar } from "../../components/AppSnackbar";
import { BusinessError } from "../../services/request";

const USER_PAGE_SIZE = 12;
const TXN_PAGE_SIZE = 10;
const AVATAR_COLORS = ["#2563EB", "#DC2626", "#7C3AED", "#16A34A", "#D97706", "#0891B2"];

// ---- Transaction type styling ----

interface TxnTypeStyle {
  i18nKey: string;
  color: string;
  bg: string;
}

// Maps backend type codes (and common aliases) to chip styles.
const TXN_TYPE_STYLES: Record<string, TxnTypeStyle> = {
  MANUAL: { i18nKey: "typeManual", color: "#2563EB", bg: "#EFF6FF" },
  ADJUST: { i18nKey: "typeManual", color: "#2563EB", bg: "#EFF6FF" },
  ADJUSTMENT: { i18nKey: "typeManual", color: "#2563EB", bg: "#EFF6FF" },
  EXCHANGE: { i18nKey: "typeExchange", color: "#DC2626", bg: "#FEE2E2" },
  CONSUME: { i18nKey: "typeExchange", color: "#DC2626", bg: "#FEE2E2" },
  USE: { i18nKey: "typeExchange", color: "#DC2626", bg: "#FEE2E2" },
  REDEEM: { i18nKey: "typeExchange", color: "#DC2626", bg: "#FEE2E2" },
  RULE: { i18nKey: "typeRule", color: "#16A34A", bg: "#DCFCE7" },
  GRANT: { i18nKey: "typeRule", color: "#16A34A", bg: "#DCFCE7" },
  EARN: { i18nKey: "typeRule", color: "#16A34A", bg: "#DCFCE7" },
  EVENT: { i18nKey: "typeEvent", color: "#8B5CF6", bg: "#F5F3FF" },
  EXPIRE: { i18nKey: "typeExpire", color: "#DC2626", bg: "#FEE2E2" },
  EXPIRED: { i18nKey: "typeExpire", color: "#DC2626", bg: "#FEE2E2" },
};

// The values used by the type filter (must match backend type codes).
const TYPE_FILTER_OPTIONS = ["MANUAL", "EXCHANGE", "RULE", "EVENT", "EXPIRE"];

const MANUAL_TYPES = new Set(["MANUAL", "ADJUST", "ADJUSTMENT"]);

function getTxnTypeStyle(type: string): TxnTypeStyle {
  return TXN_TYPE_STYLES[(type ?? "").toUpperCase()] ?? {
    i18nKey: "",
    color: "#64748B",
    bg: "#F1F5F9",
  };
}

function formatTime(value: string): string {
  return (value ?? "").slice(0, 16).replace("T", " ");
}

// ---- Page ----

export default function UserPoints() {
  const { t } = useTranslation();
  const snackbar = useSnackbar();

  // User list (left panel)
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [userData, setUserData] = useState<PageResult<UserPointDTO> | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [selected, setSelected] = useState<UserPointDTO | null>(null);

  // Transactions (main panel)
  const [txnData, setTxnData] = useState<PageResult<PointTransactionDTO> | null>(null);
  const [txnLoading, setTxnLoading] = useState(false);
  const [txnPage, setTxnPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustLoading, setAdjustLoading] = useState(false);

  // Debounce the search input by 300ms.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setUserLoading(true);
    try {
      const res = await listUserPoints({
        page: 1,
        size: USER_PAGE_SIZE,
        keyword: debouncedSearch || undefined,
      });
      setUserData(res);
      // Auto-select the first user when nothing is selected, or when the
      // current selection is no longer in the filtered list.
      setSelected((prev) => {
        const records = res.records ?? [];
        if (records.length === 0) return null;
        if (prev && records.some((u) => u.userId === prev.userId)) return prev;
        return records[0];
      });
    } catch {
      // handled by interceptor
    } finally {
      setUserLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const fetchTransactions = useCallback(async () => {
    if (!selected) {
      setTxnData(null);
      return;
    }
    setTxnLoading(true);
    try {
      const res = await listTransactions({
        userId: selected.userId,
        page: txnPage,
        size: TXN_PAGE_SIZE,
        type: typeFilter || undefined,
      });
      setTxnData(res);
    } catch {
      // handled by interceptor
    } finally {
      setTxnLoading(false);
    }
  }, [selected, txnPage, typeFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSelectUser = (user: UserPointDTO) => {
    setSelected(user);
    setTxnPage(1);
    setTypeFilter("");
  };

  const handleAdjustSubmit = async (amount: number, reason: string) => {
    if (!selected) return;
    setAdjustLoading(true);
    try {
      const balance = await adjustUserPoints({
        userId: selected.userId,
        amount,
        reason,
      });
      snackbar.showSuccess(t("admin.userPoints.adjustSuccess"));
      setAdjustOpen(false);
      // Reflect the new balance locally, then refresh from the server.
      setSelected((prev) =>
        prev
          ? {
              ...prev,
              balance: balance?.balance ?? prev.balance,
              totalEarned: balance?.totalEarned ?? prev.totalEarned,
              totalUsed: balance?.totalUsed ?? prev.totalUsed,
            }
          : prev,
      );
      setTxnPage(1);
      fetchUsers();
      fetchTransactions();
    } catch (err) {
      snackbar.showError(
        err instanceof BusinessError
          ? err.message
          : t("admin.userPoints.adjustFailed"),
      );
    } finally {
      setAdjustLoading(false);
    }
  };

  const users = userData?.records ?? [];
  const transactions = txnData?.records ?? [];
  const txnTotal = txnData?.total ?? 0;
  const txnPages = txnData?.pages ?? 1;
  const txnStart = transactions.length > 0 ? (txnPage - 1) * TXN_PAGE_SIZE + 1 : 0;
  const txnEnd = txnStart + transactions.length - 1;

  // Net of manual adjustments within the currently loaded page.
  const manualNet = useMemo(
    () =>
      (txnData?.records ?? [])
        .filter((txn) => MANUAL_TYPES.has((txn.type ?? "").toUpperCase()))
        .reduce((sum, txn) => sum + (txn.amount ?? 0), 0),
    [txnData],
  );

  return (
    <Box sx={{ p: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Breadcrumb */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <Typography sx={{ fontSize: 13, color: "#64748B" }}>
          {t("admin.userPoints.breadcrumbUsers")}
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#CBD5E1" }}>/</Typography>
        <Typography sx={{ fontSize: 13, color: "#2563EB", fontWeight: 600 }}>
          {t("admin.userPoints.breadcrumbHistory")}
        </Typography>
      </Box>

      {/* Header: title + (user card + adjust button) */}
      <AdminPageHeader
        title={
          selected
            ? t("admin.userPoints.historyTitle", {
                name: selected.nickname || selected.username,
              })
            : t("admin.userPoints.title")
        }
        actions={
          selected ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  bgcolor: "#fff",
                  border: "1px solid #F1F5F9",
                  borderRadius: "10px",
                  px: "14px",
                  py: "8px",
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    bgcolor: AVATAR_COLORS[selected.userId % AVATAR_COLORS.length],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                    {(selected.nickname || selected.username || "?").charAt(0)}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography sx={{ fontSize: 12, color: "#64748B" }}>
                    {selected.employeeNo || "—"}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "#1E293B" }}>
                    {t("admin.userPoints.currentBalance")}{" "}
                    <Box component="span" sx={{ fontWeight: 700, color: "#2563EB" }}>
                      {(selected.balance ?? 0).toLocaleString()}
                    </Box>{" "}
                    {t("admin.userPoints.pointsUnit")}
                  </Typography>
                </Box>
              </Box>
              <ButtonBase
                onClick={() => setAdjustOpen(true)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  bgcolor: "#2563EB",
                  color: "#fff",
                  borderRadius: "8px",
                  px: "16px",
                  py: "10px",
                  "&:hover": { bgcolor: "#1D4ED8" },
                }}
              >
                <TuneIcon sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                  {t("admin.userPoints.adjustPoints")}
                </Typography>
              </ButtonBase>
            </Box>
          ) : undefined
        }
      />

      {/* Body: user list + detail */}
      <Box sx={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
        {/* Left: searchable user list */}
        <Box
          sx={{
            width: 300,
            flexShrink: 0,
            bgcolor: "#fff",
            borderRadius: "12px",
            border: "1px solid #F1F5F9",
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: "16px", borderBottom: "1px solid #F1F5F9" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                height: 38,
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                px: "12px",
              }}
            >
              <SearchIcon sx={{ fontSize: 18, color: "#64748B" }} />
              <InputBase
                placeholder={t("admin.userPoints.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                  flex: 1,
                  fontSize: 13,
                  "& input::placeholder": { color: "#CBD5E1", opacity: 1 },
                }}
              />
            </Box>
          </Box>

          {userLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress size={24} />
            </Box>
          ) : users.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 6,
                gap: 1.5,
              }}
            >
              <GroupIcon sx={{ fontSize: 40, color: "#CBD5E1" }} />
              <Typography sx={{ fontSize: 13, color: "#64748B" }}>
                {t("admin.userPoints.noUsers")}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ maxHeight: 560, overflowY: "auto" }}>
              {users.map((user) => {
                const active = selected?.userId === user.userId;
                return (
                  <ButtonBase
                    key={user.userId}
                    onClick={() => handleSelectUser(user)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      width: "100%",
                      justifyContent: "flex-start",
                      textAlign: "left",
                      px: "16px",
                      py: "12px",
                      borderBottom: "1px solid #F8FAFC",
                      bgcolor: active ? "#EFF6FF" : "transparent",
                      borderLeft: active ? "3px solid #2563EB" : "3px solid transparent",
                      "&:hover": { bgcolor: active ? "#EFF6FF" : "#F8FAFC" },
                    }}
                  >
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        bgcolor: AVATAR_COLORS[user.userId % AVATAR_COLORS.length],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                        {(user.nickname || user.username || "?").charAt(0)}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        noWrap
                        sx={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}
                      >
                        {user.nickname || user.username}
                      </Typography>
                      <Typography noWrap sx={{ fontSize: 11, color: "#94A3B8" }}>
                        {user.employeeNo || "—"}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{ fontSize: 13, fontWeight: 700, color: "#2563EB", flexShrink: 0 }}
                    >
                      {(user.balance ?? 0).toLocaleString()}
                    </Typography>
                  </ButtonBase>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Right: detail */}
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "20px" }}>
          {!selected ? (
            <Box
              sx={{
                bgcolor: "#fff",
                borderRadius: "12px",
                border: "1px solid #F1F5F9",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 12,
                gap: 2,
              }}
            >
              <TollIcon sx={{ fontSize: 48, color: "#CBD5E1" }} />
              <Typography sx={{ fontSize: 14, color: "#64748B" }}>
                {t("admin.userPoints.selectUserHint")}
              </Typography>
            </Box>
          ) : (
            <>
              {/* Stat cards */}
              <Box sx={{ display: "flex", gap: "16px" }}>
                <StatCard
                  label={t("admin.userPoints.statEarned")}
                  value={(selected.totalEarned ?? 0).toLocaleString()}
                  hint={t("admin.userPoints.statEarnedHint")}
                  valueColor="#16A34A"
                />
                <StatCard
                  label={t("admin.userPoints.statUsed")}
                  value={(selected.totalUsed ?? 0).toLocaleString()}
                  hint={t("admin.userPoints.statUsedHint")}
                  valueColor="#DC2626"
                />
                <StatCard
                  label={t("admin.userPoints.statManual")}
                  value={`${manualNet > 0 ? "+" : ""}${manualNet.toLocaleString()}`}
                  hint={t("admin.userPoints.statManualHint")}
                  valueColor="#2563EB"
                />
                <StatCard
                  label={t("admin.userPoints.statCount")}
                  value={String(txnTotal)}
                  hint={t("admin.userPoints.statCountHint")}
                />
              </Box>

              {/* Filter row */}
              <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setTxnPage(1);
                  }}
                  displayEmpty
                  size="small"
                  sx={{
                    height: 38,
                    borderRadius: "8px",
                    fontSize: 13,
                    color: "#64748B",
                    bgcolor: "#fff",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
                  }}
                >
                  <MenuItem value="">{t("admin.userPoints.allTypes")}</MenuItem>
                  {TYPE_FILTER_OPTIONS.map((code) => (
                    <MenuItem key={code} value={code}>
                      {t(`admin.userPoints.${getTxnTypeStyle(code).i18nKey}`)}
                    </MenuItem>
                  ))}
                </Select>
                <Box sx={{ flex: 1 }} />
                <Typography sx={{ fontSize: 13, color: "#64748B" }}>
                  {t("admin.userPoints.recordCount", { count: txnTotal })}
                </Typography>
              </Box>

              {/* Transactions table */}
              {txnLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : transactions.length === 0 ? (
                <Box
                  sx={{
                    bgcolor: "#fff",
                    borderRadius: "12px",
                    border: "1px solid #F1F5F9",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    py: 8,
                    gap: 2,
                  }}
                >
                  <TollIcon sx={{ fontSize: 48, color: "#CBD5E1" }} />
                  <Typography sx={{ fontSize: 14, color: "#64748B" }}>
                    {t("admin.userPoints.noRecords")}
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
                  {/* Header */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      bgcolor: "#F8FAFC",
                      px: "20px",
                      py: "14px",
                    }}
                  >
                    <Box sx={{ width: 150 }}><Th label={t("admin.userPoints.thTime")} /></Box>
                    <Box sx={{ width: 110 }}><Th label={t("admin.userPoints.thType")} /></Box>
                    <Box sx={{ width: 110 }}><Th label={t("admin.userPoints.thAmount")} /></Box>
                    <Box sx={{ width: 120 }}><Th label={t("admin.userPoints.thBalance")} /></Box>
                    <Box sx={{ flex: 1 }}><Th label={t("admin.userPoints.thReason")} /></Box>
                    <Box sx={{ width: 110 }}><Th label={t("admin.userPoints.thOperator")} /></Box>
                  </Box>
                  {/* Rows */}
                  {transactions.map((txn) => {
                    const style = getTxnTypeStyle(txn.type);
                    const positive = (txn.amount ?? 0) >= 0;
                    const isManual = MANUAL_TYPES.has((txn.type ?? "").toUpperCase());
                    return (
                      <Box
                        key={txn.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          px: "20px",
                          py: "14px",
                          borderTop: "1px solid #F1F5F9",
                        }}
                      >
                        <Box sx={{ width: 150 }}>
                          <Typography sx={{ fontSize: 13, color: "#1E293B" }}>
                            {formatTime(txn.createdAt)}
                          </Typography>
                        </Box>
                        <Box sx={{ width: 110 }}>
                          <Box
                            sx={{
                              display: "inline-flex",
                              borderRadius: "6px",
                              bgcolor: style.bg,
                              px: "8px",
                              py: "3px",
                            }}
                          >
                            <Typography
                              sx={{ fontSize: 11, fontWeight: 600, color: style.color }}
                            >
                              {style.i18nKey
                                ? t(`admin.userPoints.${style.i18nKey}`)
                                : txn.type || "—"}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ width: 110 }}>
                          <Typography
                            sx={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: positive ? "#16A34A" : "#DC2626",
                            }}
                          >
                            {positive ? "+" : ""}
                            {(txn.amount ?? 0).toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ width: 120 }}>
                          <Typography sx={{ fontSize: 13, color: "#1E293B" }}>
                            {(txn.balance ?? 0).toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, pr: "12px" }}>
                          <Typography sx={{ fontSize: 13, color: "#64748B" }}>
                            {txn.description || "—"}
                          </Typography>
                        </Box>
                        <Box sx={{ width: 110 }}>
                          <Typography sx={{ fontSize: 13, color: "#94A3B8" }}>
                            {isManual
                              ? t("admin.userPoints.operatorAdmin")
                              : t("admin.userPoints.operatorSystem")}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}

              {/* Pagination */}
              {txnTotal > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: "8px",
                  }}
                >
                  <Typography sx={{ fontSize: 13, color: "#64748B" }}>
                    {t("admin.userPoints.showRange", {
                      start: txnStart,
                      end: txnEnd,
                      total: txnTotal,
                    })}
                  </Typography>
                  <Box sx={{ display: "flex", gap: "4px", alignItems: "center" }}>
                    <PageBtn
                      label="<"
                      disabled={txnPage <= 1}
                      onClick={() => setTxnPage((p) => Math.max(1, p - 1))}
                    />
                    {Array.from({ length: txnPages }, (_, i) => i + 1).map((p) => (
                      <PageBtn
                        key={p}
                        label={String(p)}
                        active={p === txnPage}
                        onClick={() => setTxnPage(p)}
                      />
                    ))}
                    <PageBtn
                      label=">"
                      disabled={txnPage >= txnPages}
                      onClick={() => setTxnPage((p) => Math.min(txnPages, p + 1))}
                    />
                  </Box>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      {adjustOpen && selected && (
        <AdjustPointsDialog
          user={selected}
          loading={adjustLoading}
          onSubmit={handleAdjustSubmit}
          onClose={() => setAdjustOpen(false)}
        />
      )}

      <AppSnackbar state={snackbar.state} onClose={snackbar.close} />
    </Box>
  );
}

// ---- Helpers ----

function Th({ label }: { label: string }) {
  return (
    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>{label}</Typography>
  );
}

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
    <Box
      sx={{
        flex: 1,
        bgcolor: "#fff",
        borderRadius: "12px",
        border: "1px solid #F1F5F9",
        p: "20px",
      }}
    >
      <Typography sx={{ fontSize: 13, color: "#64748B" }}>{label}</Typography>
      <Typography
        sx={{ fontSize: 28, fontWeight: 700, color: valueColor ?? "#1E293B", mt: "4px" }}
      >
        {value}
      </Typography>
      {hint && (
        <Typography sx={{ fontSize: 12, color: "#94A3B8", mt: "2px" }}>{hint}</Typography>
      )}
    </Box>
  );
}

function PageBtn({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <ButtonBase
      disabled={disabled}
      onClick={onClick}
      sx={{
        minWidth: 32,
        height: 32,
        px: "8px",
        borderRadius: "6px",
        border: active ? "none" : "1px solid #E2E8F0",
        bgcolor: active ? "#2563EB" : "#fff",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Typography
        sx={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "#fff" : "#64748B" }}
      >
        {label}
      </Typography>
    </ButtonBase>
  );
}

// ---- Adjust points dialog (dlg-10) ----

function AdjustPointsDialog({
  user,
  loading,
  onSubmit,
  onClose,
}: {
  user: UserPointDTO;
  loading?: boolean;
  onSubmit: (amount: number, reason: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [direction, setDirection] = useState<"add" | "deduct">("add");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [remark, setRemark] = useState("");

  const numericAmount = Number(amount) || 0;
  const signedAmount = direction === "add" ? numericAmount : -numericAmount;
  const afterBalance = (user.balance ?? 0) + signedAmount;
  const canSubmit = numericAmount > 0 && reason.trim().length > 0 && !loading;

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      fontSize: 14,
      "& fieldset": { borderColor: "#E2E8F0" },
    },
  };

  const handleConfirm = () => {
    if (!canSubmit) return;
    const base = reason.trim();
    const combined = remark.trim() ? `${base} - ${remark.trim()}` : base;
    onSubmit(signedAmount, combined.slice(0, 200));
  };

  return (
    <Dialog
      open
      onClose={onClose}
      slotProps={{ paper: { sx: { borderRadius: "12px", width: 480 } } }}
    >
      {/* Title */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          p: "20px 24px 0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "8px",
              bgcolor: "#FEF3C7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TollIcon sx={{ fontSize: 20, color: "#D97706" }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 17, fontWeight: 700, color: "#1E293B" }}>
              {t("admin.userPoints.dialogTitle")}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#64748B" }}>
              {t("admin.userPoints.dialogSubtitle")}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
        </IconButton>
      </Box>

      <Box sx={{ p: "16px 24px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* User card */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "#F8FAFC",
            borderRadius: "10px",
            p: "14px 16px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor: AVATAR_COLORS[user.userId % AVATAR_COLORS.length],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>
                {(user.nickname || user.username || "?").charAt(0)}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>
                {user.nickname || user.username}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#94A3B8" }}>
                {user.employeeNo || "—"}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontSize: 12, color: "#64748B" }}>
              {t("admin.userPoints.currentBalanceLabel")}
            </Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#2563EB" }}>
              {(user.balance ?? 0).toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {/* Adjust type toggle */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Label required text={t("admin.userPoints.adjustType")} />
          <Box sx={{ display: "flex", gap: "12px" }}>
            <ToggleCard
              selected={direction === "add"}
              icon={<AddCircleOutlineIcon sx={{ fontSize: 18 }} />}
              label={t("admin.userPoints.adjustAdd")}
              onClick={() => setDirection("add")}
            />
            <ToggleCard
              selected={direction === "deduct"}
              icon={<RemoveCircleOutlineIcon sx={{ fontSize: 18 }} />}
              label={t("admin.userPoints.adjustDeduct")}
              onClick={() => setDirection("deduct")}
            />
          </Box>
        </Box>

        {/* Amount */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Label required text={t("admin.userPoints.adjustAmount")} />
          <TextField
            fullWidth
            size="small"
            type="number"
            placeholder={t("admin.userPoints.adjustAmountPlaceholder")}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={fieldSx}
          />
          <Typography sx={{ fontSize: 12, color: "#64748B" }}>
            {t("admin.userPoints.afterBalance", {
              balance: afterBalance.toLocaleString(),
            })}
          </Typography>
        </Box>

        {/* Reason */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Label required text={t("admin.userPoints.adjustReason")} />
          <TextField
            fullWidth
            size="small"
            placeholder={t("admin.userPoints.adjustReasonPlaceholder")}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={fieldSx}
          />
        </Box>

        {/* Remark */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Label text={t("admin.userPoints.remark")} />
          <TextField
            fullWidth
            size="small"
            multiline
            minRows={2}
            placeholder={t("admin.userPoints.remarkPlaceholder")}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            sx={fieldSx}
          />
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "12px", mt: "4px" }}>
          <ButtonBase
            onClick={onClose}
            disabled={loading}
            sx={{
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
              px: "20px",
              py: "9px",
              "&:hover": { bgcolor: "#F8FAFC" },
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B" }}>
              {t("common.cancel")}
            </Typography>
          </ButtonBase>
          <ButtonBase
            onClick={handleConfirm}
            disabled={!canSubmit}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "8px",
              bgcolor: canSubmit ? "#2563EB" : "#93C5FD",
              px: "20px",
              py: "9px",
              "&:hover": { bgcolor: canSubmit ? "#1D4ED8" : "#93C5FD" },
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
              {t("admin.userPoints.confirmAdjust")}
            </Typography>
          </ButtonBase>
        </Box>
      </Box>
    </Dialog>
  );
}

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B" }}>
      {text}
      {required && <Box component="span" sx={{ color: "#DC2626", ml: "2px" }}>*</Box>}
    </Typography>
  );
}

function ToggleCard({
  selected,
  icon,
  label,
  onClick,
}: {
  selected: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        height: 46,
        borderRadius: "8px",
        border: selected ? "2px solid #2563EB" : "1px solid #E2E8F0",
        bgcolor: selected ? "#EFF6FF" : "#fff",
        color: selected ? "#2563EB" : "#64748B",
      }}
    >
      {/* Radio indicator */}
      <Box
        sx={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: selected ? "5px solid #2563EB" : "2px solid #CBD5E1",
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      />
      {icon}
      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{label}</Typography>
    </ButtonBase>
  );
}
