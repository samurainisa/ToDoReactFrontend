import type { Route } from "./+types/task-list";
import { ProtectedRoute } from "~/ui/protected-route";
import { TasksPage } from "~/ui/pages/tasks/tasks-page";

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
        <TasksPage />
      </main>
    </ProtectedRoute>
  );
}
