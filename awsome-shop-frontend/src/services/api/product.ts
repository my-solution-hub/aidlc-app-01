import request from "../request";
import type {
  PageResult,
  ProductDTO,
  ListProductRequest,
  CreateProductRequest,
  ProductStatsDTO,
  StockAdjustRequest,
  ReviewDTO,
  CreateReviewRequest,
} from "../../types/api";

const PRODUCT_BASE = "/product/api/products";
const ADMIN_PRODUCT_BASE = "/product/api/admin/products";

export function listProducts(
  data: ListProductRequest,
): Promise<PageResult<ProductDTO>> {
  return request.get<PageResult<ProductDTO>>(PRODUCT_BASE, { params: data });
}

export function getProduct(id: number): Promise<ProductDTO> {
  return request.get<ProductDTO>(`${PRODUCT_BASE}/${id}`);
}

export function createProduct(data: CreateProductRequest): Promise<ProductDTO> {
  return request.post<ProductDTO>(ADMIN_PRODUCT_BASE, data);
}

export function updateProduct(
  data: CreateProductRequest & { id: number },
): Promise<ProductDTO> {
  const { id, ...body } = data;
  return request.put<ProductDTO>(`${ADMIN_PRODUCT_BASE}/${id}`, body);
}

export function deleteProduct(id: number): Promise<void> {
  return request.delete<void>(`${ADMIN_PRODUCT_BASE}/${id}`);
}

export function updateProductStatus(
  id: number,
  status: number,
): Promise<ProductDTO> {
  return request.patch<ProductDTO>(`${ADMIN_PRODUCT_BASE}/${id}/status`, {
    status,
  });
}

/** D1: product statistics for the dashboard. */
export function getProductStats(): Promise<ProductStatsDTO> {
  return request.get<ProductStatsDTO>(`${ADMIN_PRODUCT_BASE}/stats`);
}

/** B6: stock adjustment with IN/OUT log (returns updated product). */
export function adjustStock(
  id: number,
  data: StockAdjustRequest,
): Promise<ProductDTO> {
  return request.post<ProductDTO>(`${ADMIN_PRODUCT_BASE}/${id}/stock`, undefined, {
    params: data,
  });
}

/** D3: related products in the same category (max 6, excludes current). */
export function getRelatedProducts(id: number): Promise<ProductDTO[]> {
  return request.get<ProductDTO[]>(`${PRODUCT_BASE}/${id}/related`);
}

/** C5: list reviews for a product. */
export function listReviews(id: number): Promise<ReviewDTO[]> {
  return request.get<ReviewDTO[]>(`${PRODUCT_BASE}/${id}/reviews`);
}

/** C5: submit a review for a product (requires login). */
export function createReview(
  id: number,
  data: CreateReviewRequest,
): Promise<ReviewDTO> {
  return request.post<ReviewDTO>(`${PRODUCT_BASE}/${id}/reviews`, data);
}
