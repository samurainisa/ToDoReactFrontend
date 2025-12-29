import type { Route } from "./+types/users";
import { UsersPage } from "~/ui/pages/users/users-page";
import { ProtectedRoute } from "~/ui/protected-route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Пользователи" },
    { name: "description", content: "CRUD пользователей" },
  ];
}

export default function UsersRoute() {
  return (
    <ProtectedRoute>
      <main className="page">
        <UsersPage />
      </main>
    </ProtectedRoute>
  );
}

