import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import type { TaskMetrics } from "~/api/metrics/metrics-api";
import { BarChart } from "~/ui/charts/bar-chart";
import { DonutChart, type DonutSegment } from "~/ui/charts/donut-chart";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value);
}

function formatHours(value: number): string {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(value);
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function completionRatePercent(metrics: TaskMetrics): number {
  if (!metrics.totalTasks) return 0;
  return clampPercent((metrics.completedTasks / metrics.totalTasks) * 100);
}

function kpiCard(title: string, value: string, hint?: string) {
  return (
    <Card>
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ color: "#6b7280", fontSize: 12 }}>{title}</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#111827", lineHeight: 1.1 }}>{value}</div>
        {hint && <div style={{ color: "#6b7280", fontSize: 12 }}>{hint}</div>}
      </div>
    </Card>
  );
}

export function TaskMetricsDashboard({ metrics }: { metrics: TaskMetrics }) {
  const completionRate = completionRatePercent(metrics);

  const completed = metrics.statusCounts?.completed ?? metrics.completedTasks ?? 0;
  const open = metrics.statusCounts?.open ?? metrics.openTasks ?? 0;

  const statusSegments: DonutSegment[] = [
    { id: "open", label: "Открытые", value: open, color: "#3b82f6" },
    { id: "completed", label: "Завершённые", value: completed, color: "#22c55e" },
  ];

  const priorityMap = new Map<number, number>();
  for (const item of metrics.priorityCounts ?? []) {
    priorityMap.set(item.priority, item.count);
  }

  const priorityData = Array.from({ length: 10 }, (_, index) => {
    const priority = index + 1;
    const count = priorityMap.get(priority) ?? 0;
    let color = "var(--primary-color, #3b82f6)";
    if (priority >= 7) color = "#ef4444";
    else if (priority >= 4) color = "#f59e0b";
    return { id: String(priority), label: String(priority), value: count, color };
  });

  const leadTime = metrics.averageLeadTimeHours;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card title="Распределение по приоритетам">
        <BarChart data={priorityData} yLabel="Кол-во задач" height={420} />
        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Tag value="1–3 низкий" style={{ background: "rgba(59,130,246,0.12)", color: "#1d4ed8" }} />
          <Tag value="4–6 средний" style={{ background: "rgba(245,158,11,0.14)", color: "#92400e" }} />
          <Tag value="7–10 высокий" style={{ background: "rgba(239,68,68,0.14)", color: "#991b1b" }} />
        </div>
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 12,
          alignItems: "start",
        }}
      >
        <Card title="Статусы задач">
          <DonutChart
            segments={statusSegments}
            centerValue={`${Math.round(completionRate)}%`}
            centerLabel="выполнено"
            height={300}
          />
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 8,
              justifyContent: "center",
            }}
          >
            <Tag
              value={`Открытые: ${formatNumber(open)}`}
              style={{ background: "rgba(59,130,246,0.12)", color: "#1d4ed8" }}
            />
            <Tag
              value={`Завершённые: ${formatNumber(completed)}`}
              style={{ background: "rgba(34,197,94,0.12)", color: "#15803d" }}
            />
          </div>
        </Card>

        <Card title="Lead time">
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>
                {leadTime === null || leadTime === undefined ? "—" : `${formatHours(leadTime)} ч`}
              </span>
              <span style={{ color: "#6b7280" }}>Среднее время выполнения (в часах)</span>
            </div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>
              {leadTime === null || leadTime === undefined
                ? "Недостаточно данных для расчёта."
                : "Чем меньше значение — тем быстрее задачи закрываются."}
            </div>
          </div>
        </Card>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        {kpiCard("Всего задач", formatNumber(metrics.totalTasks ?? 0))}
        {kpiCard("Открытых", formatNumber(open))}
        {kpiCard("Завершено", formatNumber(completed))}
        {kpiCard("Completion rate", `${Math.round(completionRate)}%`)}
      </div>
    </div>
  );
}
