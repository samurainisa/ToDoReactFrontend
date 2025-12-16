import type { Route } from "./+types/task-list";
import { ProtectedRoute } from "~/ui/protected-route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Список задач" },
    { name: "description", content: "Страница со списком задач" },
  ];
}

export default function TaskList() {
  return (
    <ProtectedRoute>
      <main className="page">
        <div style={{ width: "100%", maxWidth: 1200, display: "grid", gap: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, textAlign: "center" }}>Список задач</h1>
          <p>Здесь будет список задач</p>
        </div>
      </main>
    </ProtectedRoute>
  );
}
