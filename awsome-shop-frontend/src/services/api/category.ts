import request from "../request";
import type {
  CategoryDTO,
  ListCategoryRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../../types/api";

const CATEGORY_BASE = "/product/api/v1/public/category";

export function listCategories(
  data: ListCategoryRequest,
): Promise<CategoryDTO[]> {
  return request.post<CategoryDTO[]>(`${CATEGORY_BASE}/list`, data);
}

export function createCategory(
  data: CreateCategoryRequest,
): Promise<CategoryDTO> {
  return request.post<CategoryDTO>(`${CATEGORY_BASE}/create`, data);
}

export function updateCategory(
  data: UpdateCategoryRequest,
): Promise<CategoryDTO> {
  return request.post<CategoryDTO>(`${CATEGORY_BASE}/update`, data);
}

export function deleteCategory(id: number): Promise<void> {
  return request.post<void>(`${CATEGORY_BASE}/delete`, { id });
}

export function updateCategoryStatus(
  id: number,
  status: number,
): Promise<CategoryDTO> {
  return request.post<CategoryDTO>(`${CATEGORY_BASE}/update-status`, {
    id,
    status,
  });
}
