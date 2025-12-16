import { useEffect } from "react";
import { useNavigate } from "react-router";
import { AuthProvider } from "~/api/auth/auth-store";

function IndexContent() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Даем время на инициализацию состояния из localStorage
      const timer = setTimeout(() => {
        navigate("/task-list");
      }, 100);
      return () => clearTimeout(timer);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return null;
}

export default function Index() {
  return (
    <AuthProvider>
      <IndexContent />
    </AuthProvider>
  );
}

