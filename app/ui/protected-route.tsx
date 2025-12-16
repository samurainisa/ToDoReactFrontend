import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "~/api/auth/auth-store";
import { tokenManager } from "~/api/auth/token-manager";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!tokenManager.hasToken()) {
      navigate("/login");
    }
  }, [navigate]);

  if (!tokenManager.hasToken()) {
    return null;
  }

  return <>{children}</>;
}

