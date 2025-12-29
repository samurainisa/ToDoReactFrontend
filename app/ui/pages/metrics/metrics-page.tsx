import { useQuery } from "@tanstack/react-query";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { getTaskMetrics } from "~/api/metrics/metrics-api";
import { normalizeApiError } from "~/api/pagination";

export function MetricsPage() {
  const metricsQuery = useQuery({
    queryKey: ["metrics", "tasks"],
    queryFn: getTaskMetrics,
  });

  return (
    <div style={{ width: "100%", maxWidth: 1200, display: "grid", gap: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Метрики</h1>

      {metricsQuery.isError && (
        <Message severity="error" text={normalizeApiError(metricsQuery.error)} />
      )}

      <Card title="Task metrics">
        {metricsQuery.isLoading ? (
          <div>Загрузка...</div>
        ) : (
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            {JSON.stringify(metricsQuery.data ?? {}, null, 2)}
          </pre>
        )}
      </Card>
    </div>
  );
}

