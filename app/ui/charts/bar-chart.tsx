import { useEffect, useMemo, useRef, useState, type FocusEvent, type MouseEvent as ReactMouseEvent } from "react";
import { ChartTooltip, type ChartTooltipState } from "./chart-tooltip";

export type BarChartDatum = {
  id: string;
  label: string;
  value: number;
  color?: string;
};

type BarChartProps = {
  data: BarChartDatum[];
  height?: number;
  yLabel?: string;
};

export function BarChart({ data, height = 260, yLabel }: BarChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const svgWidth = useMemo(() => {
    if (!containerWidth) return 640;
    return Math.max(360, Math.round(containerWidth));
  }, [containerWidth]);

  const svgHeight = Math.max(220, Math.round(height));
  const margin = { top: 14, right: 12, bottom: 34, left: 36 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<ChartTooltipState>({ visible: false });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const update = () => setContainerWidth(element.getBoundingClientRect().width);
    update();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setContainerWidth(entry.contentRect.width);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const safeData = useMemo(() => {
    return data.map((d) => ({ ...d, value: Number.isFinite(d.value) ? Math.max(0, d.value) : 0 }));
  }, [data]);

  const maxValue = useMemo(() => safeData.reduce((acc, d) => Math.max(acc, d.value), 0), [safeData]);
  const yMax = maxValue > 0 ? maxValue : 1;

  const cellWidth = safeData.length > 0 ? plotWidth / safeData.length : plotWidth;
  const barWidth = Math.max(6, cellWidth * 0.65);

  const updateTooltip = (event: ReactMouseEvent<SVGRectElement>, d: BarChartDatum) => {
    setTooltip({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      title: d.label,
      lines: [`${d.value}`],
    });
  };

  const updateTooltipFromFocus = (event: FocusEvent<SVGRectElement>, d: BarChartDatum) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      title: d.label,
      lines: [`${d.value}`],
    });
  };

  const hideTooltip = () => setTooltip({ visible: false });

  const ticks = 4;
  const gridLines = Array.from({ length: ticks + 1 }, (_, i) => {
    const ratio = i / ticks;
    const y = margin.top + plotHeight - ratio * plotHeight;
    const value = Math.round(ratio * yMax);
    return { y, value };
  });

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", minHeight: svgHeight }}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        width="100%"
        height={svgHeight}
        style={{ display: "block" }}
        aria-label="Гистограмма"
      >
        {gridLines.map((t) => (
          <g key={t.y}>
            <line x1={margin.left} x2={svgWidth - margin.right} y1={t.y} y2={t.y} stroke="#eef2f7" />
            <text
              x={margin.left - 10}
              y={t.y}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={11}
              fill="#6b7280"
            >
              {t.value}
            </text>
          </g>
        ))}

        {yLabel && (
          <text x={margin.left} y={12} fontSize={12} fill="#6b7280">
            {yLabel}
          </text>
        )}

        {safeData.map((d, i) => {
          const value = d.value;
          const barHeight = (value / yMax) * plotHeight;
          const x = margin.left + i * cellWidth + (cellWidth - barWidth) / 2;
          const y = margin.top + plotHeight - barHeight;
          const dimmed = hoveredId !== null && hoveredId !== d.id;
          const fill = d.color ?? "var(--primary-color, #3b82f6)";

          return (
            <g key={d.id}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={6}
                fill={fill}
                opacity={dimmed ? 0.45 : 1}
                onMouseEnter={(e) => {
                  setHoveredId(d.id);
                  updateTooltip(e, d);
                }}
                onMouseMove={(e) => updateTooltip(e, d)}
                onMouseLeave={() => {
                  setHoveredId(null);
                  hideTooltip();
                }}
                tabIndex={0}
                onFocus={(e) => {
                  setHoveredId(d.id);
                  updateTooltipFromFocus(e, d);
                }}
                onBlur={() => {
                  setHoveredId(null);
                  hideTooltip();
                }}
                style={{ cursor: "default", outline: "none" }}
              />
              <text
                x={x + barWidth / 2}
                y={svgHeight - 12}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={12}
                fill="#111827"
              >
                {d.label}
              </text>
            </g>
          );
        })}

        {maxValue === 0 && (
          <text
            x={margin.left + plotWidth / 2}
            y={margin.top + plotHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#6b7280"
            fontSize={14}
          >
            Нет данных
          </text>
        )}
      </svg>
      <ChartTooltip tooltip={tooltip} />
    </div>
  );
}
