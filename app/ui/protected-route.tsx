import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "~/api/auth/auth-store";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const token = localStorage.getItem("token");
  if (!token) {
    return null;
  }

  return <>{children}</>;
}

