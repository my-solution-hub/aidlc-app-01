import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Rating from "@mui/material/Rating";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import TollIcon from "@mui/icons-material/Toll";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import {
  getProduct,
  getRelatedProducts,
  listReviews,
  createReview,
} from "../../services/api/product";
import {
  listWishlist,
  addWishlist,
  removeWishlist,
} from "../../services/api/wishlist";
import type { ProductDTO, ReviewDTO } from "../../types/api";
import { useAuthStore } from "../../store/useAuthStore";
import { AppSnackbar, useSnackbar } from "../../components/AppSnackbar";
import { BusinessError } from "../../services/request";
import { resolveImageUrl } from "../../utils/image";

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
  const snackbar = useSnackbar();
  const { showError } = snackbar;
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);

  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [related, setRelated] = useState<ProductDTO[]>([]);
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [wished, setWished] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const [myRating, setMyRating] = useState<number | null>(5);
  const [myReview, setMyReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  const colorOptions = (product?.colors ?? "")
    .split(/[,，]/)
    .map((c) => c.trim())
    .filter(Boolean);

  useEffect(() => {
    if (colorOptions.length > 0 && !selectedColor) {
      setSelectedColor(colorOptions[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getProduct(Number(id));
      setProduct(res);
      setActiveImage(0);
    } catch {
      showError(t("employee.productDetail.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [id, showError, t]);

  // Side data (related / reviews / wishlist) — best-effort, never blocks the page.
  const fetchSideData = useCallback(async () => {
    if (!id) return;
    const pid = Number(id);
    getRelatedProducts(pid)
      .then(setRelated)
      .catch(() => {});
    listReviews(pid)
      .then(setReviews)
      .catch(() => {});
    if (user) {
      listWishlist(user.userId)
        .then((list) => setWished(list.some((p) => p.id === pid)))
        .catch(() => {});
    }
  }, [id, user]);

  useEffect(() => {
    fetchProduct();
    fetchSideData();
  }, [fetchProduct, fetchSideData]);

  const handleRedeem = () => {
    if (!product) return;
    navigate(`/orders/confirm/${product.id}`, {
      state: { quantity, color: selectedColor || colorOptions[0] },
    });
  };

  const handleToggleWish = async () => {
    if (!product || !user) return;
    setWishBusy(true);
    try {
      if (wished) {
        await removeWishlist(user.userId, product.id);
        setWished(false);
      } else {
        await addWishlist(user.userId, product.id);
        setWished(true);
      }
    } catch (err) {
      snackbar.showError(
        err instanceof BusinessError
          ? err.message
          : t("common.operationFailed"),
      );
    } finally {
      setWishBusy(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!product || !user || !myRating || !myReview.trim()) return;
    setSubmitting(true);
    try {
      await createReview(product.id, {
        productId: product.id,
        userId: user.userId,
        rating: myRating,
        content: myReview.trim(),
      });
      setMyReview("");
      setMyRating(5);
      snackbar.showSuccess(t("employee.productDetail.reviewSuccess"));
      listReviews(product.id)
        .then(setReviews)
        .catch(() => {});
    } catch (err) {
      snackbar.showError(
        err instanceof BusinessError
          ? err.message
          : t("employee.productDetail.reviewFailed"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const style = product
    ? getCategoryStyle(product.category)
    : { bg: "#F1F5F9", color: "#64748B" };
  const unavailable = !product || product.status !== 1 || product.stock <= 0;
  const gallery =
    product?.images && product.images.length > 0
      ? product.images
      : product?.imageUrl
        ? [product.imageUrl]
        : [];
  const mainImage = gallery[activeImage] ?? gallery[0];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        p: "24px 32px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
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
        <>
          <Box
            sx={{
              display: "flex",
              gap: "32px",
              bgcolor: "#fff",
              borderRadius: "12px",
              border: "1px solid #F1F5F9",
              p: "24px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* Image gallery */}
            <Box
              sx={{
                width: 360,
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <Box
                sx={{
                  width: 360,
                  height: 360,
                  borderRadius: "12px",
                  bgcolor: style.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {mainImage ? (
                  <Box
                    component="img"
                    src={resolveImageUrl(mainImage)}
                    alt={product.name}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <Inventory2Icon sx={{ fontSize: 96, color: style.color }} />
                )}
              </Box>
              {gallery.length > 1 && (
                <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {gallery.map((img, i) => (
                    <Box
                      key={i}
                      onClick={() => setActiveImage(i)}
                      component="img"
                      src={resolveImageUrl(img)}
                      alt={`${product.name}-${i}`}
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "8px",
                        objectFit: "cover",
                        cursor: "pointer",
                        border: `2px solid ${i === activeImage ? "#2563EB" : "transparent"}`,
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>

            {/* Info */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
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

              {product.subtitle && (
                <Typography sx={{ fontSize: 14, color: "#64748B", mt: "-8px" }}>
                  {product.subtitle}
                </Typography>
              )}

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
                {product.rating != null && product.rating > 0 && (
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <Rating
                      value={product.rating}
                      precision={0.1}
                      size="small"
                      readOnly
                    />
                    <Typography sx={{ fontSize: 12, color: "#64748B" }}>
                      {product.rating.toFixed(1)} (
                      {product.reviewCount ?? reviews.length})
                    </Typography>
                  </Box>
                )}
                <Typography sx={{ fontSize: 13, color: "#64748B" }}>
                  {t("employee.productDetail.stock")} {product.stock}
                </Typography>
              </Box>

              {/* Points price + market price */}
              <Box
                sx={{ display: "flex", alignItems: "flex-end", gap: "10px" }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <TollIcon sx={{ fontSize: 28, color: "#D97706" }} />
                  <Typography
                    sx={{ fontSize: 32, fontWeight: 700, color: "#D97706" }}
                  >
                    {product.pointsPrice.toLocaleString()}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 14, color: "#64748B", mb: "6px" }}
                  >
                    {t("employee.points")}
                  </Typography>
                </Box>
                {product.marketPrice != null && product.marketPrice > 0 && (
                  <Typography
                    sx={{ fontSize: 13, color: "#94A3B8", mb: "8px" }}
                  >
                    {t("employee.productDetail.marketPrice")} ¥
                    {product.marketPrice}
                  </Typography>
                )}
              </Box>

              {product.promotion && (
                <Box
                  sx={{
                    alignSelf: "flex-start",
                    bgcolor: "#FEF2F2",
                    borderRadius: "6px",
                    px: "10px",
                    py: "4px",
                  }}
                >
                  <Typography
                    sx={{ fontSize: 12, fontWeight: 600, color: "#DC2626" }}
                  >
                    {product.promotion}
                  </Typography>
                </Box>
              )}

              {/* 配送 */}
              {product.deliveryMethod && (
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <LocalShippingIcon sx={{ fontSize: 18, color: "#16A34A" }} />
                  <Typography sx={{ fontSize: 13, color: "#475569" }}>
                    {t("employee.productDetail.delivery")}：
                    {product.deliveryMethod}
                  </Typography>
                </Box>
              )}

              {/* 服务保障 */}
              {product.serviceGuarantee && (
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <VerifiedUserIcon sx={{ fontSize: 18, color: "#2563EB" }} />
                  <Typography sx={{ fontSize: 13, color: "#475569" }}>
                    {t("employee.productDetail.service")}：
                    {product.serviceGuarantee}
                  </Typography>
                </Box>
              )}

              {/* 颜色选择 */}
              {colorOptions.length > 0 && (
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <Typography
                    sx={{ fontSize: 13, color: "#64748B", width: 40 }}
                  >
                    {t("employee.productDetail.color")}
                  </Typography>
                  <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {colorOptions.map((c) => (
                      <Box
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        sx={{
                          px: "14px",
                          py: "6px",
                          borderRadius: "8px",
                          fontSize: 13,
                          cursor: "pointer",
                          border: `1px solid ${selectedColor === c ? "#2563EB" : "#E2E8F0"}`,
                          color: selectedColor === c ? "#2563EB" : "#475569",
                          bgcolor: selectedColor === c ? "#EFF6FF" : "#fff",
                        }}
                      >
                        {c}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* 数量选择 */}
              <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Typography sx={{ fontSize: 13, color: "#64748B", width: 40 }}>
                  {t("employee.productDetail.quantity")}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  <Button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    sx={{ minWidth: 36, color: "#64748B" }}
                  >
                    <RemoveIcon sx={{ fontSize: 16 }} />
                  </Button>
                  <Typography
                    sx={{
                      width: 44,
                      textAlign: "center",
                      fontSize: 14,
                      color: "#1E293B",
                    }}
                  >
                    {quantity}
                  </Typography>
                  <Button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    disabled={quantity >= product.stock}
                    sx={{ minWidth: 36, color: "#64748B" }}
                  >
                    <AddIcon sx={{ fontSize: 16 }} />
                  </Button>
                </Box>
                <Typography sx={{ fontSize: 13, color: "#16A34A" }}>
                  {t("employee.productDetail.inStock")}（
                  {t("employee.productDetail.stock")} {product.stock}）
                </Typography>
              </Box>

              {product.description && (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: "6px" }}
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

              {/* Spec params */}
              {product.specs && product.specs.length > 0 && (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: "4px" }}
                >
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1E293B",
                      mb: "4px",
                    }}
                  >
                    {t("employee.productDetail.specs")}
                  </Typography>
                  {product.specs.flatMap((row) =>
                    Object.entries(row).map(([k, v]) => (
                      <Box
                        key={k}
                        sx={{
                          display: "flex",
                          gap: "16px",
                          py: "6px",
                          borderBottom: "1px solid #F8FAFC",
                        }}
                      >
                        <Typography
                          sx={{ fontSize: 13, color: "#94A3B8", width: 120 }}
                        >
                          {k}
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: "#1E293B" }}>
                          {String(v)}
                        </Typography>
                      </Box>
                    )),
                  )}
                </Box>
              )}

              {/* Actions */}
              <Box sx={{ display: "flex", gap: "12px", mt: "auto" }}>
                <Button
                  variant="contained"
                  onClick={handleRedeem}
                  disabled={unavailable}
                  sx={{
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
                <Button
                  variant="outlined"
                  onClick={handleToggleWish}
                  disabled={wishBusy || !user}
                  startIcon={
                    wished ? (
                      <FavoriteIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <FavoriteBorderIcon sx={{ fontSize: 18 }} />
                    )
                  }
                  sx={{
                    borderRadius: "8px",
                    px: "20px",
                    py: "10px",
                    fontSize: 14,
                    fontWeight: 600,
                    textTransform: "none",
                    color: wished ? "#DC2626" : "#64748B",
                    borderColor: wished ? "#FECACA" : "#E2E8F0",
                  }}
                >
                  {wished
                    ? t("employee.productDetail.wishlistRemove")
                    : t("employee.productDetail.wishlistAdd")}
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Related products */}
          {related.length > 0 && (
            <Box
              sx={{
                bgcolor: "#fff",
                borderRadius: "12px",
                border: "1px solid #F1F5F9",
                p: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <Typography
                sx={{ fontSize: 16, fontWeight: 600, color: "#1E293B" }}
              >
                {t("employee.productDetail.related")}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: "12px",
                }}
              >
                {related.slice(0, 6).map((p) => {
                  const rs = getCategoryStyle(p.category);
                  return (
                    <Box
                      key={p.id}
                      onClick={() => navigate(`/products/${p.id}`)}
                      sx={{
                        cursor: "pointer",
                        borderRadius: "8px",
                        border: "1px solid #F1F5F9",
                        overflow: "hidden",
                        "&:hover": { boxShadow: 2 },
                      }}
                    >
                      <Box
                        sx={{
                          height: 100,
                          bgcolor: rs.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        {p.imageUrl ? (
                          <Box
                            component="img"
                            src={resolveImageUrl(p.imageUrl)}
                            alt={p.name}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <Inventory2Icon
                            sx={{ fontSize: 36, color: rs.color }}
                          />
                        )}
                      </Box>
                      <Box sx={{ p: "8px" }}>
                        <Typography
                          sx={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#1E293B",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#D97706",
                          }}
                        >
                          {p.pointsPrice.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Reviews */}
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: "12px",
              border: "1px solid #F1F5F9",
              p: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <Typography
              sx={{ fontSize: 16, fontWeight: 600, color: "#1E293B" }}
            >
              {t("employee.productDetail.reviews")} ({reviews.length})
            </Typography>

            {/* Submit review */}
            {user && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  bgcolor: "#F8FAFC",
                  borderRadius: "8px",
                  p: "16px",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Typography sx={{ fontSize: 13, color: "#64748B" }}>
                    {t("employee.productDetail.yourRating")}
                  </Typography>
                  <Rating
                    value={myRating}
                    onChange={(_, v) => setMyRating(v)}
                    size="small"
                  />
                </Box>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  placeholder={t("employee.productDetail.reviewPlaceholder")}
                  value={myReview}
                  onChange={(e) => setMyReview(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      fontSize: 14,
                      bgcolor: "#fff",
                      "& fieldset": { borderColor: "#E2E8F0" },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSubmitReview}
                  disabled={submitting || !myRating || !myReview.trim()}
                  sx={{
                    alignSelf: "flex-end",
                    textTransform: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                  }}
                >
                  {submitting ? (
                    <CircularProgress size={18} sx={{ color: "#fff" }} />
                  ) : (
                    t("employee.productDetail.submitReview")
                  )}
                </Button>
              </Box>
            )}

            {reviews.length === 0 ? (
              <Typography
                sx={{
                  fontSize: 13,
                  color: "#94A3B8",
                  textAlign: "center",
                  py: 2,
                }}
              >
                {t("employee.productDetail.noReviews")}
              </Typography>
            ) : (
              reviews.map((r) => (
                <Box
                  key={r.id}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    py: "12px",
                    borderTop: "1px solid #F1F5F9",
                  }}
                >
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    <Rating value={r.rating} size="small" readOnly />
                    <Typography sx={{ fontSize: 12, color: "#94A3B8" }}>
                      {(r.createdAt ?? "").slice(0, 10)}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 13, color: "#1E293B" }}>
                    {r.content}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </>
      )}

      <AppSnackbar state={snackbar.state} onClose={snackbar.close} />
    </Box>
  );
}
