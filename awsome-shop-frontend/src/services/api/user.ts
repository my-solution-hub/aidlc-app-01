import request from "../request";
import type {
  PageResult,
  UserDTO,
  ListUserRequest,
  CreateUserRequest,
} from "../../types/api";

const USER_BASE = "/auth/api/v1/public/auth/user";

export function listUsers(data: ListUserRequest): Promise<PageResult<UserDTO>> {
  return request.post<PageResult<UserDTO>>(`${USER_BASE}/list`, data);
}

export function createUser(data: CreateUserRequest): Promise<UserDTO> {
  return request.post<UserDTO>(`${USER_BASE}/create`, data);
}

export function updateUserStatus(
  userId: number,
  status: string,
): Promise<UserDTO> {
  return request.post<UserDTO>(`${USER_BASE}/update-status`, {
    userId,
    status,
  });
}
