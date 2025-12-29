import type { Route } from "./+types/projects";
import { ProjectsPage } from "~/ui/pages/projects/projects-page";
import { ProtectedRoute } from "~/ui/protected-route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Проекты" },
    { name: "description", content: "CRUD проектов" },
  ];
}

export default function ProjectsRoute() {
  return (
    <ProtectedRoute>
      <main className="page">
        <ProjectsPage />
      </main>
    </ProtectedRoute>
  );
}

