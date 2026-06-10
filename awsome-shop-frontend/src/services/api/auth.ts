import request from "../request";
import type {
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
