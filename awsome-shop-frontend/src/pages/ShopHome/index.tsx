import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import TollIcon from "@mui/icons-material/Toll";
import Rating from "@mui/material/Rating";
import { listProducts } from "../../services/api/product";
import { listCategories } from "../../services/api/category";
import { getBalance } from "../../services/api/point";
import type { ProductDTO } from "../../types/api";
import { useAuthStore } from "../../store/useAuthStore";
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

const PAGE_SIZE = 20;

export default function ShopHome() {
  const { t } = useTranslation();
  const snackbar = useSnackbar();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const [activeCategory, setActiveCategory] = useState("");
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<{ key: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [balance, setBalance] = useState<number | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Load category list (top-level) to drive the filter chips dynamically.
  useEffect(() => {
    listCategories()
      .then((tree) => {
        const tops = (tree ?? [])
          .filter((c) => c.status !== 0)
          .map((c) => ({ key: c.name, label: c.name }));
        setCategories([{ key: "", label: t("employee.categoryAll") }, ...tops]);
      })
      .catch(() => {
        setCategories([{ key: "", label: t("employee.categoryAll") }]);
      });
  }, [t]);

  // Load first page; re-runs when category/search changes (infinite scroll, 20/page).
  const loadFirst = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listProducts({
        page: 1,
        size: PAGE_SIZE,
        category: activeCategory || undefined,
        name: query || undefined,
      });
      setProducts(res.records);
      setPage(res.current);
      setPages(res.pages);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [activeCategory, query]);

  useEffect(() => {
    loadFirst();
  }, [loadFirst]);

  // Load subsequent pages and append.
  const loadMore = useCallback(async () => {
    if (loading || loadingMore || page >= pages) return;
    const next = page + 1;
    setLoadingMore(true);
    try {
      const res = await listProducts({
        page: next,
        size: PAGE_SIZE,
        category: activeCategory || undefined,
        name: query || undefined,
      });
      setProducts((prev) => [...prev, ...res.records]);
      setPage(res.current);
      setPages(res.pages);
    } catch {
      // handled by interceptor
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, page, pages, activeCategory, query]);

  // Observe the sentinel near the bottom to trigger loading the next page.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  // Load points balance for the current employee
  const fetchBalance = useCallback(() => {
    if (!user) return;
    getBalance(user.userId)
      .then((b) => setBalance(b.balance))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const handleBrowse = () => {
    gridRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const displayPoints = useMemo(
    () => (balance != null ? balance : (user?.points ?? 0)),
    [balance, user],
  );

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 3, p: "24px 32px" }}
    >
      {/* Hero Banner */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 160,
          borderRadius: "12px",
          px: "40px",
          background: "linear-gradient(90deg, #2563EB 0%, #60A5FA 100%)",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>
            {t("employee.heroTitle")}
          </Typography>
          <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
            {t("employee.heroSubtitle")}
          </Typography>
          <Button
            size="small"
            onClick={handleBrowse}
            endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: "#fff",
              color: "#2563EB",
              borderRadius: "20px",
              px: "20px",
              py: "8px",
              fontSize: 13,
              fontWeight: 600,
              textTransform: "none",
              alignSelf: "flex-start",
              "&:hover": { bgcolor: "#f0f0f0" },
            }}
          >
            {t("employee.heroBrowse")}
          </Button>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            icon={<TollIcon sx={{ fontSize: 18, color: "#fff !important" }} />}
            label={`${displayPoints.toLocaleString()} ${t("employee.points")}`}
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 20,
            }}
          />
          <ShoppingBagIcon
            sx={{ fontSize: 100, color: "rgba(255,255,255,0.2)" }}
          />
        </Box>
      </Box>

      {/* Category Filter */}
      <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {categories.map((cat) => (
          <Chip
            key={cat.key || "all"}
            label={cat.label}
            onClick={() => setActiveCategory(cat.key)}
            sx={{
              borderRadius: "20px",
              fontSize: 13,
              fontWeight: activeCategory === cat.key ? 600 : 400,
              color: activeCategory === cat.key ? "#fff" : "#64748B",
              bgcolor: activeCategory === cat.key ? "#2563EB" : "#fff",
              border: activeCategory === cat.key ? "none" : "1px solid #E2E8F0",
              height: "auto",
              py: "8px",
              px: "18px",
              "& .MuiChip-label": { p: 0 },
              "&:hover": {
                bgcolor: activeCategory === cat.key ? "#2563EB" : "#F8FAFC",
              },
            }}
          />
        ))}
      </Box>

      {/* Product Grid */}
      <Box ref={gridRef}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : products.length === 0 ? (
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
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "20px",
            }}
          >
            {products.map((product) => {
              const style = getCategoryStyle(product.category);
              return (
                <Card
                  key={product.id}
                  onClick={() => navigate(`/products/${product.id}`)}
                  sx={{
                    borderRadius: "12px",
                    border: "1px solid",
                    borderColor: "#F1F5F9",
                    boxShadow: "none",
                    cursor: "pointer",
                    overflow: "hidden",
                    "&:hover": { boxShadow: 2 },
                  }}
                >
                  {/* Product Image Area */}
                  <Box
                    sx={{
                      position: "relative",
                      height: 200,
                      bgcolor: style.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {product.imageUrl ? (
                      <Box
                        component="img"
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Inventory2Icon
                        sx={{ fontSize: 64, color: style.color }}
                      />
                    )}
                  </Box>

                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      p: "16px",
                      "&:last-child": { pb: "16px" },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "text.primary",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      {product.category}
                    </Typography>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      {product.rating != null && product.rating > 0 && (
                        <>
                          <Rating value={product.rating} precision={0.1} size="small" readOnly sx={{ fontSize: 14 }} />
                          <Typography sx={{ fontSize: 11, color: "#94A3B8" }}>
                            {product.rating.toFixed(1)}
                          </Typography>
                        </>
                      )}
                      <Typography sx={{ fontSize: 11, color: "#CBD5E1" }}>
                        {t("employee.sold")} {product.soldCount ?? 0}{" "}
                        {t("employee.soldUnit")}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <TollIcon sx={{ fontSize: 18, color: "#D97706" }} />
                        <Typography
                          sx={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: "#D97706",
                          }}
                        >
                          {product.pointsPrice.toLocaleString()}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/orders/confirm/${product.id}`);
                        }}
                        disabled={product.status !== 1 || product.stock <= 0}
                        sx={{
                          borderRadius: "8px",
                          px: "14px",
                          py: "6px",
                          fontSize: 13,
                          fontWeight: 600,
                          textTransform: "none",
                          minWidth: "auto",
                        }}
                      >
                        {t("employee.redeem")}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
          <Box ref={sentinelRef} sx={{ height: "1px" }} />
          {loadingMore && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={28} />
            </Box>
          )}
          </>
        )}
      </Box>

      <AppSnackbar state={snackbar.state} onClose={snackbar.close} />
    </Box>
  );
}
