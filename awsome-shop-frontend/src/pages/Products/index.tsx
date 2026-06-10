import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import InputBase from "@mui/material/InputBase";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import { listProducts, deleteProduct } from "../../services/api/product";
import type { ProductDTO } from "../../types/api";
import AdminPageHeader from "../../components/AdminPageHeader";
import ConfirmDialog from "../../components/ConfirmDialog";
import { AppSnackbar, useSnackbar } from "../../components/AppSnackbar";
import { BusinessError } from "../../services/request";

const PAGE_SIZE = 8;

// Category icon/color mapping for card image area
const CATEGORY_STYLES: Record<
  string,
  { icon: string; bg: string; color: string }
> = {
  数码电子: { icon: "headphones", bg: "#DBEAFE", color: "#2563EB" },
  智能穿戴: { icon: "watch", bg: "#EDE9FE", color: "#7C3AED" },
  礼品卡: { icon: "redeem", bg: "#DCFCE7", color: "#16A34A" },
  生活百货: { icon: "backpack", bg: "#FEF3C7", color: "#D97706" },
  办公用品: { icon: "edit_note", bg: "#FCE7F3", color: "#DB2777" },
  default: { icon: "inventory_2", bg: "#F1F5F9", color: "#64748B" },
};

function getCategoryStyle(category: string) {
  return CATEGORY_STYLES[category] || CATEGORY_STYLES.default;
}

export default function ProductList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ProductDTO | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listProducts({
        page,
        size: PAGE_SIZE,
        name: search || undefined,
        category: category || undefined,
      });
      setProducts(res.records);
      setTotal(res.total);
      setTotalPages(res.pages);
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = () => {
    setPage(1);
    fetchProducts();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await deleteProduct(deleteTarget.id);
      snackbar.showSuccess(t("admin.products.deleteSuccess"));
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      snackbar.showError(
        err instanceof BusinessError
          ? err.message
          : t("admin.products.deleteFailed"),
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
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

  return (
    <Box
      sx={{ p: "32px", display: "flex", flexDirection: "column", gap: "20px" }}
    >
      <AdminPageHeader
        title={t("admin.products.title")}
        actions={
          <ButtonBase
            onClick={() => navigate("/admin/products/create")}
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
              {t("admin.products.addProduct")}
            </Typography>
          </ButtonBase>
        }
      />

      {/* Toolbar: search + filter + count */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Search */}
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
            placeholder={t("admin.products.searchPlaceholder")}
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

        {/* Category filter */}
        <Select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
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
          <MenuItem value="">{t("admin.products.allCategories")}</MenuItem>
          <MenuItem value="数码电子">数码电子</MenuItem>
          <MenuItem value="智能穿戴">智能穿戴</MenuItem>
          <MenuItem value="礼品卡">礼品卡</MenuItem>
          <MenuItem value="生活百货">生活百货</MenuItem>
          <MenuItem value="办公用品">办公用品</MenuItem>
        </Select>

        {/* Count */}
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: 13,
              color: "#64748B",
              fontFamily: "Inter, sans-serif",
            }}
          >
            共 {total} 件产品
          </Typography>
        </Box>
      </Box>

      {/* Product card grid — scrollable area */}
      <Box>
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
              {t("admin.products.noProducts")}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Rows of 4 cards */}
            {Array.from(
              { length: Math.ceil(products.length / 4) },
              (_, rowIdx) => (
                <Box key={rowIdx} sx={{ display: "flex", gap: "20px" }}>
                  {products.slice(rowIdx * 4, rowIdx * 4 + 4).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={() =>
                        navigate(`/admin/products/${product.id}/edit`)
                      }
                      onDelete={() => setDeleteTarget(product)}
                    />
                  ))}
                  {/* Fill remaining space if less than 4 cards in a row */}
                  {rowIdx * 4 + 4 > products.length &&
                    Array.from(
                      { length: 4 - (products.length - rowIdx * 4) },
                      (_, i) => <Box key={`empty-${i}`} sx={{ flex: 1 }} />,
                    )}
                </Box>
              ),
            )}
          </Box>
        )}
      </Box>

      {/* Pagination — fixed at bottom */}
      {totalPages > 0 && (
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
            {t("admin.products.showRange", { start, end, total })}
          </Typography>
          <Box sx={{ display: "flex", gap: "4px", alignItems: "center" }}>
            {/* Prev */}
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
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {p}
                  </Typography>
                </ButtonBase>
              ),
            )}

            {/* Next */}
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

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={t("admin.products.deleteConfirmTitle")}
        message={t("admin.products.deleteConfirmMessage", {
          name: deleteTarget?.name ?? "",
        })}
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <AppSnackbar state={snackbar.state} onClose={snackbar.close} />
    </Box>
  );
}

/** Product card component matching Pencil design exactly */
function ProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: ProductDTO;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const style = getCategoryStyle(product.category);
  const isOnSale = product.status === 1;
  const [imgFailed, setImgFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        borderRadius: "12px",
        border: "1px solid #F1F5F9",
        bgcolor: "#fff",
        overflow: "hidden",
      }}
    >
      {/* Image area */}
      <Box
        sx={{
          height: 140,
          bgcolor: style.bg,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {product.imageUrl && !imgFailed ? (
          <Box
            component="img"
            ref={imgRef}
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImgFailed(true)}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Inventory2Icon sx={{ fontSize: 48, color: style.color }} />
        )}
      </Box>

      {/* Body */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          p: "16px 16px 12px 16px",
          flex: 1,
        }}
      >
        {/* Name */}
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 600,
            color: "#1E293B",
            fontFamily: "Inter, sans-serif",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {product.name}
        </Typography>

        {/* Tags */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {product.category && (
            <Box
              sx={{
                borderRadius: "10px",
                bgcolor: "#EFF6FF",
                px: "8px",
                py: "2px",
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#2563EB",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {product.category}
              </Typography>
            </Box>
          )}
          <Box
            sx={{
              borderRadius: "10px",
              bgcolor: isOnSale ? "#DCFCE7" : "#FEE2E2",
              px: "8px",
              py: "2px",
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 500,
                color: isOnSale ? "#166534" : "#991B1B",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {isOnSale
                ? t("admin.products.statusOnSale")
                : t("admin.products.statusOffSale")}
            </Typography>
          </Box>
        </Box>

        {/* Price + Stock */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 700,
              color: "#D97706",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {product.pointsPrice.toLocaleString()}{" "}
            {t("admin.products.pointsUnit")}
          </Typography>
          <Typography
            sx={{
              fontSize: 12,
              color: "#64748B",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {t("admin.products.stock")} {product.stock}
          </Typography>
        </Box>
      </Box>

      {/* Actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "4px",
          p: "0 12px 12px 12px",
        }}
      >
        <ButtonBase
          onClick={onEdit}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            borderRadius: "4px",
            px: "10px",
            py: "6px",
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
        >
          <EditIcon sx={{ fontSize: 16, color: "#64748B" }} />
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 500,
              color: "#64748B",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {t("admin.products.edit")}
          </Typography>
        </ButtonBase>
        <ButtonBase
          onClick={onDelete}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            borderRadius: "4px",
            px: "10px",
            py: "6px",
            "&:hover": { bgcolor: "#FEF2F2" },
          }}
        >
          <DeleteIcon sx={{ fontSize: 16, color: "#DC2626" }} />
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 500,
              color: "#DC2626",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {t("admin.products.delete")}
          </Typography>
        </ButtonBase>
      </Box>
    </Box>
  );
}
