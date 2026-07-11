/**
 * StatChart — pure SVG bar + sparkline chart for the admin dashboard.
 * Accepts the MongoDB daily-aggregate format: [{ _id: "2025-01-01", count: 5 }, ...]
 * No external chart library required.
 */
import { useMemo, useState } from "react";

const W = 320;
const H = 100;
const PAD = { top: 8, right: 8, bottom: 24, left: 28 };

// Build the last-7-days date labels regardless of gaps in the data
function buildDays(rawData) {
  const map = {};
  rawData.forEach(({ _id, count }) => { map[_id] = count; });

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    days.push({ label: d.toLocaleDateString("en", { weekday: "short" }), key, count: map[key] || 0 });
  }
  return days;
}

export default function StatChart({ title, data = [], color = "#6366f1" }) {
  const [tooltip, setTooltip] = useState(null);
  const days = useMemo(() => buildDays(data), [data]);

  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const maxVal = Math.max(...days.map(d => d.count), 1);

  const barW = chartW / days.length;

  // Polyline points for the trend line
  const linePoints = days
    .map((d, i) => {
      const x = PAD.left + i * barW + barW / 2;
      const y = PAD.top + chartH - (d.count / maxVal) * chartH;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {title}
      </p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full overflow-visible"
        aria-label={title}
        role="img"
      >
        <defs>
          <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y-axis gridlines */}
        {[0, 0.5, 1].map((f) => {
          const y = PAD.top + chartH * (1 - f);
          return (
            <g key={f}>
              <line
                x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-slate-200 dark:text-slate-800"
                strokeDasharray="4 4"
              />
              <text
                x={PAD.left - 4} y={y + 4}
                textAnchor="end"
                fontSize="8"
                className="fill-slate-400"
              >
                {Math.round(maxVal * f)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {days.map((d, i) => {
          const x = PAD.left + i * barW;
          const barH = Math.max(2, (d.count / maxVal) * chartH);
          const y = PAD.top + chartH - barH;
          const isHovered = tooltip?.i === i;

          return (
            <g key={d.key}>
              <rect
                x={x + 2} y={y}
                width={barW - 4} height={barH}
                rx="3"
                fill={color}
                opacity={isHovered ? 1 : 0.35}
                className="transition-opacity"
                onMouseEnter={() => setTooltip({ i, d })}
                onMouseLeave={() => setTooltip(null)}
                style={{ cursor: "default" }}
              />
              {/* X-axis label */}
              <text
                x={x + barW / 2} y={H - 4}
                textAnchor="middle"
                fontSize="8"
                className="fill-slate-400"
              >
                {d.label}
              </text>
            </g>
          );
        })}

        {/* Trend line */}
        <polyline
          points={linePoints}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Tooltip */}
        {tooltip && (() => {
          const { i, d } = tooltip;
          const cx = PAD.left + i * barW + barW / 2;
          const cy = PAD.top + chartH - (d.count / maxVal) * chartH;
          return (
            <g>
              <circle cx={cx} cy={cy} r={4} fill={color} />
              <rect
                x={Math.min(cx - 20, W - PAD.right - 46)}
                y={cy - 28}
                width={46} height={18} rx={4}
                fill={color}
              />
              <text
                x={Math.min(cx - 20, W - PAD.right - 46) + 23}
                y={cy - 15}
                textAnchor="middle"
                fontSize="9"
                fill="white"
                fontWeight="600"
              >
                {d.count} {d.count === 1 ? "event" : "events"}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
