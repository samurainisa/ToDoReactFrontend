import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useAuthStore } from "~/api/auth/auth-store";
import { login } from "~/api/auth/auth-api";
import { useToast } from "~/ui/toast-provider";
import { useNavigate } from "react-router";

export function LoginForm() {
  const { dispatch } = useAuthStore();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    console.log("Email:", email);
    console.log("Password:", password);

    setIsLoading(true);
    try {
      const response = await login({ email, password });
      
      localStorage.setItem("token", response.accessToken);
      dispatch({
        type: "SET_SESSION",
        payload: {
          user: response.user,
          accessToken: response.accessToken,
        },
      });
      
      toast.show({
        severity: "success",
        summary: "Успешно",
        detail: "Вы успешно вошли в систему",
        life: 3000,
      });

      navigate("/task-list");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Ошибка при входе";
      toast.show({
        severity: "error",
        summary: "Ошибка",
        detail: errorMessage,
        life: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <span>Email</span>
          <InputText
            style={{ marginLeft: 16, width: 160 }}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
          />
        </div>
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div>
          <span>Пароль</span>
          <InputText
            style={{ width: 120 }}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            required
          />
        </div>
      </label>

      <Button type="submit" label="Войти" loading={isLoading} disabled={isLoading} />
    </form>
  );
}

