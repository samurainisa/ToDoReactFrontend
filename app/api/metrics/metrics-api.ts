import { api } from "~/api/axios";

export type TaskMetrics = {
  totalTasks: number;
  completedTasks: number;
  openTasks: number;
  completionRate: number;
  statusCounts: Record<string, number>;
  priorityCounts: Array<{ priority: number; count: number }>;
  averageLeadTimeHours: number | null;
};

export async function getTaskMetrics(): Promise<TaskMetrics> {
  const response = await api.get<TaskMetrics>("/metrics/tasks");
  return response.data;
}

