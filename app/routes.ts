import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("task-list", "routes/task-list.tsx"),
  route("users", "routes/users.tsx"),
  route("projects", "routes/projects.tsx"),
  route("projects/:projectId/tasks", "routes/project-tasks.tsx"),
  route("metrics", "routes/metrics.tsx"),
  route("ui", "routes/ui.tsx"),
] satisfies RouteConfig;
