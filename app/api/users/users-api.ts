import { api } from "~/api/axios";
import { normalizePaginatedResponse, toQueryString, type Paginated, type SortOrder } from "~/api/pagination";

export type User = {
  id: number;
  email: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UsersListParams = {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
};

export type CreateUserDto = {
  email: string;
  password: string;
};

export type UpdateUserDto = {
  email?: string;
  password?: string;
};

export async function getUsers(params: UsersListParams): Promise<Paginated<User>> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  const qs = toQueryString({
    search: params.search,
    page,
    limit,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  const response = await api.get(`/users${qs}`);
  return normalizePaginatedResponse<User>(response.data, page, limit);
}

export async function getUser(id: number): Promise<User> {
  const response = await api.get<User>(`/users/${id}`);
  return response.data;
}

export async function createUser(dto: CreateUserDto): Promise<User> {
  const response = await api.post<User>("/users", dto);
  return response.data;
}

export async function updateUser(id: number, dto: UpdateUserDto): Promise<User> {
  const response = await api.patch<User>(`/users/${id}`, dto);
  return response.data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/users/${id}`);
}

