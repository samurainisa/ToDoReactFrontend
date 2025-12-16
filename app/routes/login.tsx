import { useEffect } from "react";
import { useNavigate } from "react-router";
import { AuthProvider, useAuthStore } from "~/api/auth/auth-store";
import { LoginForm } from "~/ui/login-form";

export function meta() {
  return [
    { title: "Вход" },
    { name: "description", content: "Страница входа в систему" },
  ];
}

function LoginContent() {
  const { state } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && state.isAuthenticated) {
      navigate("/task-list");
    }
  }, [state.isAuthenticated, navigate]);

  return (
    <main className="page">
      <div style={{ width: "100%", maxWidth: 384, display: "grid", gap: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, textAlign: "center" }}>Вход</h1>
        <LoginForm />
      </div>
    </main>
  );
}

export default function Login() {
  return (
    <AuthProvider>
      <LoginContent />
    </AuthProvider>
  );
}

