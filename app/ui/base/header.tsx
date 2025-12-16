import { Link, useNavigate } from "react-router";
import { useAuthStore } from "~/api/auth/auth-store";
import { tokenManager } from "~/api/auth/token-manager";
import { Button } from "primereact/button";

export function Header() {
  if (!tokenManager.hasToken()) {
    return null;
  }

  return <HeaderContent />;
}

function HeaderContent() {
  const { logout, state } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
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

