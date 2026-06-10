import request from "../request";
import type {
  CategoryDTO,
  ListCategoryRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../../types/api";

const CATEGORY_BASE = "/api/categories";
const ADMIN_CATEGORY_BASE = "/api/admin/categories";

export function listCategories(
  data?: ListCategoryRequest,
): Promise<CategoryDTO[]> {
  return request.get<CategoryDTO[]>(`${CATEGORY_BASE}/tree`, { params: data });
}

export function createCategory(
  data: CreateCategoryRequest,
): Promise<CategoryDTO> {
  return request.post<CategoryDTO>(ADMIN_CATEGORY_BASE, data);
}

export function updateCategory(
  data: UpdateCategoryRequest,
): Promise<CategoryDTO> {
  const { id, ...body } = data;
  return request.put<CategoryDTO>(`${ADMIN_CATEGORY_BASE}/${id}`, body);
}

export function deleteCategory(id: number): Promise<void> {
  return request.delete<void>(`${ADMIN_CATEGORY_BASE}/${id}`);
}

export function updateCategoryStatus(
  id: number,
  status: number,
): Promise<CategoryDTO> {
  return request.patch<CategoryDTO>(`${ADMIN_CATEGORY_BASE}/${id}/status`, {
    status,
  });
}
