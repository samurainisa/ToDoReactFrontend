import type { Route } from "./+types/ui";
import { UiKitPage } from "../ui/ui-kit";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "UI Kit | PrimeReact" },
    {
      name: "description",
      content: "Примеры базовых компонентов PrimeReact.",
    },
  ];
}

export default function UiRoute() {
  return <UiKitPage />;
}

