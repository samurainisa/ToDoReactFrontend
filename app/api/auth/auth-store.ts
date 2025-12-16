import { createContext, createElement, useContext, useReducer, useEffect } from "react";

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
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch({ type: "INIT_SESSION", payload: { accessToken: token } });
    }
  }, []);

  return createElement(
    AuthContext.Provider,
    { value: { state, dispatch } },
    children
  );
}

export function useAuthStore() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthStore must be used within AuthProvider");
  return ctx;
}