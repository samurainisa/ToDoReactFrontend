import { createContext, useContext, useRef } from "react";
import { Toast } from "primereact/toast";

type ToastApi = {
  show: Toast["show"];
  clear: Toast["clear"];
};

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toastRef = useRef<Toast>(null);

  const api: ToastApi = {
    show: (message) => toastRef.current?.show(message),
    clear: () => toastRef.current?.clear(),
  };

  return (
    <ToastContext.Provider value={api}>
      <Toast ref={toastRef} position="top-right" />
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}