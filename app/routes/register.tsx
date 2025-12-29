import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "~/api/auth/auth-store";
import { RegisterForm } from "~/ui/forms/register-form";

export function meta() {
  return [
    { title: "Регистрация" },
    { name: "description", content: "Страница регистрации" },
  ];
}

export default function Register() {
  const { state } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate("/task-list");
    }
  }, [state.isAuthenticated, navigate]);

  return (
    <main className="page">
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          display: "grid",
          gap: 20,
          border: "1px solid #e3e4ec",
          borderRadius: 8,
          padding: 50,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 600, textAlign: "center" }}>Регистрация</h1>
        <RegisterForm />
        <div style={{ textAlign: "center", fontSize: 14 }}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </div>
      </div>
    </main>
  );
}

