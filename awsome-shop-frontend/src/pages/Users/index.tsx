import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import AddIcon from "@mui/icons-material/Add";
import GroupIcon from "@mui/icons-material/Group";
import {
  listUsers,
  createUser,
  updateUserStatus,
} from "../../services/api/user";
import type { UserDTO, PageResult, CreateUserRequest } from "../../types/api";
import AdminPageHeader from "../../components/AdminPageHeader";
import { AppSnackbar, useSnackbar } from "../../components/AppSnackbar";
import { BusinessError } from "../../services/request";

const PAGE_SIZE = 10;

export default function Users() {
  const { t } = useTranslation();
  const snackbar = useSnackbar();

  const [data, setData] = useState<PageResult<UserDTO> | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    listUsers({ page, size: PAGE_SIZE })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const users = data?.records ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;
  const start = users.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const end = start + users.length - 1;

  const handleToggleStatus = async (user: UserDTO) => {
    try {
      await updateUserStatus(
        user.id,
        user.status === "ACTIVE" ? "DISABLED" : "ACTIVE",
      );
      snackbar.showSuccess(t("common.operationSuccess"));
      fetchData();
    } catch (err) {
      snackbar.showError(
        err instanceof BusinessError
          ? err.message
          : t("common.operationFailed"),
      );
    }
  };

  const handleCreate = async (form: CreateUserRequest) => {
    setActionLoading(true);
    try {
      await createUser(form);
      snackbar.showSuccess(t("admin.users.createSuccess"));
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      snackbar.showError(
        err instanceof BusinessError
          ? err.message
          : t("admin.users.createFailed"),
      );
    } finally {
      setActionLoading(false);
    }
  };

  const roleLabel = (role: string) =>
    role?.toLowerCase() === "admin"
      ? t("admin.users.roleAdmin")
      : t("admin.users.roleEmployee");

  return (
    <Box
      sx={{ p: "32px", display: "flex", flexDirection: "column", gap: "20px" }}
    >
      <AdminPageHeader
        title={t("admin.users.title")}
        subtitle={t("admin.users.subtitle")}
        actions={
          <ButtonBase
            onClick={() => setDialogOpen(true)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              bgcolor: "#2563EB",
              color: "#fff",
              borderRadius: "8px",
              px: "20px",
              py: "10px",
              "&:hover": { bgcolor: "#1D4ED8" },
            }}
          >
            <AddIcon sx={{ fontSize: 18 }} />
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 500,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {t("admin.users.addUser")}
            </Typography>
          </ButtonBase>
        }
      />

      <Box>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 8,
              gap: 2,
            }}
          >
            <GroupIcon sx={{ fontSize: 48, color: "#CBD5E1" }} />
            <Typography sx={{ fontSize: 14, color: "#64748B" }}>
              {t("admin.users.noUsers")}
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
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}
                >
                  {t("admin.users.thUsername")}
                </Typography>
              </Box>
              <Box sx={{ width: 140 }}>
                <Typography
                  sx={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}
                >
                  {t("admin.users.thNickname")}
                </Typography>
              </Box>
              <Box sx={{ width: 90 }}>
                <Typography
                  sx={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}
                >
                  {t("admin.users.thRole")}
                </Typography>
              </Box>
              <Box sx={{ width: 90 }}>
                <Typography
                  sx={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}
                >
                  {t("admin.users.thStatus")}
                </Typography>
              </Box>
              <Box sx={{ width: 130 }}>
                <Typography
                  sx={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}
                >
                  {t("admin.users.thLastLogin")}
                </Typography>
              </Box>
              <Box sx={{ width: 80 }}>
                <Typography
                  sx={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}
                >
                  {t("admin.users.thActions")}
                </Typography>
              </Box>
            </Box>

            {/* Rows */}
            {users.map((user) => {
              const enabled = user.status === "ACTIVE";
              return (
                <Box
                  key={user.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: "20px",
                    py: "14px",
                    borderTop: "1px solid #F1F5F9",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}
                    >
                      {user.username}
                    </Typography>
                  </Box>
                  <Box sx={{ width: 140 }}>
                    <Typography sx={{ fontSize: 13, color: "#1E293B" }}>
                      {user.nickname || "—"}
                    </Typography>
                  </Box>
                  <Box sx={{ width: 90 }}>
                    <Typography sx={{ fontSize: 13, color: "#64748B" }}>
                      {roleLabel(user.role)}
                    </Typography>
                  </Box>
                  <Box sx={{ width: 90 }}>
                    <Box
                      sx={{
                        display: "inline-flex",
                        borderRadius: "12px",
                        bgcolor: enabled ? "#DCFCE7" : "#FEE2E2",
                        px: "10px",
                        py: "4px",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: enabled ? "#166534" : "#991B1B",
                        }}
                      >
                        {enabled
                          ? t("admin.users.statusEnabled")
                          : t("admin.users.statusDisabled")}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ width: 130 }}>
                    <Typography sx={{ fontSize: 12, color: "#64748B" }}>
                      {(user.lastLoginAt ?? "").slice(0, 10) || "—"}
                    </Typography>
                  </Box>
                  <Box sx={{ width: 80 }}>
                    <ButtonBase
                      onClick={() => handleToggleStatus(user)}
                      sx={{ "&:hover": { textDecoration: "underline" } }}
                    >
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: enabled ? "#D97706" : "#10B981",
                        }}
                      >
                        {enabled
                          ? t("admin.users.disable")
                          : t("admin.users.enable")}
                      </Typography>
                    </ButtonBase>
                  </Box>
                </Box>
              );
            })}
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
          <Typography sx={{ fontSize: 13, color: "#64748B" }}>
            {t("admin.users.showRange", { start, end, total })}
          </Typography>
          <Box sx={{ display: "flex", gap: "4px", alignItems: "center" }}>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <ButtonBase
                key={p}
                onClick={() => setPage(p)}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "6px",
                  border: p === page ? "none" : "1px solid #E2E8F0",
                  bgcolor: p === page ? "#2563EB" : "#fff",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: p === page ? "#fff" : "#64748B",
                  }}
                >
                  {p}
                </Typography>
              </ButtonBase>
            ))}
          </Box>
        </Box>
      )}

      {dialogOpen && (
        <UserDialog
          loading={actionLoading}
          onSubmit={handleCreate}
          onClose={() => setDialogOpen(false)}
        />
      )}

      <AppSnackbar state={snackbar.state} onClose={snackbar.close} />
    </Box>
  );
}

function UserDialog({
  loading,
  onSubmit,
  onClose,
}: {
  loading?: boolean;
  onSubmit: (form: CreateUserRequest) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [role, setRole] = useState("EMPLOYEE");

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      fontFamily: "Inter, sans-serif",
      fontSize: 14,
      "& fieldset": { borderColor: "#E2E8F0" },
    },
  };

  const canSubmit = username.trim() && password.trim();

  return (
    <Dialog
      open
      onClose={onClose}
      slotProps={{ paper: { sx: { borderRadius: "12px", width: 440 } } }}
    >
      <DialogTitle sx={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>
        {t("admin.users.dialogCreateTitle")}
      </DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          pt: "8px !important",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B" }}>
            {t("admin.users.fieldUsername")}
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder={t("admin.users.fieldUsernamePlaceholder")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={fieldSx}
          />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B" }}>
            {t("admin.users.fieldPassword")}
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="password"
            placeholder={t("admin.users.fieldPasswordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={fieldSx}
          />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B" }}>
            {t("admin.users.fieldNickname")}
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder={t("admin.users.fieldNicknamePlaceholder")}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            sx={fieldSx}
          />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B" }}>
            {t("admin.users.fieldRole")}
          </Typography>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            size="small"
            sx={{
              height: 40,
              borderRadius: "8px",
              fontSize: 14,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
            }}
          >
            <MenuItem value="EMPLOYEE">
              {t("admin.users.roleEmployee")}
            </MenuItem>
            <MenuItem value="ADMIN">{t("admin.users.roleAdmin")}</MenuItem>
          </Select>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: "16px 24px" }}>
        <ButtonBase
          onClick={onClose}
          disabled={loading}
          sx={{
            borderRadius: "8px",
            border: "1px solid #E2E8F0",
            px: "20px",
            py: "8px",
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B" }}>
            {t("common.cancel")}
          </Typography>
        </ButtonBase>
        <ButtonBase
          onClick={() =>
            onSubmit({
              username: username.trim(),
              password,
              nickname: nickname.trim(),
              role,
            })
          }
          disabled={loading || !canSubmit}
          sx={{
            borderRadius: "8px",
            bgcolor: canSubmit && !loading ? "#2563EB" : "#93C5FD",
            px: "20px",
            py: "8px",
            "&:hover": {
              bgcolor: canSubmit && !loading ? "#1D4ED8" : "#93C5FD",
            },
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
            {t("common.create")}
          </Typography>
        </ButtonBase>
      </DialogActions>
    </Dialog>
  );
}
