import { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "React + PrimeReact старт" },
    { name: "description", content: "Минимальный пример для ручной доработки." },
  ];
}

export default function Home() {
  const [text, setText] = useState("");

  return (
    <main className="page">
      <section className="page__header">
        <p className="eyebrow">PrimeReact</p>
        <h1 className="page__title">Чистый старт для практики</h1>
        <p className="page__subtitle">Тема подключена. Добавляй своё.</p>
      </section>
    </main>
  );
}
