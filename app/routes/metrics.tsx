import type { Route } from "./+types/metrics";
import { MetricsPage } from "~/ui/pages/metrics/metrics-page";
import { ProtectedRoute } from "~/ui/protected-route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Метрики" },
    { name: "description", content: "Метрики задач" },
  ];
}

export default function MetricsRoute() {
  return (
    <ProtectedRoute>
      <main className="page">
        <MetricsPage />
      </main>
    </ProtectedRoute>
  );
}

