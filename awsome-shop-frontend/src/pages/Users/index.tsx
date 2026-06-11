import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import GroupIcon from "@mui/icons-material/Group";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import {
  listUsers,
  createUser,
  updateUser,
  updateUserStatus,
  getUserStats,
  exportUsers,
} from "../../services/api/user";
import type { UserDTO, PageResult, CreateUserRequest, UserStatsDTO } from "../../types/api";
import AdminPageHeader from "../../components/AdminPageHeader";
import { AppSnackbar, useSnackbar } from "../../components/AppSnackbar";
import { BusinessError } from "../../services/request";

const PAGE_SIZE = 10;

const AVATAR_COLORS = ["#2563EB", "#DC2626", "#7C3AED", "#16A34A", "#D97706", "#0891B2"];

function StatCard({ label, value, hint, valueColor }: { label: string; value: string; hint?: string; valueColor?: string }) {
  return (
    <Box sx={{ flex: 1, bgcolor: "#fff", borderRadius: "12px", border: "1px solid #F1F5F9", p: "20px" }}>
      <Typography sx={{ fontSize: 13, color: "#64748B" }}>{label}</Typography>
      <Typography sx={{ fontSize: 28, fontWeight: 700, color: valueColor ?? "#1E293B", mt: "4px" }}>{value}</Typography>
      {hint && <Typography sx={{ fontSize: 12, color: "#94A3B8", mt: "2px" }}>{hint}</Typography>}
    </Box>
  );
}

function RoleChip({ role, t }: { role: string; t: (k: string) => string }) {
  const isAdmin = role?.toLowerCase() === "admin";
  return (
    <Box sx={{ display: "inline-flex", borderRadius: "10px", bgcolor: isAdmin ? "#FEF3C7" : "#EFF6FF", px: "10px", py: "3px" }}>
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: isAdmin ? "#92400E" : "#2563EB" }}>
        {isAdmin ? t("admin.users.roleAdmin") : t("admin.users.roleEmployee")}
      </Typography>
    </Box>
  );
}

export default function Users() {
  const { t } = useTranslation();
  const snackbar = useSnackbar();

  const [data, setData] = useState<PageResult<UserDTO> | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [dialog, setDialog] = useState<{ mode: "create" } | { mode: "edit"; user: UserDTO } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState<UserStatsDTO | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    listUsers({
      page,
      size: PAGE_SIZE,
      username: search.trim() || undefined,
      role: roleFilter || undefined,
    })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    getUserStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  const users = data?.records ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;
  const start = users.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const end = start + users.length - 1;

  const handleToggleStatus = async (user: UserDTO) => {
    try {
      await updateUserStatus(user.id, user.status === "ACTIVE" ? "DISABLED" : "ACTIVE");
      snackbar.showSuccess(t("common.operationSuccess"));
      fetchData();
    } catch (err) {
      snackbar.showError(err instanceof BusinessError ? err.message : t("common.operationFailed"));
    }
  };

  const handleSubmit = async (form: CreateUserRequest, editingId?: number) => {
    setActionLoading(true);
    try {
      if (editingId) {
        await updateUser(editingId, {
          nickname: form.nickname,
          role: form.role,
          employeeId: form.employeeId,
          department: form.department,
        });
        snackbar.showSuccess(t("admin.users.updateSuccess"));
      } else {
        await createUser(form);
        snackbar.showSuccess(t("admin.users.createSuccess"));
      }
      setDialog(null);
      fetchData();
    } catch (err) {
      snackbar.showError(err instanceof BusinessError ? err.message : t("admin.users.createFailed"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportUsers();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      snackbar.showError(err instanceof BusinessError ? err.message : t("common.operationFailed"));
    }
  };

  return (
    <Box sx={{ p: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <AdminPageHeader
        title={t("admin.users.title")}
        actions={
          <Box sx={{ display: "flex", gap: "8px" }}>
            <Button variant="outlined" startIcon={<DownloadIcon sx={{ fontSize: 16 }} />} onClick={handleExport}
              sx={{ textTransform: "none", borderRadius: "8px", fontSize: 13, fontWeight: 600, color: "#64748B", borderColor: "#E2E8F0" }}>
              {t("admin.users.exportData")}
            </Button>
            <Button variant="contained" startIcon={<AddIcon sx={{ fontSize: 16 }} />} onClick={() => setDialog({ mode: "create" })}
              sx={{ textTransform: "none", borderRadius: "8px", fontSize: 13, fontWeight: 600 }}>
              {t("admin.users.addUser")}
            </Button>
          </Box>
        }
      />

      {/* Stat cards */}
      <Box sx={{ display: "flex", gap: "16px" }}>
        <StatCard label={t("admin.users.statTotal")} value={(stats?.totalUsers ?? total).toLocaleString()} />
        <StatCard label={t("admin.users.statActive")} value={stats ? stats.activeUsers.toLocaleString() : "—"} valueColor="#2563EB" />
        <StatCard label={t("admin.users.statNew")} value={stats ? stats.newThisMonth.toLocaleString() : "—"} valueColor="#16A34A" />
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", width: 280, height: 40, borderRadius: "8px", border: "1px solid #E2E8F0", bgcolor: "#fff", px: "12px" }}>
          <SearchIcon sx={{ fontSize: 18, color: "#64748B" }} />
          <InputBase
            placeholder={t("admin.users.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") setPage(1); }}
            sx={{ flex: 1, fontSize: 13, "& input::placeholder": { color: "#CBD5E1", opacity: 1 } }}
          />
        </Box>
        <Select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} displayEmpty size="small"
          sx={{ height: 40, borderRadius: "8px", fontSize: 13, color: "#64748B", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" } }}>
          <MenuItem value="">{t("admin.users.allRoles")}</MenuItem>
          <MenuItem value="EMPLOYEE">{t("admin.users.roleEmployee")}</MenuItem>
          <MenuItem value="ADMIN">{t("admin.users.roleAdmin")}</MenuItem>
        </Select>
        <Typography sx={{ fontSize: 13, color: "#64748B" }}>{t("admin.users.totalCount", { count: total })}</Typography>
      </Box>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
      ) : users.length === 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 2 }}>
          <GroupIcon sx={{ fontSize: 48, color: "#CBD5E1" }} />
          <Typography sx={{ fontSize: 14, color: "#64748B" }}>{t("admin.users.noUsers")}</Typography>
        </Box>
      ) : (
        <Box sx={{ borderRadius: "12px", border: "1px solid #F1F5F9", bgcolor: "#fff", overflow: "hidden" }}>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#F8FAFC", px: "20px", py: "14px" }}>
            <Box sx={{ flex: 1 }}><Th t={t} k="thUserInfo" /></Box>
            <Box sx={{ width: 110 }}><Th t={t} k="thDept" /></Box>
            <Box sx={{ width: 90 }}><Th t={t} k="thBalance" /></Box>
            <Box sx={{ width: 80 }}><Th t={t} k="thExchangeCount" /></Box>
            <Box sx={{ width: 80 }}><Th t={t} k="thRole" /></Box>
            <Box sx={{ width: 80 }}><Th t={t} k="thStatus" /></Box>
            <Box sx={{ width: 90 }}><Th t={t} k="thActions" /></Box>
          </Box>
          {/* Rows */}
          {users.map((user, idx) => {
            const enabled = user.status === "ACTIVE";
            const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            return (
              <Box key={user.id} sx={{ display: "flex", alignItems: "center", px: "20px", py: "14px", borderTop: "1px solid #F1F5F9" }}>
                <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: avatarColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
                      {(user.nickname || user.username || "?").charAt(0)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>{user.nickname || user.username}</Typography>
                    <Typography sx={{ fontSize: 12, color: "#94A3B8" }}>
                      {t("admin.users.employeeNoLabel")}: {user.employeeId || "—"}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ width: 110 }}><Typography sx={{ fontSize: 13, color: user.department ? "#1E293B" : "#94A3B8" }}>{user.department || "—"}</Typography></Box>
                <Box sx={{ width: 90 }}><Typography sx={{ fontSize: 13, color: "#94A3B8" }}>—</Typography></Box>
                <Box sx={{ width: 80 }}><Typography sx={{ fontSize: 13, color: "#94A3B8" }}>—</Typography></Box>
                <Box sx={{ width: 80 }}><RoleChip role={user.role} t={t} /></Box>
                <Box sx={{ width: 80 }}>
                  <Box sx={{ display: "inline-flex", borderRadius: "10px", bgcolor: enabled ? "#DCFCE7" : "#FEE2E2", px: "10px", py: "3px" }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: enabled ? "#166534" : "#991B1B" }}>
                      {enabled ? t("admin.users.statusEnabled") : t("admin.users.statusDisabled")}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ width: 90, display: "flex", gap: "4px" }}>
                  <Tooltip title={t("admin.users.edit")}>
                    <IconButton size="small" onClick={() => setDialog({ mode: "edit", user })}>
                      <EditIcon sx={{ fontSize: 18, color: "#64748B" }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={enabled ? t("admin.users.disable") : t("admin.users.enable")}>
                    <IconButton size="small" onClick={() => handleToggleStatus(user)}>
                      {enabled ? <BlockIcon sx={{ fontSize: 18, color: "#D97706" }} /> : <LockOpenIcon sx={{ fontSize: 18, color: "#16A34A" }} />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Pagination */}
      {total > 0 && (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: "8px" }}>
          <Typography sx={{ fontSize: 13, color: "#64748B" }}>{t("admin.users.showRange", { start, end, total })}</Typography>
          <Box sx={{ display: "flex", gap: "4px" }}>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <Button key={p} onClick={() => setPage(p)}
                sx={{ minWidth: 32, height: 32, p: 0, borderRadius: "6px", border: p === page ? "none" : "1px solid #E2E8F0", bgcolor: p === page ? "#2563EB" : "#fff", color: p === page ? "#fff" : "#64748B", fontSize: 13, "&:hover": { bgcolor: p === page ? "#2563EB" : "#F8FAFC" } }}>
                {p}
              </Button>
            ))}
          </Box>
        </Box>
      )}

      {dialog && (
        <UserDialog
          mode={dialog.mode}
          user={dialog.mode === "edit" ? dialog.user : undefined}
          loading={actionLoading}
          onSubmit={handleSubmit}
          onClose={() => setDialog(null)}
        />
      )}

      <AppSnackbar state={snackbar.state} onClose={snackbar.close} />
    </Box>
  );
}

function Th({ t, k }: { t: (k: string) => string; k: string }) {
  return <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>{t(`admin.users.${k}`)}</Typography>;
}

function UserDialog({
  mode,
  user,
  loading,
  onSubmit,
  onClose,
}: {
  mode: "create" | "edit";
  user?: UserDTO;
  loading?: boolean;
  onSubmit: (form: CreateUserRequest, editingId?: number) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const editing = mode === "edit";
  const [username, setUsername] = useState(user?.username ?? "");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [employeeId, setEmployeeId] = useState(user?.employeeId ?? "");
  const [department, setDepartment] = useState(user?.department ?? "");
  const [role, setRole] = useState((user?.role ?? "EMPLOYEE").toUpperCase());

  const fieldSx = { "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14, "& fieldset": { borderColor: "#E2E8F0" } } };
  const canSubmit = editing ? !!nickname.trim() : !!(username.trim() && password.trim());

  const field = (label: string, node: React.ReactNode) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B" }}>{label}</Typography>
      {node}
    </Box>
  );

  return (
    <Dialog open onClose={onClose} slotProps={{ paper: { sx: { borderRadius: "12px", width: 440 } } }}>
      <DialogTitle sx={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>
        {editing ? t("admin.users.dialogEditTitle") : t("admin.users.dialogCreateTitle")}
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: "16px", pt: "8px !important" }}>
        {field(
          t("admin.users.fieldUsername"),
          <TextField fullWidth size="small" disabled={editing} placeholder={t("admin.users.fieldUsernamePlaceholder")} value={username} onChange={(e) => setUsername(e.target.value)} sx={fieldSx} />,
        )}
        {!editing &&
          field(
            t("admin.users.fieldPassword"),
            <TextField fullWidth size="small" type="password" placeholder={t("admin.users.fieldPasswordPlaceholder")} value={password} onChange={(e) => setPassword(e.target.value)} sx={fieldSx} />,
          )}
        {field(
          t("admin.users.fieldNickname"),
          <TextField fullWidth size="small" placeholder={t("admin.users.fieldNicknamePlaceholder")} value={nickname} onChange={(e) => setNickname(e.target.value)} sx={fieldSx} />,
        )}
        {field(
          t("admin.users.fieldEmployeeId"),
          <TextField fullWidth size="small" placeholder={t("admin.users.fieldEmployeeIdPlaceholder")} value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} sx={fieldSx} />,
        )}
        {field(
          t("admin.users.fieldDepartment"),
          <TextField fullWidth size="small" placeholder={t("admin.users.fieldDepartmentPlaceholder")} value={department} onChange={(e) => setDepartment(e.target.value)} sx={fieldSx} />,
        )}
        {field(
          t("admin.users.fieldRole"),
          <Select value={role} onChange={(e) => setRole(e.target.value)} size="small" sx={{ height: 40, borderRadius: "8px", fontSize: 14, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" } }}>
            <MenuItem value="EMPLOYEE">{t("admin.users.roleEmployee")}</MenuItem>
            <MenuItem value="ADMIN">{t("admin.users.roleAdmin")}</MenuItem>
          </Select>,
        )}
      </DialogContent>
      <DialogActions sx={{ p: "16px 24px" }}>
        <Button onClick={onClose} disabled={loading} sx={{ textTransform: "none", color: "#64748B", border: "1px solid #E2E8F0", borderRadius: "8px", px: "20px" }}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          disabled={loading || !canSubmit}
          onClick={() =>
            onSubmit(
              { username: username.trim(), password, nickname: nickname.trim(), role, employeeId: employeeId.trim() || undefined, department: department.trim() || undefined },
              editing ? user?.id : undefined,
            )
          }
          sx={{ textTransform: "none", borderRadius: "8px", px: "20px" }}
        >
          {editing ? t("common.save") : t("common.create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
