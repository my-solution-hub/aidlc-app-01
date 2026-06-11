import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import {
  createProduct,
  getProduct,
  updateProduct,
} from "../../services/api/product";
import { uploadFile } from "../../services/api/file";
import { listCategories } from "../../services/api/category";
import { BusinessError } from "../../services/request";
import { resolveImageUrl } from "../../utils/image";

// Shared input style matching Pencil design
const inputSx = {
  "& .MuiOutlinedInput-root": {
    height: 40,
    borderRadius: "8px",
    fontFamily: "Inter, sans-serif",
    fontSize: 14,
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#CBD5E1" },
  },
};

const FALLBACK_CATEGORIES = ["数码电子", "生活家居", "美食餐饮", "礼品卡券", "办公用品"];

interface SpecRow {
  key: string;
  value: string;
}
export default function CreateProduct() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const productId = id ? Number(id) : null;

  // Form state
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [pointsPrice, setPointsPrice] = useState("");
  const [marketPrice, setMarketPrice] = useState("");
  const [stock, setStock] = useState("");
  const [status, setStatus] = useState(1);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [specs, setSpecs] = useState<SpecRow[]>([]);
  const [categories, setCategories] = useState<string[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load category options dynamically (fall back to defaults on failure).
  useEffect(() => {
    listCategories()
      .then((tree) => {
        const names = (tree ?? []).map((c) => c.name).filter(Boolean);
        if (names.length) setCategories(names);
      })
      .catch(() => {});
  }, []);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // In edit mode, load the existing product and populate the form
  useEffect(() => {
    if (!productId) return;
    getProduct(productId)
      .then((p) => {
        setName(p.name ?? "");
        setSku(p.sku ?? "");
        setCategory(p.category ?? "");
        setBrand(p.brand ?? "");
        setPointsPrice(p.pointsPrice != null ? String(p.pointsPrice) : "");
        setMarketPrice(p.marketPrice != null ? String(p.marketPrice) : "");
        setStock(p.stock != null ? String(p.stock) : "");
        setStatus(p.status ?? 1);
        setDescription(p.description ?? "");
        setImages(p.images && p.images.length > 0 ? p.images : p.imageUrl ? [p.imageUrl] : []);
        setSpecs(
          (p.specs ?? []).flatMap((row) =>
            Object.entries(row).map(([key, value]) => ({
              key,
              value: String(value),
            })),
          ),
        );
      })
      .catch((err) => {
        const msg =
          err instanceof BusinessError
            ? err.message
            : t("admin.products.loadFailed");
        setSnackbar({ open: true, message: msg, severity: "error" });
      });
  }, [productId, t]);

  const addSpec = () => {
    setSpecs([...specs, { key: "", value: "" }]);
  };

  const removeSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const updateSpec = (index: number, field: "key" | "value", val: string) => {
    const updated = [...specs];
    updated[index][field] = val;
    setSpecs(updated);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (images.length >= 10) {
      setSnackbar({ open: true, message: t("admin.products.imageMax"), severity: "error" });
      return;
    }
    setUploading(true);
    try {
      const res = await uploadFile(file, "product");
      setImages((prev) => [...prev, res.url]);
    } catch (err) {
      const msg =
        err instanceof BusinessError
          ? err.message
          : t("admin.products.uploadFailed");
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const specData = specs
        .filter((s) => s.key.trim())
        .map((s) => ({ [s.key.trim()]: s.value.trim() }));

      const payload = {
        name,
        sku,
        category,
        brand: brand || undefined,
        pointsPrice: Number(pointsPrice),
        marketPrice: marketPrice ? Number(marketPrice) : undefined,
        stock: stock !== "" ? Number(stock) : undefined,
        description: description || undefined,
        imageUrl: images[0] || undefined,
        images: images.length > 0 ? images : undefined,
        specs: specData.length > 0 ? specData : undefined,
        status: isEdit ? status : 1,
      };

      if (isEdit && productId) {
        await updateProduct({ ...payload, id: productId });
      } else {
        await createProduct(payload);
      }
      setSnackbar({
        open: true,
        message: isEdit
          ? t("admin.products.updateSuccess")
          : t("admin.products.createSuccess"),
        severity: "success",
      });
      setTimeout(() => navigate("/admin/products"), 1200);
    } catch (err) {
      const fallback = isEdit
        ? t("admin.products.updateFailed")
        : t("admin.products.createFailed");
      const msg = err instanceof BusinessError ? err.message : fallback;
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = name.trim() && sku.trim() && category && pointsPrice;

  return (
    <Box
      sx={{ p: "32px", display: "flex", flexDirection: "column", gap: "24px" }}
    >
      {/* Header: breadcrumb + title + buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Breadcrumb */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Typography
              component="span"
              onClick={() => navigate("/admin/products")}
              sx={{
                fontSize: 13,
                color: "#2563EB",
                fontFamily: "Inter, sans-serif",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {t("admin.products.title")}
            </Typography>
            <Typography
              sx={{
                fontSize: 13,
                color: "#CBD5E1",
                fontFamily: "Inter, sans-serif",
              }}
            >
              /
            </Typography>
            <Typography
              sx={{
                fontSize: 13,
                color: "#64748B",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {isEdit
                ? t("admin.products.editTitle")
                : t("admin.products.createTitle")}
            </Typography>
          </Box>
          {/* Title */}
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 700,
              color: "#1E293B",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {isEdit
              ? t("admin.products.editTitle")
              : t("admin.products.createTitle")}
          </Typography>
        </Box>

        {/* Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ButtonBase
            onClick={() => navigate("/admin/products")}
            sx={{
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
              px: "20px",
              py: "8px",
              "&:hover": { bgcolor: "#F8FAFC" },
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 500,
                color: "#1E293B",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {t("admin.products.cancel")}
            </Typography>
          </ButtonBase>
          <ButtonBase
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "8px",
              bgcolor: canSubmit && !loading ? "#2563EB" : "#93C5FD",
              px: "20px",
              py: "8px",
              "&:hover": {
                bgcolor: canSubmit && !loading ? "#1D4ED8" : "#93C5FD",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              <SaveIcon sx={{ fontSize: 18, color: "#fff" }} />
            )}
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {isEdit ? t("admin.products.save") : t("admin.products.create")}
            </Typography>
          </ButtonBase>
        </Box>
      </Box>

      {/* Basic Info Card */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          p: "24px",
          bgcolor: "#fff",
          borderRadius: "12px",
          border: "1px solid #F1F5F9",
        }}
      >
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 600,
            color: "#1E293B",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {t("admin.products.basicInfo")}
        </Typography>
        <Box sx={{ height: "1px", bgcolor: "#F1F5F9" }} />

        {/* Row 1: Name + SKU */}
        <Box sx={{ display: "flex", gap: "20px" }}>
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <Box sx={{ display: "flex", gap: "2px" }}>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#1E293B",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {t("admin.products.productName")}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#DC2626" }}>*</Typography>
            </Box>
            <TextField
              fullWidth
              size="small"
              placeholder={t("admin.products.productNamePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={inputSx}
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
            <Box sx={{ display: "flex", gap: "2px" }}>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#1E293B",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {t("admin.products.sku")}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#DC2626" }}>*</Typography>
            </Box>
            <TextField
              fullWidth
              size="small"
              placeholder={t("admin.products.skuPlaceholder")}
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              sx={inputSx}
            />
          </Box>
        </Box>

        {/* Row 2: Category + Brand */}
        <Box sx={{ display: "flex", gap: "20px" }}>
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <Box sx={{ display: "flex", gap: "2px" }}>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#1E293B",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {t("admin.products.category")}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#DC2626" }}>*</Typography>
            </Box>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              displayEmpty
              size="small"
              sx={{
                height: 40,
                borderRadius: "8px",
                fontFamily: "Inter, sans-serif",
                fontSize: 14,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#E2E8F0",
                },
              }}
            >
              <MenuItem value="" disabled>
                <Typography sx={{ color: "#CBD5E1", fontSize: 14 }}>
                  {t("admin.products.categoryPlaceholder")}
                </Typography>
              </MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
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
              sx={{
                fontSize: 13,
                fontWeight: 500,
                color: "#1E293B",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {t("admin.products.brand")}
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder={t("admin.products.brandPlaceholder")}
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              sx={inputSx}
            />
          </Box>
        </Box>

        {/* Row 3: Points Price + Market Price */}
        <Box sx={{ display: "flex", gap: "20px" }}>
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <Box sx={{ display: "flex", gap: "2px" }}>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#1E293B",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {t("admin.products.pointsPrice")}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#DC2626" }}>*</Typography>
            </Box>
            <TextField
              fullWidth
              size="small"
              type="number"
              placeholder={t("admin.products.pointsPricePlaceholder")}
              value={pointsPrice}
              onChange={(e) => setPointsPrice(e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography sx={{ fontSize: 13, color: "#64748B" }}>
                        {t("admin.products.pointsUnit")}
                      </Typography>
                    </InputAdornment>
                  ),
                },
              }}
              sx={inputSx}
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
              sx={{
                fontSize: 13,
                fontWeight: 500,
                color: "#1E293B",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {t("admin.products.marketPrice")}
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              placeholder={t("admin.products.marketPricePlaceholder")}
              value={marketPrice}
              onChange={(e) => setMarketPrice(e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography sx={{ fontSize: 13, color: "#64748B" }}>
                        ¥
                      </Typography>
                    </InputAdornment>
                  ),
                },
              }}
              sx={inputSx}
            />
          </Box>
        </Box>

        {/* Row 4: Stock */}
        <Box sx={{ display: "flex", gap: "20px" }}>
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1E293B", fontFamily: "Inter, sans-serif" }}>
              {t("admin.products.stock")}
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              placeholder={t("admin.products.stockPlaceholder")}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              sx={inputSx}
            />
          </Box>
          <Box sx={{ flex: 1 }} />
        </Box>
      </Box>

      {/* Image Card */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          p: "24px",
          bgcolor: "#fff",
          borderRadius: "12px",
          border: "1px solid #F1F5F9",
        }}
      >
        <Typography
          sx={{ fontSize: 16, fontWeight: 600, color: "#1E293B", fontFamily: "Inter, sans-serif" }}
        >
          {t("admin.products.image")}
        </Typography>
        <Box sx={{ height: "1px", bgcolor: "#F1F5F9" }} />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {/* Uploaded image thumbnails (first = main) */}
        <Box sx={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-start" }}>
          {images.map((url, idx) => (
            <Box
              key={`${url}-${idx}`}
              sx={{
                position: "relative",
                width: 100,
                height: 100,
                borderRadius: "8px",
                overflow: "hidden",
                border: idx === 0 ? "2px solid #2563EB" : "1px solid #E2E8F0",
              }}
            >
              <Box component="img" src={resolveImageUrl(url)} alt={`img-${idx}`} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {idx === 0 && (
                <Box sx={{ position: "absolute", top: 0, left: 0, bgcolor: "#2563EB", px: "6px", py: "1px", borderBottomRightRadius: "6px" }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#fff" }}>{t("admin.products.imageMain")}</Typography>
                </Box>
              )}
              <IconButton
                size="small"
                onClick={() => removeImage(idx)}
                sx={{ position: "absolute", top: 2, right: 2, width: 22, height: 22, bgcolor: "rgba(0,0,0,0.5)", "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }}
              >
                <CloseIcon sx={{ fontSize: 14, color: "#fff" }} />
              </IconButton>
            </Box>
          ))}

          {images.length < 10 && (
            <ButtonBase
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              sx={{
                width: 100,
                height: 100,
                borderRadius: "8px",
                border: "1px dashed #93C5FD",
                bgcolor: "#F8FAFF",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                "&:hover": { bgcolor: "#EFF6FF" },
              }}
            >
              {uploading ? (
                <CircularProgress size={20} sx={{ color: "#2563EB" }} />
              ) : (
                <PhotoCameraIcon sx={{ fontSize: 24, color: "#2563EB" }} />
              )}
              <Typography sx={{ fontSize: 11, color: "#2563EB", fontFamily: "Inter, sans-serif" }}>
                {t("admin.products.imageUpload")}
              </Typography>
            </ButtonBase>
          )}
        </Box>
        <Typography sx={{ fontSize: 12, color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>
          {t("admin.products.imageHint")}
        </Typography>
      </Box>

      {/* Description Card */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          p: "24px",
          bgcolor: "#fff",
          borderRadius: "12px",
          border: "1px solid #F1F5F9",
        }}
      >
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 600,
            color: "#1E293B",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {t("admin.products.description")}
        </Typography>
        <Box sx={{ height: "1px", bgcolor: "#F1F5F9" }} />

        {/* Description text area */}
        <TextField
          fullWidth
          multiline
          minRows={5}
          placeholder={t("admin.products.descriptionPlaceholder")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              "& fieldset": { borderColor: "#E2E8F0" },
              "&:hover fieldset": { borderColor: "#CBD5E1" },
            },
          }}
        />
      </Box>

      {/* Specs Card */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          p: "24px",
          bgcolor: "#fff",
          borderRadius: "12px",
          border: "1px solid #F1F5F9",
        }}
      >
        {/* Spec header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 600,
              color: "#1E293B",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {t("admin.products.specs")}
          </Typography>
          <ButtonBase
            onClick={addSpec}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              borderRadius: "4px",
              border: "1px solid #2563EB",
              px: "10px",
              py: "4px",
              "&:hover": { bgcolor: "#EFF6FF" },
            }}
          >
            <AddIcon sx={{ fontSize: 16, color: "#2563EB" }} />
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 500,
                color: "#2563EB",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {t("admin.products.addSpec")}
            </Typography>
          </ButtonBase>
        </Box>
        <Box sx={{ height: "1px", bgcolor: "#F1F5F9" }} />

        {/* Spec rows */}
        {specs.map((spec, index) => (
          <Box
            key={index}
            sx={{ display: "flex", alignItems: "center", gap: "12px" }}
          >
            <TextField
              size="small"
              placeholder={t("admin.products.specKey")}
              value={spec.key}
              onChange={(e) => updateSpec(index, "key", e.target.value)}
              sx={{
                width: 160,
                "& .MuiOutlinedInput-root": {
                  height: 36,
                  borderRadius: "4px",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  "& fieldset": { borderColor: "#E2E8F0" },
                },
              }}
            />
            <TextField
              size="small"
              placeholder={t("admin.products.specValue")}
              value={spec.value}
              onChange={(e) => updateSpec(index, "value", e.target.value)}
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  height: 36,
                  borderRadius: "4px",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  "& fieldset": { borderColor: "#E2E8F0" },
                },
              }}
            />
            <IconButton
              onClick={() => removeSpec(index)}
              size="small"
              sx={{ width: 28, height: 28, borderRadius: "14px" }}
            >
              <CloseIcon sx={{ fontSize: 16, color: "#CBD5E1" }} />
            </IconButton>
          </Box>
        ))}

        {specs.length === 0 && (
          <Typography
            sx={{
              fontSize: 13,
              color: "#CBD5E1",
              fontFamily: "Inter, sans-serif",
              textAlign: "center",
              py: 2,
            }}
          >
            {t("admin.products.addSpec")}
          </Typography>
        )}
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: "8px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
