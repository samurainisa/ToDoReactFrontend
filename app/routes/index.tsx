import { useEffect } from "react";
import { useNavigate } from "react-router";
import { tokenManager } from "~/api/auth/token-manager";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    if (tokenManager.hasToken()) {
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

