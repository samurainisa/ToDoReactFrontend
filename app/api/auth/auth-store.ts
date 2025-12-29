import { create } from "zustand";
import {
  getMe,
  login as loginApi,
  register as registerApi,
  type AuthUser,
  type LoginRequest,
  type RegisterRequest,
} from "./auth-api";
import { tokenManager } from "./token-manager";

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isBootstrapping: false,
};

type AuthStore = {
  state: AuthState;
  bootstrap: () => Promise<void>;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (credentials: RegisterRequest) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  state: initialState,

  bootstrap: async () => {
    const token = tokenManager.getToken();
    if (!token) {
      set({ state: initialState });
      return;
    }

    set((s) => ({
      state: {
        ...s.state,
        accessToken: token,
        isAuthenticated: true,
        isBootstrapping: true,
      },
    }));

    try {
      const user = await getMe();
      set({
        state: {
          user,
          accessToken: token,
          isAuthenticated: true,
          isBootstrapping: false,
        },
      });
    } catch {
      tokenManager.removeToken();
      set({ state: initialState });
    }
  },

  login: async (credentials) => {
    const response = await loginApi(credentials);
    tokenManager.setToken(response.accessToken);
    set({
      state: {
        user: response.user,
        accessToken: response.accessToken,
        isAuthenticated: true,
        isBootstrapping: false,
      },
    });
  },

  register: async (credentials) => {
    const response = await registerApi(credentials);
    tokenManager.setToken(response.accessToken);
    set({
      state: {
        user: response.user,
        accessToken: response.accessToken,
        isAuthenticated: true,
        isBootstrapping: false,
      },
    });
  },

  logout: () => {
    tokenManager.removeToken();
    set({ state: initialState });
  },
}));
