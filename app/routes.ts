import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("login", "routes/login.tsx"),
  route("task-list", "routes/task-list.tsx"),
  route("ui", "routes/ui.tsx"),
] satisfies RouteConfig;
