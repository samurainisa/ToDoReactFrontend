import { api } from "~/api/axios";
import {
  ensureIsoString,
  normalizePaginatedResponse,
  toQueryString,
  type Paginated,
  type SortOrder,
} from "~/api/pagination";

export type Task = {
  id: number;
  userId?: number;
  title: string;
  description?: string | null;
  isCompleted: boolean;
  priority?: number | null;
  projectId?: number | null;
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type TasksListParams = {
  search?: string;
  isCompleted?: boolean;
  priority?: number;
  projectId?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
};

export type CreateTaskDto = {
  title: string;
  description?: string;
  isCompleted?: boolean;
  priority?: number;
  projectId?: number;
  dueDate?: string | Date;
};

export type UpdateTaskDto = Partial<CreateTaskDto>;

export async function getTasks(params: TasksListParams): Promise<Paginated<Task>> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  const qs = toQueryString({
    search: params.search,
    isCompleted: params.isCompleted,
    priority: params.priority,
    projectId: params.projectId,
    page,
    limit,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  const response = await api.get(`/tasks${qs}`);
  return normalizePaginatedResponse<Task>(response.data, page, limit);
}

export async function getTask(id: number): Promise<Task> {
  const response = await api.get<Task>(`/tasks/${id}`);
  return response.data;
}

export async function createTask(dto: CreateTaskDto): Promise<Task> {
  const response = await api.post<Task>("/tasks", {
    ...dto,
    dueDate: ensureIsoString(dto.dueDate),
  });
  return response.data;
}

export async function updateTask(id: number, dto: UpdateTaskDto): Promise<Task> {
  const response = await api.patch<Task>(`/tasks/${id}`, {
    ...dto,
    dueDate: ensureIsoString(dto.dueDate),
  });
  return response.data;
}

export async function toggleTaskComplete(id: number): Promise<Task> {
  const response = await api.patch<Task>(`/tasks/${id}/toggle`);
  return response.data;
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

