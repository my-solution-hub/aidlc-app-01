import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import InputBase from "@mui/material/InputBase";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import TollIcon from "@mui/icons-material/Toll";
import SearchIcon from "@mui/icons-material/Search";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { listProducts, getRecommended } from "../../services/api/product";
import { listCategories } from "../../services/api/category";
import { getBalance } from "../../services/api/point";
import type { ProductDTO } from "../../types/api";
import { useAuthStore } from "../../store/useAuthStore";
import { AppSnackbar, useSnackbar } from "../../components/AppSnackbar";
import LazyImage from "../../components/LazyImage";

const PAGE_SIZE = 8;

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

// Sort options mapped to the backend ListProductRequest contract.
const SORT_OPTIONS: {
  value: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}[] = [
  { value: "default" },
  { value: "newest", sortBy: "createdAt", sortOrder: "DESC" },
  { value: "soldDesc", sortBy: "soldCount", sortOrder: "DESC" },
  { value: "priceAsc", sortBy: "pointsPrice", sortOrder: "ASC" },
  { value: "priceDesc", sortBy: "pointsPrice", sortOrder: "DESC" },
];

/** Small local debounce hook (300ms) for the search box. */
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function ShopHome() {
  const { t } = useTranslation();
  const snackbar = useSnackbar();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const [activeCategory, setActiveCategory] = useState("");
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [recommended, setRecommended] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<{ key: string; label: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  // Search (synced with the header "?q=" param) + 300ms debounce.
  const [searchInput, setSearchInput] = useState(query);
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  // Sorting + pagination.
  const [sortValue, setSortValue] = useState("default");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const gridRef = useRef<HTMLDivElement>(null);

  // Keep the in-page search box in sync when the header search updates ?q=.
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  // Load top-level categories to drive the filter chips dynamically.
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

  // Load recommended (hot) products once.
  useEffect(() => {
    getRecommended()
      .then((list) => setRecommended(list ?? []))
      .catch(() => setRecommended([]));
  }, []);

  // Reset to first page whenever the filters/sort change. React bails out of
  // the update when page is already 1, avoiding a redundant fetch.
  useEffect(() => {
    setPage(1);
  }, [activeCategory, debouncedSearch, sortValue]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const opt = SORT_OPTIONS.find((o) => o.value === sortValue) ?? SORT_OPTIONS[0];
      const res = await listProducts({
        page,
        size: PAGE_SIZE,
        category: activeCategory || undefined,
        name: debouncedSearch || undefined,
        sortBy: opt.sortBy,
        sortOrder: opt.sortOrder,
      });
      setProducts(res.records);
      setTotal(res.total);
      setTotalPages(res.pages);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [activeCategory, debouncedSearch, sortValue, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Load points balance for the current employee.
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

  const handleSortChange = (e: SelectChangeEvent) => {
    setSortValue(e.target.value);
  };

  const displayPoints = useMemo(
    () => (balance != null ? balance : (user?.points ?? 0)),
    [balance, user],
  );

  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  // Page numbers with ellipsis (mirrors the admin pagination convention).
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      ) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  // Single product card, reused by both the recommended row and the grid.
  const renderProductCard = (product: ProductDTO, badge?: string) => {
    const style = getCategoryStyle(product.category);
    return (
      <Card
        onClick={() => navigate(`/products/${product.id}`)}
        sx={{
          borderRadius: "12px",
          border: "1px solid",
          borderColor: "#F1F5F9",
          boxShadow: "none",
          cursor: "pointer",
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          "&:hover": { boxShadow: 2 },
        }}
      >
        {/* Product Image Area */}
        <Box
          sx={{
            position: "relative",
            height: 200,
            bgcolor: style.bg,
          }}
        >
          {badge && (
            <Chip
              label={badge}
              size="small"
              sx={{
                position: "absolute",
                top: 10,
                left: 10,
                zIndex: 1,
                bgcolor: "#EF4444",
                color: "#fff",
                fontWeight: 600,
                fontSize: 11,
                height: 22,
                borderRadius: "6px",
                "& .MuiChip-label": { px: "8px" },
              }}
            />
          )}
          <LazyImage
            src={product.imageUrl}
            alt={product.name}
            fallback={<Inventory2Icon sx={{ fontSize: 64, color: style.color }} />}
          />
        </Box>

        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            p: "16px",
            flexGrow: 1,
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
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
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
              mt: "auto",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <TollIcon sx={{ fontSize: 18, color: "#D97706" }} />
              <Typography
                sx={{ fontSize: 18, fontWeight: 700, color: "#D97706" }}
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
  };

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

      {/* Recommended (hot) products */}
      {recommended.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <LocalFireDepartmentIcon sx={{ fontSize: 22, color: "#EF4444" }} />
              <Box>
                <Typography
                  sx={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}
                >
                  {t("shop.recommendedTitle")}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#94A3B8" }}>
                  {t("shop.recommendedSubtitle")}
                </Typography>
              </Box>
            </Box>
            <Button
              size="small"
              onClick={handleBrowse}
              endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
              sx={{
                textTransform: "none",
                fontSize: 13,
                fontWeight: 500,
                color: "#2563EB",
              }}
            >
              {t("shop.viewMore")}
            </Button>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: "16px",
              overflowX: "auto",
              pb: "8px",
            }}
          >
            {recommended.map((product) => (
              <Box
                key={product.id}
                sx={{ minWidth: 240, maxWidth: 240, flexShrink: 0 }}
              >
                {renderProductCard(product, t("shop.hotBadge"))}
              </Box>
            ))}
          </Box>
        </Box>
      )}

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

      {/* Toolbar: result count + search + sort */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <Typography sx={{ fontSize: 13, color: "#64748B" }}>
          {t("shop.resultCount", { total })}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Search box (300ms debounced) */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: 280,
              height: 40,
              border: "1px solid",
              borderColor: "#E2E8F0",
              borderRadius: "8px",
              bgcolor: "#fff",
              px: "12px",
              gap: "8px",
            }}
          >
            <SearchIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
            <InputBase
              placeholder={t("shop.searchPlaceholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              sx={{
                flex: 1,
                fontSize: 13,
                "& input::placeholder": { color: "#CBD5E1", opacity: 1 },
              }}
            />
          </Box>
          {/* Sort dropdown */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Typography sx={{ fontSize: 13, color: "#64748B" }}>
              {t("shop.sortLabel")}
            </Typography>
            <Select
              value={sortValue}
              onChange={handleSortChange}
              size="small"
              sx={{
                height: 40,
                minWidth: 140,
                borderRadius: "8px",
                fontSize: 13,
                color: "#1E293B",
                bgcolor: "#fff",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
                "& .MuiSelect-select": { py: "8px", px: "14px" },
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>
                  {t(`shop.sort.${opt.value}`)}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>
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
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "20px",
            }}
          >
            {products.map((product) => (
              <Box key={product.id}>{renderProductCard(product)}</Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: "8px",
          }}
        >
          <Typography sx={{ fontSize: 13, color: "#64748B" }}>
            {t("employee.orders.showRange", { total, start, end })}
          </Typography>
          <Box sx={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <ButtonBase
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              sx={{
                width: 32,
                height: 32,
                borderRadius: "4px",
                border: "1px solid #E2E8F0",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                opacity: page === 1 ? 0.4 : 1,
              }}
            >
              <ChevronLeftIcon sx={{ fontSize: 18, color: "#64748B" }} />
            </ButtonBase>

            {getPageNumbers().map((p, idx) =>
              p === "..." ? (
                <Typography
                  key={`dots-${idx}`}
                  sx={{ fontSize: 13, color: "#64748B", px: "4px" }}
                >
                  ...
                </Typography>
              ) : (
                <ButtonBase
                  key={p}
                  onClick={() => setPage(p as number)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "4px",
                    border: p === page ? "none" : "1px solid #E2E8F0",
                    bgcolor: p === page ? "#2563EB" : "transparent",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: p === page ? "#fff" : "#1E293B",
                    }}
                  >
                    {p}
                  </Typography>
                </ButtonBase>
              ),
            )}

            <ButtonBase
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              sx={{
                width: 32,
                height: 32,
                borderRadius: "4px",
                border: "1px solid #E2E8F0",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                opacity: page === totalPages ? 0.4 : 1,
              }}
            >
              <ChevronRightIcon sx={{ fontSize: 18, color: "#64748B" }} />
            </ButtonBase>
          </Box>
        </Box>
      )}

      <AppSnackbar state={snackbar.state} onClose={snackbar.close} />
    </Box>
  );
}
