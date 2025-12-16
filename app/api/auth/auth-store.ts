import { createContext, createElement, useContext, useReducer, useEffect } from "react";
import { login as loginApi, type LoginRequest } from "./auth-api";
import { tokenManager } from "./token-manager";

type AuthState = {
  user: { id: string; email: string } | null;
  accessToken: string | null;
  isAuthenticated: boolean;
};

type AuthAction =
  | { type: "SET_SESSION"; payload: { user: AuthState["user"]; accessToken: string } }
  | { type: "CLEAR_SESSION" }
  | { type: "INIT_SESSION"; payload: { accessToken: string } };

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_SESSION":
      return {
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
      };
    case "INIT_SESSION":
      return {
        ...state,
        accessToken: action.payload.accessToken,
        isAuthenticated: !!action.payload.accessToken,
      };
    case "CLEAR_SESSION":
      return initialState;
    default:
      return state;
  }
}


type AuthContextValue = {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Инициализация из токена при загрузке
  useEffect(() => {
    const token = tokenManager.getToken();
    if (token) {
      dispatch({ type: "INIT_SESSION", payload: { accessToken: token } });
    }
  }, []);

  // Слушаем событие выхода из системы (от axios при 401)
  useEffect(() => {
    const handleLogout = () => {
      dispatch({ type: "CLEAR_SESSION" });
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await loginApi(credentials);
    // Сохраняем токен через tokenManager
    tokenManager.setToken(response.accessToken);
    dispatch({
      type: "SET_SESSION",
      payload: {
        user: response.user,
        accessToken: response.accessToken,
      },
    });
  };

  const logout = () => {
    // Удаляем токен через tokenManager
    tokenManager.removeToken();
    dispatch({ type: "CLEAR_SESSION" });
  };

  return createElement(
    AuthContext.Provider,
    { value: { state, dispatch, login, logout } },
    children
  );
}

export function useAuthStore() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthStore must be used within AuthProvider");
  return ctx;
}