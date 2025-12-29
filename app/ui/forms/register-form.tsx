import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useAuthStore } from "~/api/auth/auth-store";
import { useToast } from "~/ui/base/toast-provider";
import { useNavigate } from "react-router";

const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Пожалуйста, введите email")
      .email("Пожалуйста, введите корректный email"),
    password: z
      .string()
      .min(1, "Пожалуйста, введите пароль")
      .min(6, "Пароль должен содержать минимум 6 символов"),
    confirmPassword: z.string().min(1, "Пожалуйста, повторите пароль"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { register: registerUser } = useAuthStore();
  const toast = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({ email: data.email, password: data.password });

      toast.show({
        severity: "success",
        summary: "Успешно",
        detail: "Аккаунт создан, вы вошли в систему",
        life: 3000,
      });

      navigate("/task-list");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Ошибка при регистрации";
      toast.show({
        severity: "error",
        summary: "Ошибка",
        detail: errorMessage,
        life: 3000,
      });
    }
  };

  const onError = () => {
    const firstError = Object.values(errors)[0];
    if (firstError) {
      toast.show({
        severity: "error",
        summary: "Ошибка валидации",
        detail: firstError.message,
        life: 3000,
      });
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            <span style={{ minWidth: 120 }}>Email</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
              <InputText
                {...register("email")}
                type="email"
                className={errors.email ? "p-invalid" : ""}
              />
              {errors.email && (
                <small style={{ color: "red", fontSize: 12 }}>{errors.email.message}</small>
              )}
            </div>
          </div>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 40 }}>
            <span style={{ minWidth: 120 }}>Пароль</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
              <InputText
                {...register("password")}
                type="password"
                className={errors.password ? "p-invalid" : ""}
              />
              {errors.password && (
                <small style={{ color: "red", fontSize: 12 }}>{errors.password.message}</small>
              )}
            </div>
          </div>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 40 }}>
            <span style={{ minWidth: 120 }}>Повтор пароля</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
              <InputText
                {...register("confirmPassword")}
                type="password"
                className={errors.confirmPassword ? "p-invalid" : ""}
              />
              {errors.confirmPassword && (
                <small style={{ color: "red", fontSize: 12 }}>
                  {errors.confirmPassword.message}
                </small>
              )}
            </div>
          </div>
        </label>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button
            style={{ width: "100%" }}
            type="submit"
            label="Зарегистрироваться"
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </div>
      </form>
    </div>
  );
}
