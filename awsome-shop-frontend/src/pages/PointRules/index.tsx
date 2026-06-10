import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import RuleIcon from "@mui/icons-material/Rule";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TollIcon from "@mui/icons-material/Toll";
import GroupIcon from "@mui/icons-material/Group";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CakeIcon from "@mui/icons-material/Cake";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CelebrationIcon from "@mui/icons-material/Celebration";
import StarIcon from "@mui/icons-material/Star";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {
  listPointRules,
  createPointRule,
  updatePointRule,
  updatePointRuleStatus,
} from "../../services/api/pointRule";
import type {
  PointRuleDTO,
  PageResult,
  CreatePointRuleRequest,
} from "../../types/api";
import AdminPageHeader from "../../components/AdminPageHeader";
import { AppSnackbar, useSnackbar } from "../../components/AppSnackbar";
import { BusinessError } from "../../services/request";

// ---- Rule type styling ----

interface RuleTypeStyle {
  label: string;
  textColor: string;
  bgColor: string;
}

const RULE_TYPE_STYLES: Record<string, RuleTypeStyle> = {
  FIXED: { label: "固定发放", textColor: "#2563EB", bgColor: "#EFF6FF" },
  EVENT: { label: "事件触发", textColor: "#8B5CF6", bgColor: "#F5F3FF" },
  PERFORMANCE: { label: "绩效关联", textColor: "#059669", bgColor: "#ECFDF5" },
  HOLIDAY: { label: "节日触发", textColor: "#6B7280", bgColor: "#F3F4F6" },
};

const RULE_TYPE_STYLES_EN: Record<string, RuleTypeStyle> = {
  FIXED: { label: "Fixed", textColor: "#2563EB", bgColor: "#EFF6FF" },
  EVENT: { label: "Event", textColor: "#8B5CF6", bgColor: "#F5F3FF" },
  PERFORMANCE: {
    label: "Performance",
    textColor: "#059669",
    bgColor: "#ECFDF5",
  },
  HOLIDAY: { label: "Holiday", textColor: "#6B7280", bgColor: "#F3F4F6" },
};

const DEFAULT_RULE_TYPE_STYLE: RuleTypeStyle = {
  label: "-",
  textColor: "#64748B",
  bgColor: "#F1F5F9",
};

// ---- Row icon styling (color per row index) ----

const ROW_ICON_STYLES: {
  icon: React.ElementType;
  color: string;
  bg: string;
}[] = [
  { icon: CalendarMonthIcon, color: "#2563EB", bg: "#EFF6FF" },
  { icon: EmojiEventsIcon, color: "#8B5CF6", bg: "#F5F3FF" },
  { icon: CakeIcon, color: "#F59E0B", bg: "#FFF7ED" },
  { icon: TrendingUpIcon, color: "#10B981", bg: "#ECFDF5" },
  { icon: PersonAddIcon, color: "#DC2626", bg: "#FEF2F2" },
  { icon: CelebrationIcon, color: "#6B7280", bg: "#F3F4F6" },
];

// ---- Component ----

type RuleDialogMode =
  | { type: "create" }
  | { type: "edit"; rule: PointRuleDTO }
  | null;

export default function PointRuleList() {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language.startsWith("zh");
  const snackbar = useSnackbar();

  const [data, setData] = useState<PageResult<PointRuleDTO> | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [dialog, setDialog] = useState<RuleDialogMode>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listPointRules({ page, size: pageSize });
      setData(res);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleStatus = async (rule: PointRuleDTO) => {
    try {
      await updatePointRuleStatus(rule.id, rule.status === 1 ? 0 : 1);
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

  const handleDialogSubmit = async (form: CreatePointRuleRequest) => {
    setActionLoading(true);
    try {
      if (dialog?.type === "edit") {
        await updatePointRule({ ...form, id: dialog.rule.id });
      } else {
        await createPointRule(form);
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

  const rules = data?.records ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;
  const start = rules.length > 0 ? (page - 1) * pageSize + 1 : 0;
  const end = start + rules.length - 1;

  // Stats derived from data
  const enabledCount = rules.filter((r) => r.status === 1).length;

  return (
    <Box
      sx={{ p: "32px", display: "flex", flexDirection: "column", gap: "20px" }}
    >
      <AdminPageHeader
        title={t("admin.pointRules.title")}
        subtitle={t("admin.pointRules.subtitle")}
        actions={
          <ButtonBase
            onClick={() => setDialog({ type: "create" })}
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
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {t("admin.pointRules.addRule")}
            </Typography>
          </ButtonBase>
        }
      />

      {/* Stat Cards */}
      <Box sx={{ display: "flex", gap: "16px" }}>
        <StatCard
          icon={<RuleIcon sx={{ fontSize: 18, color: "#2563EB" }} />}
          iconBg="#EFF6FF"
          label={t("admin.pointRules.statTotal")}
          value={String(total)}
        />
        <StatCard
          icon={<CheckCircleIcon sx={{ fontSize: 18, color: "#10B981" }} />}
          iconBg="#ECFDF5"
          label={t("admin.pointRules.statEnabled")}
          value={String(enabledCount)}
          valueColor="#10B981"
        />
        <StatCard
          icon={<TollIcon sx={{ fontSize: 18, color: "#F59E0B" }} />}
          iconBg="#FFF7ED"
          label={t("admin.pointRules.statMonthly")}
          value="—"
        />
        <StatCard
          icon={<GroupIcon sx={{ fontSize: 18, color: "#8B5CF6" }} />}
          iconBg="#F5F3FF"
          label={t("admin.pointRules.statEmployees")}
          value="—"
        />
      </Box>

      {/* Table card — scrollable */}
      <Box>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : rules.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 8,
              gap: 2,
            }}
          >
            <StarIcon sx={{ fontSize: 48, color: "#CBD5E1" }} />
            <Typography sx={{ fontSize: 14, color: "#64748B" }}>
              {t("admin.pointRules.noRules")}
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
                  {t("admin.pointRules.thName")}
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
                  {t("admin.pointRules.thType")}
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
                  {t("admin.pointRules.thPoints")}
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
                  {t("admin.pointRules.thCondition")}
                </Typography>
              </Box>
              <Box sx={{ width: 70, display: "flex", alignItems: "center" }}>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#64748B",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {t("admin.pointRules.thStatus")}
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
                  {t("admin.pointRules.thActions")}
                </Typography>
              </Box>
            </Box>

            {/* Table rows */}
            {rules.map((rule, idx) => (
              <RuleRow
                key={rule.id}
                rule={rule}
                rowIndex={idx}
                isZh={isZh}
                onEdit={() => setDialog({ type: "edit", rule })}
                onToggleStatus={() => handleToggleStatus(rule)}
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
            {t("admin.pointRules.showRange", { start, end, total })}
          </Typography>
          <Box sx={{ display: "flex", gap: "4px", alignItems: "center" }}>
            {/* Previous */}
            <ButtonBase
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              sx={{
                width: 32,
                height: 32,
                borderRadius: "6px",
                border: "1px solid #E2E8F0",
                bgcolor: "#fff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                opacity: page <= 1 ? 0.4 : 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  color: "#64748B",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {"<"}
              </Typography>
            </ButtonBase>
            {/* Page numbers */}
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
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {p}
                </Typography>
              </ButtonBase>
            ))}
            {/* Next */}
            <ButtonBase
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              sx={{
                width: 32,
                height: 32,
                borderRadius: "6px",
                border: "1px solid #E2E8F0",
                bgcolor: "#fff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                opacity: page >= pages ? 0.4 : 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  color: "#64748B",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {">"}
              </Typography>
            </ButtonBase>
          </Box>
        </Box>
      )}

      {dialog && (
        <PointRuleDialog
          mode={dialog}
          loading={actionLoading}
          onSubmit={handleDialogSubmit}
          onClose={() => setDialog(null)}
        />
      )}

      <AppSnackbar state={snackbar.state} onClose={snackbar.close} />
    </Box>
  );
}

// ---- Point rule create/edit dialog ----

const RULE_TYPE_OPTIONS = ["FIXED", "EVENT", "PERFORMANCE", "HOLIDAY"];

function PointRuleDialog({
  mode,
  loading,
  onSubmit,
  onClose,
}: {
  mode: NonNullable<RuleDialogMode>;
  loading?: boolean;
  onSubmit: (form: CreatePointRuleRequest) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const rule = mode.type === "edit" ? mode.rule : null;

  const [name, setName] = useState(rule?.name ?? "");
  const [description, setDescription] = useState(rule?.description ?? "");
  const [ruleType, setRuleType] = useState(rule?.ruleType ?? "FIXED");
  const [pointMin, setPointMin] = useState(String(rule?.pointValueMin ?? 0));
  const [pointMax, setPointMax] = useState(String(rule?.pointValueMax ?? 0));
  const [trigger, setTrigger] = useState(rule?.triggerCondition ?? "");

  const typeLabel = (type: string) =>
    ({
      FIXED: t("admin.pointRules.typeFixed"),
      EVENT: t("admin.pointRules.typeEvent"),
      PERFORMANCE: t("admin.pointRules.typePerformance"),
      HOLIDAY: t("admin.pointRules.typeHoliday"),
    })[type] ?? type;

  const handleSave = () => {
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      ruleType,
      pointValueMin: Number(pointMin) || 0,
      pointValueMax: Number(pointMax) || 0,
      triggerCondition: trigger.trim() || undefined,
      status: rule?.status ?? 1,
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
      slotProps={{ paper: { sx: { borderRadius: "12px", width: 460 } } }}
    >
      <DialogTitle
        sx={{
          fontSize: 18,
          fontWeight: 700,
          color: "#1E293B",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {mode.type === "edit"
          ? t("admin.pointRules.dialogEditTitle")
          : t("admin.pointRules.dialogCreateTitle")}
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
            {t("admin.pointRules.fieldName")}
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder={t("admin.pointRules.fieldNamePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={fieldSx}
          />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B" }}>
            {t("admin.pointRules.fieldRuleType")}
          </Typography>
          <Select
            value={ruleType}
            onChange={(e) => setRuleType(e.target.value)}
            size="small"
            sx={{
              height: 40,
              borderRadius: "8px",
              fontSize: 14,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
            }}
          >
            {RULE_TYPE_OPTIONS.map((type) => (
              <MenuItem key={type} value={type}>
                {typeLabel(type)}
              </MenuItem>
            ))}
          </Select>
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
              {t("admin.pointRules.fieldPointMin")}
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={pointMin}
              onChange={(e) => setPointMin(e.target.value)}
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
              {t("admin.pointRules.fieldPointMax")}
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={pointMax}
              onChange={(e) => setPointMax(e.target.value)}
              sx={fieldSx}
            />
          </Box>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B" }}>
            {t("admin.pointRules.fieldTrigger")}
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder={t("admin.pointRules.fieldTriggerPlaceholder")}
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            sx={fieldSx}
          />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B" }}>
            {t("admin.pointRules.fieldDescription")}
          </Typography>
          <TextField
            fullWidth
            size="small"
            multiline
            minRows={2}
            placeholder={t("admin.pointRules.fieldDescriptionPlaceholder")}
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

// ---- Rule Row ----

function RuleRow({
  rule,
  rowIndex,
  isZh,
  onEdit,
  onToggleStatus,
}: {
  rule: PointRuleDTO;
  rowIndex: number;
  isZh: boolean;
  onEdit: () => void;
  onToggleStatus: () => void;
}) {
  const { t } = useTranslation();
  const isEnabled = rule.status === 1;
  const isDisabledRow = !isEnabled;

  // Icon style per row
  const iconStyle = ROW_ICON_STYLES[rowIndex % ROW_ICON_STYLES.length];
  const IconComp = iconStyle.icon;

  // Rule type chip
  const typeStyles = isZh ? RULE_TYPE_STYLES : RULE_TYPE_STYLES_EN;
  const ruleTypeStyle = typeStyles[rule.ruleType] ?? {
    ...DEFAULT_RULE_TYPE_STYLE,
    label: rule.ruleType || "-",
  };

  // Points display
  const pointsText =
    rule.pointValueMin === rule.pointValueMax
      ? String(rule.pointValueMin ?? 0)
      : `${rule.pointValueMin ?? 0}~${rule.pointValueMax ?? 0}`;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        px: "20px",
        py: "14px",
        borderBottom: "1px solid #F1F5F9",
        opacity: isDisabledRow ? 0.6 : 1,
      }}
    >
      {/* Name + description */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          minHeight: 24,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "6px",
              bgcolor: iconStyle.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconComp sx={{ fontSize: 16, color: iconStyle.color }} />
          </Box>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: "#1E293B",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {rule.name}
          </Typography>
        </Box>
        {rule.description && (
          <Typography
            sx={{
              fontSize: 11,
              color: "#64748B",
              fontFamily: "Inter, sans-serif",
              pl: "36px",
            }}
          >
            {rule.description}
          </Typography>
        )}
      </Box>

      {/* Rule type chip */}
      <Box sx={{ width: 100, display: "flex", alignItems: "center" }}>
        <Box
          sx={{
            display: "inline-flex",
            borderRadius: "4px",
            bgcolor: ruleTypeStyle.bgColor,
            px: "8px",
            py: "3px",
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 500,
              color: ruleTypeStyle.textColor,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {ruleTypeStyle.label}
          </Typography>
        </Box>
      </Box>

      {/* Points value */}
      <Box sx={{ width: 100, display: "flex", alignItems: "center" }}>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 700,
            color: "#1E293B",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {pointsText}
        </Typography>
      </Box>

      {/* Trigger condition */}
      <Box sx={{ width: 180, display: "flex", alignItems: "center" }}>
        <Typography
          sx={{
            fontSize: 12,
            color: "#64748B",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {rule.triggerCondition || "—"}
        </Typography>
      </Box>

      {/* Status chip */}
      <Box sx={{ width: 70, display: "flex", alignItems: "center" }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "12px",
            bgcolor: isEnabled ? "#DCFCE7" : "#FEE2E2",
            px: "10px",
            py: "4px",
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 500,
              color: isEnabled ? "#166534" : "#991B1B",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {isEnabled
              ? t("admin.pointRules.statusEnabled")
              : t("admin.pointRules.statusDisabled")}
          </Typography>
        </Box>
      </Box>

      {/* Actions */}
      <Box
        sx={{ width: 90, display: "flex", alignItems: "center", gap: "12px" }}
      >
        <ButtonBase
          onClick={onEdit}
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
            {t("admin.pointRules.edit")}
          </Typography>
        </ButtonBase>
        <ButtonBase
          onClick={onToggleStatus}
          sx={{ "&:hover": { textDecoration: "underline" } }}
        >
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 500,
              color: isEnabled ? "#D97706" : "#10B981",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {isEnabled
              ? t("admin.pointRules.disable")
              : t("admin.pointRules.enable")}
          </Typography>
        </ButtonBase>
      </Box>
    </Box>
  );
}
