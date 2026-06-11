import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import TollIcon from "@mui/icons-material/Toll";
import { getProduct } from "../../services/api/product";
import type { ProductDTO } from "../../types/api";
import { AppSnackbar, useSnackbar } from "../../components/AppSnackbar";

const CATEGORY_STYLES: Record<string, { bg: string; color: string }> = {
  数码电子: { bg: "#DBEAFE", color: "#2563EB" },
  智能穿戴: { bg: "#EDE9FE", color: "#7C3AED" },
  礼品卡: { bg: "#DCFCE7", color: "#16A34A" },
  生活百货: { bg: "#FEF3C7", color: "#D97706" },
  办公用品: { bg: "#FCE7F3", color: "#DB2777" },
};

function getCategoryStyle(category: string) {
  return CATEGORY_STYLES[category] || { bg: "#F1F5F9", color: "#64748B" };
}

export default function ProductDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state: snackbarState, showError, close: closeSnackbar } = useSnackbar();
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getProduct(Number(id));
      setProduct(res);
    } catch {
      showError(t("employee.productDetail.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [id, showError, t]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleRedeem = () => {
    if (!product) return;
    navigate(`/orders/confirm/${product.id}`);
  };

  const style = product
    ? getCategoryStyle(product.category)
    : { bg: "#F1F5F9", color: "#64748B" };
  const unavailable =
    !product || product.status !== 1 || product.stock <= 0;

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 3, p: "24px 32px" }}
    >
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
        onClick={() => navigate(-1)}
        sx={{
          alignSelf: "flex-start",
          textTransform: "none",
          color: "#64748B",
          fontSize: 14,
          fontWeight: 500,
          "&:hover": { bgcolor: "#F8FAFC" },
        }}
      >
        {t("employee.back")}
      </Button>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : !product ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 8,
            gap: 2,
          }}
        >
          <Inventory2Icon sx={{ fontSize: 48, color: "#CBD5E1" }} />
          <Typography sx={{ fontSize: 14, color: "#64748B" }}>
            {t("employee.noProducts")}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            gap: "32px",
            bgcolor: "#fff",
            borderRadius: "12px",
            border: "1px solid #F1F5F9",
            p: "24px",
          }}
        >
          {/* Image area */}
          <Box
            sx={{
              width: 360,
              height: 360,
              flexShrink: 0,
              borderRadius: "12px",
              bgcolor: style.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {product.imageUrl ? (
              <Box
                component="img"
                src={product.imageUrl}
                alt={product.name}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <Inventory2Icon sx={{ fontSize: 96, color: style.color }} />
            )}
          </Box>

          {/* Info area */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <Typography
              sx={{ fontSize: 24, fontWeight: 700, color: "#1E293B" }}
            >
              {product.name}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Chip
                label={product.category}
                size="small"
                sx={{
                  bgcolor: style.bg,
                  color: style.color,
                  fontWeight: 600,
                  fontSize: 12,
                  borderRadius: "8px",
                }}
              />
              <Typography sx={{ fontSize: 13, color: "#64748B" }}>
                {t("employee.productDetail.stock")} {product.stock}
              </Typography>
            </Box>

            {/* Points price */}
            <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <TollIcon sx={{ fontSize: 28, color: "#D97706" }} />
              <Typography
                sx={{ fontSize: 32, fontWeight: 700, color: "#D97706" }}
              >
                {product.pointsPrice.toLocaleString()}
              </Typography>
              <Typography
                sx={{ fontSize: 14, color: "#64748B", alignSelf: "flex-end", mb: "6px" }}
              >
                {t("employee.points")}
              </Typography>
            </Box>

            {product.description && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <Typography
                  sx={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}
                >
                  {t("employee.productDetail.description")}
                </Typography>
                <Typography
                  sx={{ fontSize: 13, color: "#64748B", lineHeight: 1.7 }}
                >
                  {product.description}
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              onClick={handleRedeem}
              disabled={unavailable}
              sx={{
                alignSelf: "flex-start",
                mt: "auto",
                borderRadius: "8px",
                px: "32px",
                py: "10px",
                fontSize: 15,
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              {product.status !== 1
                ? t("employee.productDetail.offShelf")
                : product.stock <= 0
                  ? t("employee.productDetail.soldOut")
                  : t("employee.redeemNow")}
            </Button>
          </Box>
        </Box>
      )}

      <AppSnackbar state={snackbarState} onClose={closeSnackbar} />
    </Box>
  );
}
