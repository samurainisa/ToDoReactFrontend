import { api } from "~/api/axios";
import { normalizePaginatedResponse, toQueryString, type Paginated, type SortOrder } from "~/api/pagination";
import { type Task, type TasksListParams } from "~/api/tasks/tasks-api";

export type Project = {
  id: number;
  userId?: number;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ProjectsListParams = {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
};

export type CreateProjectDto = {
  name: string;
  description?: string;
};

export type UpdateProjectDto = {
  name?: string;
  description?: string | null;
};

export async function getProjects(params: ProjectsListParams): Promise<Paginated<Project>> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  const qs = toQueryString({
    search: params.search,
    page,
    limit,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  const response = await api.get(`/projects${qs}`);
  return normalizePaginatedResponse<Project>(response.data, page, limit);
}

export async function getProject(id: number): Promise<Project> {
  const response = await api.get<Project>(`/projects/${id}`);
  return response.data;
}

export async function createProject(dto: CreateProjectDto): Promise<Project> {
  const response = await api.post<Project>("/projects", dto);
  return response.data;
}

export async function updateProject(id: number, dto: UpdateProjectDto): Promise<Project> {
  const response = await api.patch<Project>(`/projects/${id}`, dto);
  return response.data;
}

export async function deleteProject(id: number): Promise<void> {
  await api.delete(`/projects/${id}`);
}

export async function getProjectTasks(
  projectId: number,
  params: Omit<TasksListParams, "projectId">
): Promise<Paginated<Task>> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  const qs = toQueryString({
    search: params.search,
    isCompleted: params.isCompleted,
    priority: params.priority,
    page,
    limit,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  const response = await api.get(`/projects/${projectId}/tasks${qs}`);
  return normalizePaginatedResponse<Task>(response.data, page, limit);
}

