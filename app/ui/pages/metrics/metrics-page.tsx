import { useQuery } from "@tanstack/react-query";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { getTaskMetrics } from "~/api/metrics/metrics-api";
import { normalizeApiError } from "~/api/pagination";
import { TaskMetricsDashboard } from "~/ui/pages/metrics/task-metrics-dashboard";

export function MetricsPage() {
  const metricsQuery = useQuery({
    queryKey: ["metrics", "tasks"],
    queryFn: getTaskMetrics,
  });

  return (
    <div style={{ width: "100%", maxWidth: 1400, display: "grid", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Метрики</h1>
        <Button
          type="button"
          icon="pi pi-refresh"
          label="Обновить"
          outlined
          onClick={() => void metricsQuery.refetch()}
          loading={metricsQuery.isFetching}
          disabled={metricsQuery.isFetching}
        />
      </div>

      {metricsQuery.isError && (
        <Message severity="error" text={normalizeApiError(metricsQuery.error)} />
      )}

      {metricsQuery.isLoading ? (
        <Card>
          <div style={{ padding: 8 }}>Загрузка...</div>
        </Card>
      ) : metricsQuery.data ? (
        <TaskMetricsDashboard metrics={metricsQuery.data} />
      ) : (
        <Card>
          <div style={{ padding: 8, color: "#6b7280" }}>Нет данных</div>
        </Card>
      )}
    </div>
  );
}

