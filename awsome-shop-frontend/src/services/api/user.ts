import request from "../request";
import type {
  PageResult,
  UserDTO,
  ListUserRequest,
  CreateUserRequest,
  UserStatsDTO,
} from "../../types/api";

const ADMIN_USER_BASE = "/auth/api/admin/users";

export function listUsers(data: ListUserRequest): Promise<PageResult<UserDTO>> {
  return request.get<PageResult<UserDTO>>(ADMIN_USER_BASE, { params: data });
}

/** A3: user statistics for the management dashboard cards. */
export function getUserStats(): Promise<UserStatsDTO> {
  return request.get<UserStatsDTO>(`${ADMIN_USER_BASE}/stats`);
}

/** D2: server-side CSV export of users (returns a Blob). */
export function exportUsers(): Promise<Blob> {
  return request.get<Blob>(`${ADMIN_USER_BASE}/export`, {
    responseType: "blob",
  });
}

export function createUser(data: CreateUserRequest): Promise<UserDTO> {
  return request.post<UserDTO>(ADMIN_USER_BASE, data);
}

export function getUser(id: number): Promise<UserDTO> {
  return request.get<UserDTO>(`${ADMIN_USER_BASE}/${id}`);
}

export function updateUser(
  id: number,
  data: Partial<CreateUserRequest>,
): Promise<UserDTO> {
  return request.put<UserDTO>(`${ADMIN_USER_BASE}/${id}`, data);
}

export function updateUserStatus(
  userId: number,
  status: string,
): Promise<UserDTO> {
  return request.patch<UserDTO>(`${ADMIN_USER_BASE}/${userId}/status`, {
    status,
  });
}
