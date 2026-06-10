import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import Button from "@mui/material/Button";
import InputBase from "@mui/material/InputBase";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DevicesIcon from "@mui/icons-material/Devices";
import RedeemIcon from "@mui/icons-material/Redeem";
import HomeIcon from "@mui/icons-material/Home";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import WatchIcon from "@mui/icons-material/Watch";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import CategoryIcon from "@mui/icons-material/Category";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
} from "../../services/api/category";
import type {
  CategoryDTO,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../../types/api";
import AdminPageHeader from "../../components/AdminPageHeader";
import { AppSnackbar, useSnackbar } from "../../components/AppSnackbar";
import { BusinessError } from "../../services/request";

// ---- Icon registry ----

const ICON_MAP: Record<string, React.ElementType> = {
  devices: DevicesIcon,
  redeem: RedeemIcon,
  home: HomeIcon,
  business_center: BusinessCenterIcon,
  headphones: HeadphonesIcon,
  watch: WatchIcon,
  keyboard: KeyboardIcon,
  shopping_bag: ShoppingBagIcon,
  restaurant: RestaurantIcon,
  sports_esports: SportsEsportsIcon,
};

// Parent category icon colors (design shows different colors per category)
const PARENT_ICON_COLORS: string[] = [
  "#2563EB",
  "#F59E0B",
  "#10B981",
  "#6366F1",
  "#EC4899",
  "#8B5CF6",
];

// ---- Helpers ----

/** Count all nodes (including nested children) in a category tree. */
function countAll(nodes: CategoryDTO[]): number {
  let count = 0;
  for (const n of nodes) {
    count += 1;
    if (n.children?.length) count += countAll(n.children);
  }
  return count;
}

// ---- Component ----

// Dialog mode for the create/edit category form
type DialogMode =
  | { type: "create"; parentId: number | null; parentName?: string }
  | { type: "edit"; node: CategoryDTO }
  | null;

export default function CategoryList() {
  const { t } = useTranslation();
  const snackbar = useSnackbar();

  const [tree, setTree] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "1" | "0">("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const [dialog, setDialog] = useState<DialogMode>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryDTO | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listCategories({
        name: search || undefined,
        status: statusFilter !== "" ? Number(statusFilter) : undefined,
      });
      // API already returns a nested tree with children populated
      setTree(res);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-expand all parent nodes on first load
  useEffect(() => {
    if (tree.length > 0 && expanded.size === 0) {
      setExpanded(
        new Set(tree.filter((n) => n.children?.length > 0).map((n) => n.id)),
      );
    }
  }, [tree]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle enable/disable status, then refresh
  const handleToggleStatus = async (node: CategoryDTO) => {
    try {
      await updateCategoryStatus(node.id, node.status === 1 ? 0 : 1);
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

  // Delete after confirm, then refresh
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await deleteCategory(deleteTarget.id);
      snackbar.showSuccess(t("common.deleteSuccess"));
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      snackbar.showError(
        err instanceof BusinessError ? err.message : t("common.deleteFailed"),
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Create or update from dialog, then refresh
  const handleDialogSubmit = async (form: CreateCategoryRequest) => {
    setActionLoading(true);
    try {
      if (dialog?.type === "edit") {
        await updateCategory({
          ...form,
          id: dialog.node.id,
        } as UpdateCategoryRequest);
      } else {
        await createCategory(form);
      }
      snackbar.showSuccess(t("common.saveSuccess"));
      setDialog(null);
      fetchData();
    } catch (err) {
      snackbar.showError(
        err instanceof BusinessError ? err.message : t("common.saveFailed"),
      );
    } finally {
      setActionLoading(false);
    }
  };

  const parentCount = tree.length;
  const totalCount = useMemo(() => countAll(tree), [tree]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") fetchData();
  };

  return (
    <Box
      sx={{ p: "32px", display: "flex", flexDirection: "column", gap: "20px" }}
    >
      <AdminPageHeader
        title={t("admin.categories.title")}
        actions={
          <ButtonBase
            onClick={() => setDialog({ type: "create", parentId: null })}
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
              {t("admin.categories.addCategory")}
            </Typography>
          </ButtonBase>
        }
      />

      {/* Toolbar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
            placeholder={t("admin.categories.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{
              flex: 1,
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
              "& input::placeholder": { color: "#CBD5E1", opacity: 1 },
            }}
          />
        </Box>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "" | "1" | "0")}
          displayEmpty
          size="small"
          sx={{
            height: 40,
            borderRadius: "8px",
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            color: "#64748B",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
            "& .MuiSelect-select": { py: "8px", px: "14px" },
          }}
        >
          <MenuItem value="">{t("admin.categories.allStatus")}</MenuItem>
          <MenuItem value="1">{t("admin.categories.statusEnabled")}</MenuItem>
          <MenuItem value="0">{t("admin.categories.statusDisabled")}</MenuItem>
        </Select>

        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: 13,
              color: "#64748B",
              fontFamily: "Inter, sans-serif",
            }}
          >
            共 {totalCount} 个类目
          </Typography>
        </Box>
      </Box>

      {/* Table card — scrollable */}
      <Box>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : tree.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 8,
              gap: 2,
            }}
          >
            <CategoryIcon sx={{ fontSize: 48, color: "#CBD5E1" }} />
            <Typography sx={{ fontSize: 14, color: "#64748B" }}>
              {t("admin.categories.noCategories")}
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
                py: "14px",
              }}
            >
              <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#64748B",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {t("admin.categories.thName")}
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
                  {t("admin.categories.thProductCount")}
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
                  {t("admin.categories.thSortOrder")}
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
                  {t("admin.categories.thStatus")}
                </Typography>
              </Box>
              <Box sx={{ width: 180, display: "flex", alignItems: "center" }}>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#64748B",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {t("admin.categories.thActions")}
                </Typography>
              </Box>
            </Box>

            {/* Table rows */}
            {tree.map((parent, idx) => (
              <ParentRow
                key={parent.id}
                node={parent}
                colorIndex={idx}
                expanded={expanded.has(parent.id)}
                onToggle={() => toggleExpand(parent.id)}
                onEdit={(node) => setDialog({ type: "edit", node })}
                onAddSub={(node) =>
                  setDialog({
                    type: "create",
                    parentId: node.id,
                    parentName: node.name,
                  })
                }
                onToggleStatus={handleToggleStatus}
                onDelete={(node) => setDeleteTarget(node)}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Pagination */}
      {parentCount > 0 && (
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
            {t("admin.categories.showRange", {
              start: 1,
              end: parentCount,
              total: parentCount,
            })}
          </Typography>
          <Box sx={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <ButtonBase
              onClick={() => fetchData()}
              sx={{
                width: 32,
                height: 32,
                borderRadius: "4px",
                border: "1px solid #E2E8F0",
                bgcolor: "#2563EB",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#fff",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                1
              </Typography>
            </ButtonBase>
          </Box>
        </Box>
      )}

      {/* Create / Edit dialog */}
      {dialog && (
        <CategoryDialog
          mode={dialog}
          loading={actionLoading}
          onSubmit={handleDialogSubmit}
          onClose={() => setDialog(null)}
        />
      )}

      {/* Delete confirm (strong: type-to-confirm) */}
      {deleteTarget && (
        <DeleteCategoryDialog
          node={deleteTarget}
          loading={actionLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <AppSnackbar state={snackbar.state} onClose={snackbar.close} />
    </Box>
  );
}

// ---- Category create/edit dialog ----

function CategoryDialog({
  mode,
  loading,
  onSubmit,
  onClose,
}: {
  mode: NonNullable<DialogMode>;
  loading?: boolean;
  onSubmit: (form: CreateCategoryRequest) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const editing = mode.type === "edit";
  const node = editing ? mode.node : null;

  const [name, setName] = useState(node?.name ?? "");
  const [icon, setIcon] = useState(node?.icon ?? "");
  const [sortOrder, setSortOrder] = useState(String(node?.sortOrder ?? 0));
  const [enabled, setEnabled] = useState((node?.status ?? 1) === 1);
  const [description, setDescription] = useState(node?.description ?? "");

  const title = editing
    ? t("admin.categories.dialogEditTitle")
    : mode.parentId != null
      ? t("admin.categories.dialogCreateSubTitle")
      : t("admin.categories.dialogCreateTitle");

  const handleSave = () => {
    onSubmit({
      name: name.trim(),
      parentId: editing ? (node?.parentId ?? null) : mode.parentId,
      icon: icon.trim() || undefined,
      sortOrder: Number(sortOrder) || 0,
      status: enabled ? 1 : 0,
      description: description.trim() || undefined,
    });
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      fontFamily: "Inter, sans-serif",
      fontSize: 14,
      "& fieldset": { borderColor: "#E2E8F0" },
    },
  };

  return (
    <Dialog
      open
      onClose={onClose}
      slotProps={{ paper: { sx: { borderRadius: "12px", width: 440 } } }}
    >
      <DialogTitle
        sx={{
          fontSize: 18,
          fontWeight: 700,
          color: "#1E293B",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {title}
        {mode.type === "create" && mode.parentName
          ? ` - ${mode.parentName}`
          : ""}
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
            {t("admin.categories.fieldName")}
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder={t("admin.categories.fieldNamePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={fieldSx}
          />
        </Box>
        <Box sx={{ display: "flex", gap: "12px" }}>
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <Typography
              sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B" }}
            >
              {t("admin.categories.fieldIcon")}
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder={t("admin.categories.fieldIconPlaceholder")}
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              sx={fieldSx}
            />
          </Box>
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <Typography
              sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B" }}
            >
              {t("admin.categories.fieldSortOrder")}
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              sx={fieldSx}
            />
          </Box>
        </Box>
        <FormControlLabel
          control={<Switch checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />}
          label={
            <Typography sx={{ fontSize: 13, color: "#1E293B" }}>
              {enabled ? t("admin.categories.statusEnabled") : t("admin.categories.statusDisabled")}
            </Typography>
          }
        />
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B" }}>
            {t("admin.categories.fieldDescription")}
          </Typography>
          <TextField
            fullWidth
            size="small"
            multiline
            minRows={2}
            placeholder={t("admin.categories.fieldDescriptionPlaceholder")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={fieldSx}
          />
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
          onClick={handleSave}
          disabled={loading || !name.trim()}
          sx={{
            borderRadius: "8px",
            bgcolor: name.trim() && !loading ? "#2563EB" : "#93C5FD",
            px: "20px",
            py: "8px",
            "&:hover": {
              bgcolor: name.trim() && !loading ? "#1D4ED8" : "#93C5FD",
            },
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
            {t("common.save")}
          </Typography>
        </ButtonBase>
      </DialogActions>
    </Dialog>
  );
}

// ---- Parent category row ----

function ParentRow({
  node,
  colorIndex,
  expanded,
  onToggle,
  onEdit,
  onAddSub,
  onToggleStatus,
  onDelete,
}: {
  node: CategoryDTO;
  colorIndex: number;
  expanded: boolean;
  onToggle: () => void;
  onEdit: (node: CategoryDTO) => void;
  onAddSub: (node: CategoryDTO) => void;
  onToggleStatus: (node: CategoryDTO) => void;
  onDelete: (node: CategoryDTO) => void;
}) {
  const { t } = useTranslation();
  const hasChildren = node.children?.length > 0;
  const iconColor = PARENT_ICON_COLORS[colorIndex % PARENT_ICON_COLORS.length];
  const IconComp = ICON_MAP[node.icon] || CategoryIcon;
  const isEnabled = node.status === 1;

  return (
    <>
      {/* Parent row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          bgcolor: "#F8FAFC",
          px: "20px",
          py: "14px",
          borderBottom: "1px solid #F1F5F9",
        }}
      >
        {/* Name cell */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minHeight: 24,
          }}
        >
          {hasChildren ? (
            <ButtonBase
              onClick={onToggle}
              sx={{ borderRadius: "4px", p: "2px" }}
            >
              {expanded ? (
                <ExpandMoreIcon sx={{ fontSize: 18, color: "#64748B" }} />
              ) : (
                <ChevronRightIcon sx={{ fontSize: 18, color: "#64748B" }} />
              )}
            </ButtonBase>
          ) : (
            <Box sx={{ width: 22 }} />
          )}
          <IconComp sx={{ fontSize: 20, color: iconColor }} />
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: "#1E293B",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {node.name}
          </Typography>
        </Box>

        {/* Product count */}
        <Box sx={{ width: 100, display: "flex", alignItems: "center" }}>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: "#1E293B",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {node.productCount ?? 0}
          </Typography>
        </Box>

        {/* Sort order */}
        <Box sx={{ width: 100, display: "flex", alignItems: "center" }}>
          <Typography
            sx={{
              fontSize: 13,
              color: "#1E293B",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {node.sortOrder ?? 0}
          </Typography>
        </Box>

        {/* Status chip */}
        <Box sx={{ width: 90, display: "flex", alignItems: "center" }}>
          <StatusChip enabled={isEnabled} />
        </Box>

        {/* Actions */}
        <Box
          sx={{
            width: 180,
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <ButtonBase
            onClick={() => onEdit(node)}
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
              {t("admin.categories.edit")}
            </Typography>
          </ButtonBase>
          <ButtonBase
            onClick={() => onAddSub(node)}
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
              {t("admin.categories.addSub")}
            </Typography>
          </ButtonBase>
          <ButtonBase
            onClick={() => onToggleStatus(node)}
            sx={{ "&:hover": { textDecoration: "underline" } }}
          >
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 500,
                color: isEnabled ? "#D97706" : "#2563EB",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {isEnabled
                ? t("admin.categories.disable")
                : t("admin.categories.enable")}
            </Typography>
          </ButtonBase>
        </Box>
      </Box>

      {/* Child rows */}
      {expanded &&
        node.children.map((child) => (
          <ChildRow
            key={child.id}
            node={child}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
    </>
  );
}

// ---- Child category row ----

function ChildRow({
  node,
  onEdit,
  onDelete,
}: {
  node: CategoryDTO;
  onEdit: (node: CategoryDTO) => void;
  onDelete: (node: CategoryDTO) => void;
}) {
  const { t } = useTranslation();
  const IconComp = ICON_MAP[node.icon] || CategoryIcon;
  const isEnabled = node.status === 1;

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
      {/* Name cell — indented with left padding to align under parent name */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          pl: "46px",
          minHeight: 24,
        }}
      >
        <IconComp sx={{ fontSize: 18, color: "#64748B" }} />
        <Typography
          sx={{
            fontSize: 13,
            color: "#1E293B",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {node.name}
        </Typography>
      </Box>

      {/* Product count */}
      <Box sx={{ width: 100, display: "flex", alignItems: "center" }}>
        <Typography
          sx={{
            fontSize: 13,
            color: "#1E293B",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {node.productCount ?? 0}
        </Typography>
      </Box>

      {/* Sort order */}
      <Box sx={{ width: 100, display: "flex", alignItems: "center" }}>
        <Typography
          sx={{
            fontSize: 13,
            color: "#1E293B",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {node.sortOrder ?? 0}
        </Typography>
      </Box>

      {/* Status chip */}
      <Box sx={{ width: 90, display: "flex", alignItems: "center" }}>
        <StatusChip enabled={isEnabled} />
      </Box>

      {/* Actions */}
      <Box
        sx={{ width: 180, display: "flex", alignItems: "center", gap: "12px" }}
      >
        <ButtonBase
          onClick={() => onEdit(node)}
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
            {t("admin.categories.edit")}
          </Typography>
        </ButtonBase>
        <ButtonBase
          onClick={() => onDelete(node)}
          sx={{ "&:hover": { textDecoration: "underline" } }}
        >
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 500,
              color: "#DC2626",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {t("admin.categories.delete")}
          </Typography>
        </ButtonBase>
      </Box>
    </Box>
  );
}

// ---- Status chip ----

function StatusChip({ enabled }: { enabled: boolean }) {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
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
          fontFamily: "Inter, sans-serif",
        }}
      >
        {enabled
          ? t("admin.categories.statusEnabled")
          : t("admin.categories.statusDisabled")}
      </Typography>
    </Box>
  );
}


// ---- dlg-06 强确认删除类目 ----
function DeleteCategoryDialog({
  node,
  loading,
  onConfirm,
  onCancel,
}: {
  node: CategoryDTO;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const matched = input.trim() === node.name;

  return (
    <Dialog open onClose={onCancel} slotProps={{ paper: { sx: { borderRadius: "12px", width: 440 } } }}>
      <DialogTitle sx={{ fontSize: 18, fontWeight: 700, color: "#DC2626" }}>
        {t("admin.categories.deleteConfirmTitle")}
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: "16px", pt: "8px !important" }}>
        <Box sx={{ bgcolor: "#FEF2F2", borderRadius: "8px", p: "12px 16px" }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#991B1B" }}>
            {t("admin.categories.deleteImpactTitle")}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#B91C1C", mt: "4px", lineHeight: 1.6 }}>
            {t("admin.categories.deleteImpactBody")}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 13, color: "#1E293B" }}>
          {t("admin.categories.deleteTypeHint")}
          <Box component="span" sx={{ fontWeight: 700, color: "#DC2626", mx: "4px" }}>{node.name}</Box>
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder={node.name}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14, "& fieldset": { borderColor: "#E2E8F0" } } }}
        />
      </DialogContent>
      <DialogActions sx={{ p: "16px 24px" }}>
        <Button onClick={onCancel} disabled={loading} sx={{ textTransform: "none", color: "#64748B", border: "1px solid #E2E8F0", borderRadius: "8px", px: "20px" }}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={loading || !matched}
          onClick={onConfirm}
          sx={{ textTransform: "none", borderRadius: "8px", px: "20px" }}
        >
          {t("admin.categories.confirmDelete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
