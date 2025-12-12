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

      <div className="card">
        <span className="p-float-label input-block">
          <InputText
            id="sample"
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="input-block__input"
          />
          <label htmlFor="sample">Введите текст</label>
        </span>
        <Button
          label="Сохранить"
          icon="pi pi-save"
          onClick={() => alert(`Сохранили: ${text || "пусто"}`)}
          className="card__button"
        />
      </div>

      <div className="card card--icons">
        <div className="icons__row">
          <span className="material-icons icons__icon" aria-hidden>
            home
          </span>
          <span className="material-icons icons__icon" aria-hidden>
            search
          </span>
          <span className="material-icons icons__icon" aria-hidden>
            logout
          </span>
        </div>
        <p className="icons__hint">
          Пример: <code>className="material-icons"</code> + имя иконки.
        </p>
      </div>

      <div className="card">
        <h2 className="card__title">UI Kit</h2>
        <p className="card__subtitle">
          Перейти на страницу с примерами PrimeReact компонентов.
        </p>
        <Button
          label="Открыть UI Kit"
          icon="pi pi-external-link"
          className="card__button"
          onClick={() => (window.location.href = "/ui")}
        />
      </div>
    </main>
  );
}
