import { api } from "../axios";

export interface AuthUser {
  id: number;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type LoginResponse = AuthResponse;

export interface RegisterRequest {
  email: string;
  password: string;
}

export type RegisterResponse = AuthResponse;

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", credentials);
  return response.data;
}

export async function register(credentials: RegisterRequest): Promise<RegisterResponse> {
  const response = await api.post<RegisterResponse>("/auth/register", credentials);
  return response.data;
}

export async function getMe(): Promise<AuthUser> {
  const response = await api.get<AuthUser>("/auth/me");
  return response.data;
}

