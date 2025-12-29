import { Link, useNavigate } from "react-router";
import { useAuthStore } from "~/api/auth/auth-store";
import { useSystemStore } from "~/api/system/system-store";
import { Button } from "primereact/button";
import { useQueryClient } from "@tanstack/react-query";

export function Header() {
  const isAuthenticated = useAuthStore((s) => s.state.isAuthenticated);

  if (!isAuthenticated) {
    return null;
  }

  return <HeaderContent />;
}

function HeaderContent() {
  const { logout, state } = useAuthStore();
  const resetLoading = useSystemStore((s) => s.resetLoading);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout();
    queryClient.clear();
    resetLoading();
    navigate("/login");
  };

  return (
    <header style={{ borderBottom: "1px solid #e3e4ec", padding: "16px 0", marginBottom: 24 }}>
      <nav>
        <ul style={{ 
          display: "flex", 
          listStyle: "none", 
          margin: 0, 
          padding: 0, 
          gap: 24,
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: 1200,
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: 16,
          paddingRight: 16
        }}>
          <li style={{ display: "flex", gap: 24 }}>
            <Link 
              to="/task-list" 
              style={{ 
                textDecoration: "none", 
                color: "#121212",
                fontWeight: 500
              }}
            >
              Список задач
            </Link>
            <Link 
              to="/projects" 
              style={{ 
                textDecoration: "none", 
                color: "#121212",
                fontWeight: 500
              }}
            >
              Проекты
            </Link>
            <Link 
              to="/users" 
              style={{ 
                textDecoration: "none", 
                color: "#121212",
                fontWeight: 500
              }}
            >
              Пользователи
            </Link>
            <Link 
              to="/metrics" 
              style={{ 
                textDecoration: "none", 
                color: "#121212",
                fontWeight: 500
              }}
            >
              Метрики
            </Link>
            <Link 
              to="/ui" 
              style={{ 
                textDecoration: "none", 
                color: "#121212",
                fontWeight: 500
              }}
            >
              UI Kit
            </Link>
          </li>
          <li style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {state.user && (
              <span style={{ color: "#666" }}>{state.user.email}</span>
            )}
            <Button 
              label="Выйти" 
              onClick={handleLogout}
              outlined
              size="small"
            />
          </li>
        </ul>
      </nav>
    </header>
  );
}

