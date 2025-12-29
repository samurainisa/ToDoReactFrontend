import { api } from "~/api/axios";

export type TaskMetrics = Record<string, unknown>;

export async function getTaskMetrics(): Promise<TaskMetrics> {
  const response = await api.get<TaskMetrics>("/metrics/tasks");
  return response.data;
}

