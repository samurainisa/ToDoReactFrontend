import type { Route } from "./+types/project-tasks";
import { useParams } from "react-router";
import { TasksPage } from "~/ui/pages/tasks/tasks-page";
import { ProtectedRoute } from "~/ui/protected-route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Задачи проекта" },
    { name: "description", content: "Задачи конкретного проекта" },
  ];
}

export default function ProjectTasksRoute() {
  const params = useParams();
  const projectId = Number(params.projectId);

  if (!Number.isFinite(projectId) || projectId <= 0) {
    return (
      <ProtectedRoute>
        <main className="page">
          <div style={{ width: "100%", maxWidth: 1200 }}>
            Некорректный projectId
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="page">
        <TasksPage forcedProjectId={projectId} />
      </main>
    </ProtectedRoute>
  );
}

