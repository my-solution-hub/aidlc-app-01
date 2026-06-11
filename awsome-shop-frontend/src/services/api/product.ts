import request from "../request";
import type {
  PageResult,
  ProductDTO,
  ListProductRequest,
  CreateProductRequest,
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
