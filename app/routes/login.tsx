import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "~/api/auth/auth-store";
import { LoginForm } from "~/ui/forms/login-form";

export function meta() {
  return [
    { title: "Вход" },
    { name: "description", content: "Страница входа в систему" },
  ];
}

export default function Login() {
  const { state } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate("/task-list");
    }
  }, [state.isAuthenticated, navigate]);

  return (
    <main className="page">
      <div style={{ width: "100%", maxWidth: 450, display: "grid", gap: 26, border: "1px solid #e3e4ec", borderRadius: 8, padding: 50  }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, textAlign: "center" }}>Вход</h1>
        <LoginForm />
      </div>
    </main>
  );
}

