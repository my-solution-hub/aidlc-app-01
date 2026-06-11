import request from "../request";
import type {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserDTO,
} from "../../types/api";

export function login(data: LoginRequest): Promise<LoginResponse> {
  return request.post<LoginResponse>("/api/auth/login", data);
}

export function logout(): Promise<void> {
  return request.post<void>("/api/auth/logout");
}

export function register(data: RegisterRequest): Promise<UserDTO> {
  return request.post<UserDTO>("/api/auth/register", data);
}

export function getCurrentUser(): Promise<UserDTO> {
  return request.get<UserDTO>("/api/users/me");
}

/**
 * Exchange the current (possibly expired) token for a fresh one. The gateway
 * reads the operator from the Authorization header; only the returned token
 * field is guaranteed valid.
 */
export function refreshToken(): Promise<LoginResponse> {
  return request.post<LoginResponse>("/api/auth/refresh");
}

/**
 * Change the current user's password. The gateway injects the operator from
 * the JWT, so the client only needs to send the old/new password pair.
 */
export function changePassword(data: ChangePasswordRequest): Promise<void> {
  return request.put<void>("/api/auth/password", data);
}
