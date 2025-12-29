import { useEffect, useRef, useState } from "react";
import { useSystemStore } from "~/api/system/system-store";

export function GlobalLoader() {
  const isActive = useSystemStore((s) => s.loading);

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);

    if (isActive) {
      setMounted(true);
      showTimerRef.current = window.setTimeout(() => setVisible(true), 150);
    } else {
      setVisible(false);
      hideTimerRef.current = window.setTimeout(() => setMounted(false), 250);
    }

    return () => {
      if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, [isActive]);

  if (!mounted) return null;

  return (
    <div
      className={`app-loader-overlay ${visible ? "app-loader-overlay--active" : ""}`}
      aria-hidden={!visible}
    >
      <div className="app-loader" role="status" aria-label="Загрузка" />
    </div>
  );
}
