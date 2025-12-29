import { useMemo, useState, type FocusEvent, type MouseEvent as ReactMouseEvent } from "react";
import { ChartTooltip, type ChartTooltipState } from "./chart-tooltip";

export type DonutSegment = {
  id: string;
  label: string;
  value: number;
  color: string;
};

type DonutChartProps = {
  segments: DonutSegment[];
  centerValue?: string;
  centerLabel?: string;
  height?: number;
};

type Point = { x: number; y: number };

function polarToCartesian(cx: number, cy: number, radius: number, angleRad: number): Point {
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function donutArcPath(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);

  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

export function DonutChart({ segments, centerLabel, centerValue, height = 220 }: DonutChartProps) {
  const size = 220;
  const padding = 10;
  const thickness = 28;
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = cx - padding;
  const innerRadius = outerRadius - thickness;

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<ChartTooltipState>({ visible: false });

  const visibleSegments = useMemo(() => {
    return segments.filter((s) => Number.isFinite(s.value) && s.value > 0);
  }, [segments]);

  const total = useMemo(() => visibleSegments.reduce((acc, s) => acc + s.value, 0), [visibleSegments]);

  const arcs = useMemo(() => {
    if (total <= 0) return [];

    const startAt = -Math.PI / 2;
    const gap = visibleSegments.length > 1 ? 0.02 : 0;

    let angle = startAt;
    return visibleSegments.map((segment) => {
      const fraction = segment.value / total;
      const rawStart = angle;
      const rawEnd = angle + fraction * Math.PI * 2;
      angle = rawEnd;

      const start = rawStart + gap / 2;
      const end = rawEnd - gap / 2;

      if (end <= start) return null;

      return {
        segment,
        d: donutArcPath(cx, cy, outerRadius, innerRadius, start, end),
      };
    });
  }, [cx, cy, innerRadius, outerRadius, total, visibleSegments]);

  const updateTooltip = (event: ReactMouseEvent<SVGPathElement>, segment: DonutSegment) => {
    setTooltip({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      title: segment.label,
      lines: [`${segment.value}`],
    });
  };

  const updateTooltipFromFocus = (event: FocusEvent<SVGPathElement>, segment: DonutSegment) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      title: segment.label,
      lines: [`${segment.value}`],
    });
  };

  const hideTooltip = () => setTooltip({ visible: false });

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width="100%"
        height={height}
        style={{ display: "block" }}
        aria-label="Диаграмма"
      >
        {total <= 0 ? (
          <>
            <circle
              cx={cx}
              cy={cy}
              r={outerRadius - thickness / 2}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={thickness}
            />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#6b7280" fontSize={14}>
              Нет данных
            </text>
          </>
        ) : (
          <>
            {arcs.map((arc) => {
              if (!arc) return null;
              const { segment, d } = arc;
              const dimmed = hoveredId !== null && hoveredId !== segment.id;
              return (
                <path
                  key={segment.id}
                  d={d}
                  fill={segment.color}
                  opacity={dimmed ? 0.45 : 1}
                  onMouseEnter={(e) => {
                    setHoveredId(segment.id);
                    updateTooltip(e, segment);
                  }}
                  onMouseMove={(e) => updateTooltip(e, segment)}
                  onMouseLeave={() => {
                    setHoveredId(null);
                    hideTooltip();
                  }}
                  tabIndex={0}
                  onFocus={(e) => {
                    setHoveredId(segment.id);
                    updateTooltipFromFocus(e, segment);
                  }}
                  onBlur={() => {
                    setHoveredId(null);
                    hideTooltip();
                  }}
                  style={{ cursor: "default", outline: "none" }}
                />
              );
            })}

            {(centerValue || centerLabel) && (
              <>
                {centerValue && (
                  <text
                    x={cx}
                    y={cy - 6}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#111827"
                    fontSize={26}
                    fontWeight={700}
                  >
                    {centerValue}
                  </text>
                )}
                {centerLabel && (
                  <text
                    x={cx}
                    y={cy + 18}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#6b7280"
                    fontSize={12}
                  >
                    {centerLabel}
                  </text>
                )}
              </>
            )}
          </>
        )}
      </svg>
      <ChartTooltip tooltip={tooltip} />
    </div>
  );
}
