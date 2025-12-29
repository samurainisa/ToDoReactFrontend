import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type ChartTooltipState =
  | { visible: false }
  | {
      visible: true;
      x: number;
      y: number;
      title?: string;
      lines?: string[];
    };

export function ChartTooltip({ tooltip }: { tooltip: ChartTooltipState }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 });

  const contentKey = useMemo(() => {
    if (!tooltip.visible) return "";
    return `${tooltip.title ?? ""}|${(tooltip.lines ?? []).join("|")}`;
  }, [tooltip]);

  useEffect(() => {
    if (!tooltip.visible) return;
    const element = ref.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const padding = 12;

    let left = tooltip.x + padding;
    let top = tooltip.y + padding;

    if (left + rect.width + padding > window.innerWidth) {
      left = Math.max(padding, tooltip.x - rect.width - padding);
    }

    if (top + rect.height + padding > window.innerHeight) {
      top = Math.max(padding, tooltip.y - rect.height - padding);
    }

    setPosition({ left, top });
  }, [tooltip.visible, tooltip.visible ? tooltip.x : null, tooltip.visible ? tooltip.y : null, contentKey]);

  if (!tooltip.visible || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={ref}
      className="chart-tooltip"
      role="tooltip"
      style={{ left: position.left, top: position.top }}
    >
      {tooltip.title && <div className="chart-tooltip__title">{tooltip.title}</div>}
      {tooltip.lines?.map((line) => (
        <div key={line} className="chart-tooltip__line">
          {line}
        </div>
      ))}
    </div>,
    document.body
  );
}

