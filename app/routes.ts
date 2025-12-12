import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/task-list.tsx"),
  route("ui", "routes/ui.tsx"),
] satisfies RouteConfig;
