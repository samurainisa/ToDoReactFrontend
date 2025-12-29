import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import type { Route } from "./+types/root";
import "./styles/main.scss";
import { ToastProvider } from "./ui/base/toast-provider";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "./api/auth/auth-store";
import { useSystemStore } from "./api/system/system-store";
import { Header } from "./ui/base/header";
import { ConfirmDialog } from "primereact/confirmdialog";
import { GlobalLoader } from "./ui/base/global-loader";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/icon?family=Material+Icons",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <PrimeReactProvider
      value={{
        ripple: true,
        appendTo: typeof window !== "undefined" ? "self" : undefined,
      }}
    >
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <ConfirmDialog baseZIndex={3500} blockScroll />
          <GlobalLoader />
          <AuthBootstrapper />
          <Header />
          <Outlet />
        </QueryClientProvider>
      </ToastProvider>
    </PrimeReactProvider>
  );
}

function AuthBootstrapper() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const logout = useAuthStore((s) => s.logout);
  const resetLoading = useSystemStore((s) => s.resetLoading);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const handleLogout = () => {
      logout();
      queryClient.clear();
      resetLoading();
      navigate("/login");
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, [logout, navigate, queryClient, resetLoading]);

  return null;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main style={{ paddingTop: 64, padding: 16, maxWidth: 1200, margin: "0 auto" }}>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre style={{ width: "100%", padding: 16, overflowX: "auto" }}>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
