import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "~/api/auth/auth-store";
import { ProgressSpinner } from "primereact/progressspinner";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state.isBootstrapping && !state.isAuthenticated) {
      navigate("/login");
    }
  }, [navigate, state.isAuthenticated, state.isBootstrapping]);

  if (state.isBootstrapping) {
    return (
      <main className="page">
        <ProgressSpinner />
      </main>
    );
  }

  if (!state.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

