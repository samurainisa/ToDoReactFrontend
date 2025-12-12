import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import type { Route } from "./+types/task-list";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "React + PrimeReact старт" },
    { name: "description", content: "Минимальный пример для ручной доработки." },
  ];
}

import { useAuthStore, AuthProvider } from "~/api/auth/auth-store";

function LoginForm() {
  const { dispatch } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    dispatch({
      type: "SET_SESSION",
      payload: {
        user: { id: "1", email },
        accessToken: "token",
      }
    });

    setPassword("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
        <span>Email</span>
        <InputText
          className="ml-4 w-40"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
        />
        </div>
      </label>

      <label className="flex flex-col gap-1">
        <div>
        <span>Пароль</span>
        <InputText
          className="w-30"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        </div>
      </label>

      <Button type="submit" label="Войти" />
    </form>
  );
}

export default function TaskList() {
  return (
    <AuthProvider>
      <main className="page">
        <div style={{ width: "100%", maxWidth: 384, display: "grid", gap: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, textAlign: "center" }}>Вход</h1>
          <LoginForm />
        </div>
      </main>
    </AuthProvider>
  );
}
