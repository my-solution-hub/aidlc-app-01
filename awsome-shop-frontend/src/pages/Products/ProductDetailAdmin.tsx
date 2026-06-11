import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TuneIcon from "@mui/icons-material/Tune";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  getProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
  adjustStock,
} from "../../services/api/product";
import { uploadFile } from "../../services/api/file";
import type { ProductDTO, StockAdjustRequest } from "../../types/api";
import { AppSnackbar, useSnackbar } from "../../components/AppSnackbar";
import { BusinessError } from "../../services/request";
import { resolveImageUrl } from "../../utils/image";

type DialogKind = "offShelf" | "stock" | "upload" | null;

function InfoField({ label, value, valueColor }: { label: string; value: React.ReactNode; valueColor?: string }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <Typography sx={{ fontSize: 12, color: "#94A3B8" }}>{label}</Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 500, color: valueColor ?? "#1E293B" }}>{value}</Typography>
    </Box>
  );
}

export default function ProductDetailAdmin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const { showError } = snackbar;
  const { id } = useParams<{ id: string }>();
  const productId = id ? Number(id) : null;

  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      setProduct(await getProduct(productId));
    } catch {
      showError(t("admin.products.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [productId, showError, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onSale = product?.status === 1;

  const buildPayload = (p: ProductDTO, overrides: Partial<ProductDTO>) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    brand: p.brand,
    pointsPrice: p.pointsPrice,
    marketPrice: p.marketPrice,
    stock: p.stock,
    status: p.status,
    description: p.description,
    imageUrl: p.imageUrl,
    subtitle: p.subtitle,
    deliveryMethod: p.deliveryMethod,
    serviceGuarantee: p.serviceGuarantee,
    promotion: p.promotion,
    colors: p.colors,
    specs: p.specs,
    ...overrides,
  });

  const handleToggleStatus = async () => {
    if (!product) return;
    // Off-shelf goes through confirm dialog; on-shelf is direct.
    if (onSale) {
      setDialog("offShelf");
      return;
    }
    setActionLoading(true);
    try {
      await updateProductStatus(product.id, 1);
      snackbar.showSuccess(t("common.operationSuccess"));
      fetchData();
    } catch (err) {
      snackbar.showError(err instanceof BusinessError ? err.message : t("admin.products.statusUpdateFailed"));
    } finally {
      setActionLoading(false);
    }
  };

  const confirmOffShelf = async () => {
    if (!product) return;
    setActionLoading(true);
    try {
      await updateProductStatus(product.id, 0);
      snackbar.showSuccess(t("admin.products.offShelfSuccess"));
      setDialog(null);
      fetchData();
    } catch (err) {
      snackbar.showError(err instanceof BusinessError ? err.message : t("admin.products.statusUpdateFailed"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustStock = async (data: StockAdjustRequest) => {
    if (!product) return;
    setActionLoading(true);
    try {
      await adjustStock(product.id, data);
      snackbar.showSuccess(t("admin.products.stockSuccess"));
      setDialog(null);
      fetchData();
    } catch (err) {
      snackbar.showError(err instanceof BusinessError ? err.message : t("admin.products.updateFailed"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveImage = async (url: string) => {
    if (!product) return;
    setActionLoading(true);
    try {
      await updateProduct(buildPayload(product, { imageUrl: url }));
      snackbar.showSuccess(t("admin.products.uploadSuccess"));
      setDialog(null);
      fetchData();
    } catch (err) {
      snackbar.showError(err instanceof BusinessError ? err.message : t("admin.products.updateFailed"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    if (!window.confirm(t("admin.products.deleteConfirmMessage", { name: product.name }))) return;
    try {
      await deleteProduct(product.id);
      snackbar.showSuccess(t("admin.products.deleteSuccess"));
      navigate("/admin/products");
    } catch (err) {
      snackbar.showError(err instanceof BusinessError ? err.message : t("admin.products.deleteFailed"));
    }
  };

  const headerBtnSx = {
    textTransform: "none" as const,
    borderRadius: "8px",
    fontSize: 13,
    fontWeight: 600,
    px: "16px",
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10, gap: 2 }}>
        <Inventory2Icon sx={{ fontSize: 48, color: "#CBD5E1" }} />
        <Typography sx={{ fontSize: 14, color: "#64748B" }}>{t("admin.products.noProducts")}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mb: "6px" }}>
            <Typography
              onClick={() => navigate("/admin/products")}
              sx={{ fontSize: 13, color: "#2563EB", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
            >
              {t("admin.products.title")}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#CBD5E1" }}>/</Typography>
            <Typography sx={{ fontSize: 13, color: "#64748B" }}>{t("admin.products.breadcrumbDetail")}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#1E293B" }}>{product.name}</Typography>
            <Box sx={{ borderRadius: "10px", bgcolor: onSale ? "#DCFCE7" : "#FEE2E2", px: "10px", py: "3px" }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: onSale ? "#166534" : "#991B1B" }}>
                {onSale ? t("admin.products.statusOnSale") : t("admin.products.statusOffSale")}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: "8px" }}>
          <Button
            variant="outlined"
            startIcon={onSale ? <VisibilityOffIcon sx={{ fontSize: 16 }} /> : <VisibilityIcon sx={{ fontSize: 16 }} />}
            onClick={handleToggleStatus}
            disabled={actionLoading}
            sx={{ ...headerBtnSx, color: "#D97706", borderColor: "#FCD34D" }}
          >
            {onSale ? t("admin.products.detail.offShelf") : t("admin.products.detail.onShelf")}
          </Button>
          <Button
            variant="outlined"
            startIcon={<TuneIcon sx={{ fontSize: 16 }} />}
            onClick={() => setDialog("stock")}
            sx={{ ...headerBtnSx, color: "#64748B", borderColor: "#E2E8F0" }}
          >
            {t("admin.products.detail.adjustStock")}
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate(`/admin/products/${product.id}/edit`)}
            sx={headerBtnSx}
          >
            {t("admin.products.detail.editProduct")}
          </Button>
          <Button
            variant="outlined"
            startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
            onClick={handleDelete}
            sx={{ ...headerBtnSx, color: "#DC2626", borderColor: "#FECACA" }}
          >
            {t("admin.products.delete")}
          </Button>
        </Box>
      </Box>

      {/* Two-column: images + basic info */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "20px" }}>
        {/* Images */}
        <Box sx={{ bgcolor: "#fff", borderRadius: "12px", border: "1px solid #F1F5F9", p: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#1E293B" }}>{t("admin.products.detail.productImages")}</Typography>
            <Button
              size="small"
              startIcon={<ImageIcon sx={{ fontSize: 16 }} />}
              onClick={() => setDialog("upload")}
              sx={{ textTransform: "none", fontSize: 12, color: "#2563EB", border: "1px solid #E2E8F0", borderRadius: "6px" }}
            >
              {t("admin.products.detail.uploadImage")}
            </Button>
          </Box>
          <Box
            sx={{
              height: 300,
              borderRadius: "8px",
              bgcolor: "#EFF6FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {(product.images?.[0] ?? product.imageUrl) ? (
              <Box component="img" src={resolveImageUrl(product.images?.[0] ?? product.imageUrl)} alt={product.name} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <Inventory2Icon sx={{ fontSize: 72, color: "#93C5FD" }} />
            )}
          </Box>
          {product.images && product.images.length > 1 && (
            <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {product.images.map((img, i) => (
                <Box
                  key={i}
                  component="img"
                  src={resolveImageUrl(img)}
                  alt={`${product.name}-${i}`}
                  sx={{ width: 48, height: 48, borderRadius: "6px", objectFit: "cover", border: "1px solid #E2E8F0" }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Basic info */}
        <Box sx={{ bgcolor: "#fff", borderRadius: "12px", border: "1px solid #F1F5F9", p: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#1E293B" }}>{t("admin.products.basicInfo")}</Typography>
          <Box sx={{ height: "1px", bgcolor: "#F1F5F9" }} />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <InfoField label={t("admin.products.productName")} value={product.name} />
            <InfoField label={t("admin.products.sku")} value={product.sku || "—"} />
            <InfoField label={t("admin.products.category")} value={product.category || "—"} />
            <InfoField label={t("admin.products.brand")} value={product.brand || "—"} />
            <InfoField label={t("admin.products.pointsPrice")} value={`${product.pointsPrice?.toLocaleString()} ${t("admin.products.pointsUnit")}`} valueColor="#2563EB" />
            <InfoField label={t("admin.products.marketPrice")} value={product.marketPrice != null ? `¥ ${product.marketPrice}` : "—"} />
            <InfoField label={t("admin.products.detail.currentStock")} value={`${product.stock} ${t("admin.products.detail.unit")}`} valueColor={product.stock > 0 ? "#16A34A" : "#DC2626"} />
            <InfoField label={t("admin.products.detail.soldCount")} value={`${product.soldCount ?? 0} ${t("admin.products.detail.unit")}`} />
            <InfoField label={t("admin.products.detail.createdAt")} value={(product.createdAt ?? "").slice(0, 19).replace("T", " ") || "—"} />
            <InfoField label={t("admin.products.detail.updatedAt")} value={(product.updatedAt ?? "").slice(0, 19).replace("T", " ") || "—"} />
            {product.deliveryMethod && <InfoField label={t("admin.products.detail.deliveryMethod")} value={product.deliveryMethod} />}
            {product.serviceGuarantee && <InfoField label={t("admin.products.detail.serviceGuarantee")} value={product.serviceGuarantee} />}
            {product.promotion && <InfoField label={t("admin.products.detail.promotion")} value={product.promotion} valueColor="#2563EB" />}
            {product.colors && <InfoField label={t("admin.products.detail.colors")} value={product.colors} />}
          </Box>
        </Box>
      </Box>

      {/* Description */}
      {product.description && (
        <Box sx={{ bgcolor: "#fff", borderRadius: "12px", border: "1px solid #F1F5F9", p: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#1E293B" }}>{t("admin.products.description")}</Typography>
          <Box sx={{ height: "1px", bgcolor: "#F1F5F9" }} />
          <Typography sx={{ fontSize: 14, color: "#64748B", lineHeight: 1.7 }}>{product.description}</Typography>
        </Box>
      )}

      {/* Specs */}
      {product.specs && product.specs.length > 0 && (
        <Box sx={{ bgcolor: "#fff", borderRadius: "12px", border: "1px solid #F1F5F9", p: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#1E293B", mb: "8px" }}>{t("admin.products.specs")}</Typography>
          <Box sx={{ height: "1px", bgcolor: "#F1F5F9", mb: "8px" }} />
          {product.specs.flatMap((row) =>
            Object.entries(row).map(([k, v]) => (
              <Box key={k} sx={{ display: "flex", gap: "16px", py: "8px", borderBottom: "1px solid #F8FAFC" }}>
                <Typography sx={{ fontSize: 13, color: "#64748B", width: 120 }}>{k}</Typography>
                <Typography sx={{ fontSize: 13, color: "#1E293B" }}>{String(v)}</Typography>
              </Box>
            )),
          )}
        </Box>
      )}

      {/* Dialogs */}
      {dialog === "offShelf" && (
        <OffShelfDialog product={product} loading={actionLoading} onConfirm={confirmOffShelf} onClose={() => setDialog(null)} />
      )}
      {dialog === "stock" && (
        <StockDialog product={product} loading={actionLoading} onConfirm={handleAdjustStock} onClose={() => setDialog(null)} />
      )}
      {dialog === "upload" && (
        <UploadDialog loading={actionLoading} onSave={handleSaveImage} onClose={() => setDialog(null)} onError={(m) => snackbar.showError(m)} />
      )}

      <AppSnackbar state={snackbar.state} onClose={snackbar.close} />
    </Box>
  );
}

// ---- dlg-01 下架确认 ----
function OffShelfDialog({ product, loading, onConfirm, onClose }: { product: ProductDTO; loading?: boolean; onConfirm: () => void; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <Dialog open onClose={onClose} slotProps={{ paper: { sx: { borderRadius: "12px", width: 440 } } }}>
      <DialogTitle sx={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>{t("admin.products.detail.offShelfTitle")}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: "16px", pt: "8px !important" }}>
        <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <WarningAmberIcon sx={{ fontSize: 26, color: "#D97706" }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#1E293B" }}>{t("admin.products.detail.offShelfQuestion")}</Typography>
          <Typography sx={{ fontSize: 13, color: "#64748B", mt: "6px" }}>{t("admin.products.detail.offShelfHint")}</Typography>
        </Box>
        <Box sx={{ bgcolor: "#F8FAFC", borderRadius: "8px", p: "12px", display: "flex", gap: "10px", alignItems: "center" }}>
          <Box sx={{ width: 40, height: 40, borderRadius: "6px", bgcolor: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Inventory2Icon sx={{ fontSize: 22, color: "#2563EB" }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>{product.name}</Typography>
            <Typography sx={{ fontSize: 12, color: "#64748B" }}>{product.sku} · {t("admin.products.stock")} {product.stock}</Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: "16px 24px" }}>
        <Button onClick={onClose} disabled={loading} sx={{ textTransform: "none", color: "#64748B", border: "1px solid #E2E8F0", borderRadius: "8px", px: "20px" }}>
          {t("common.cancel")}
        </Button>
        <Button onClick={onConfirm} disabled={loading} variant="contained" sx={{ textTransform: "none", borderRadius: "8px", bgcolor: "#D97706", px: "20px", "&:hover": { bgcolor: "#B45309" } }}>
          {t("admin.products.detail.confirmOffShelf")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---- dlg-02 调整库存 ----
function StockDialog({ product, loading, onConfirm, onClose }: { product: ProductDTO; loading?: boolean; onConfirm: (data: StockAdjustRequest) => void; onClose: () => void }) {
  const { t } = useTranslation();
  const [type, setType] = useState<"in" | "out">("in");
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("");
  const amount = Number(qty) || 0;
  const after = type === "in" ? product.stock + amount : product.stock - amount;
  const invalid = amount <= 0 || after < 0;

  const fieldSx = { "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14, "& fieldset": { borderColor: "#E2E8F0" } } };

  return (
    <Dialog open onClose={onClose} slotProps={{ paper: { sx: { borderRadius: "12px", width: 440 } } }}>
      <DialogTitle sx={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>{t("admin.products.detail.adjustStock")}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: "16px", pt: "8px !important" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#F8FAFC", borderRadius: "8px", p: "14px 16px" }}>
          <Typography sx={{ fontSize: 13, color: "#64748B" }}>{t("admin.products.detail.currentStock")}</Typography>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#16A34A" }}>{product.stock} {t("admin.products.detail.unit")}</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B", mb: "4px" }}>{t("admin.products.detail.adjustType")}</Typography>
          <RadioGroup row value={type} onChange={(e) => setType(e.target.value as "in" | "out")}>
            <FormControlLabel value="in" control={<Radio size="small" />} label={<Typography sx={{ fontSize: 13 }}>{t("admin.products.detail.stockIn")}</Typography>} />
            <FormControlLabel value="out" control={<Radio size="small" />} label={<Typography sx={{ fontSize: 13 }}>{t("admin.products.detail.stockOut")}</Typography>} />
          </RadioGroup>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B" }}>{t("admin.products.detail.adjustQty")}</Typography>
          <TextField fullWidth size="small" type="number" value={qty} onChange={(e) => setQty(e.target.value)} sx={fieldSx} />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B" }}>{t("admin.products.detail.adjustReason")}</Typography>
          <TextField fullWidth size="small" multiline minRows={2} value={reason} onChange={(e) => setReason(e.target.value)} sx={fieldSx} />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#EFF6FF", borderRadius: "8px", p: "12px 16px" }}>
          <Typography sx={{ fontSize: 13, color: "#64748B" }}>{t("admin.products.detail.afterStock")}</Typography>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: after < 0 ? "#DC2626" : "#2563EB" }}>
            {product.stock} → {after} {t("admin.products.detail.unit")}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: "16px 24px" }}>
        <Button onClick={onClose} disabled={loading} sx={{ textTransform: "none", color: "#64748B", border: "1px solid #E2E8F0", borderRadius: "8px", px: "20px" }}>
          {t("common.cancel")}
        </Button>
        <Button onClick={() => onConfirm({ changeType: type === "in" ? "IN" : "OUT", quantity: amount, reason: reason.trim() || undefined })} disabled={loading || invalid} variant="contained" sx={{ textTransform: "none", borderRadius: "8px", px: "20px" }}>
          {t("admin.products.detail.confirmAdjust")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---- dlg-03 上传图片 ----
function UploadDialog({ loading, onSave, onClose, onError }: { loading?: boolean; onSave: (url: string) => void; onClose: () => void; onError: (m: string) => void }) {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!/\.(jpe?g|png|gif|webp)$/i.test(file.name)) {
      onError(t("admin.products.detail.uploadTypeError"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onError(t("admin.products.detail.uploadSizeError"));
      return;
    }
    setUploading(true);
    try {
      const res = await uploadFile(file, "product");
      setUrl(res.url);
    } catch (err) {
      onError(err instanceof BusinessError ? err.message : t("admin.products.detail.uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open onClose={onClose} slotProps={{ paper: { sx: { borderRadius: "12px", width: 480 } } }}>
      <DialogTitle sx={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>{t("admin.products.detail.uploadTitle")}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: "16px", pt: "8px !important" }}>
        <Box
          component="label"
          sx={{
            border: "2px dashed #BFDBFE",
            borderRadius: "8px",
            bgcolor: "#F8FAFF",
            p: "28px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 32, color: "#2563EB" }} />
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#1E293B" }}>{t("admin.products.detail.uploadHint")}</Typography>
          <Typography sx={{ fontSize: 12, color: "#94A3B8" }}>{t("admin.products.detail.uploadFormats")}</Typography>
          <input type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
        </Box>

        {(uploading || url) && (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            {uploading ? (
              <CircularProgress size={28} />
            ) : (
              <Box sx={{ width: 120, height: 120, borderRadius: "8px", overflow: "hidden", border: "2px solid #2563EB" }}>
                <Box component="img" src={resolveImageUrl(url)} alt="preview" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: "16px 24px" }}>
        <Button onClick={onClose} disabled={loading} sx={{ textTransform: "none", color: "#64748B", border: "1px solid #E2E8F0", borderRadius: "8px", px: "20px" }}>
          {t("common.cancel")}
        </Button>
        <Button onClick={() => onSave(url)} disabled={loading || uploading || !url} variant="contained" sx={{ textTransform: "none", borderRadius: "8px", px: "20px" }}>
          {t("admin.products.detail.saveImage")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
