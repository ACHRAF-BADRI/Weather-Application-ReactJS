import { formatDay } from '@/lib/format';

const W = 640;
const H = 220;
const PAD = { top: 16, right: 16, bottom: 40, left: 36 };

// Line chart of daily highs/lows: observed → provider forecast → AI estimate
// (dashed, with its 80% uncertainty band).
export default function TempChart({ observed, forecast, predicted, lang, labels }) {
  const known = [...observed, ...forecast];
  const all = [...known, ...predicted];
  const values = [
    ...known.flatMap((d) => [d.max, d.min]),
    ...predicted.flatMap((d) => [...d.maxRange, ...d.minRange]),
  ];
  const lo = Math.floor(Math.min(...values) - 1);
  const hi = Math.ceil(Math.max(...values) + 1);

  const x = (i) => PAD.left + (i * (W - PAD.left - PAD.right)) / Math.max(1, all.length - 1);
  const y = (v) => PAD.top + ((hi - v) * (H - PAD.top - PAD.bottom)) / (hi - lo);
  const path = (points) => points.map(([i, v], k) => `${k ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  const lastKnown = known.length - 1;
  const knownLine = (key) => path(known.map((d, i) => [i, d[key]]));
  const aiLine = (key) => path([[lastKnown, known[lastKnown][key]], ...predicted.map((d, i) => [lastKnown + 1 + i, d[key]])]);
  const band = (key) => {
    const upper = predicted.map((d, i) => [lastKnown + 1 + i, d[`${key}Range`][1]]);
    const lower = predicted.map((d, i) => [lastKnown + 1 + i, d[`${key}Range`][0]]).reverse();
    const start = [lastKnown, known[lastKnown][key]];
    return `${path([start, ...upper, ...lower])} Z`;
  };

  const ticks = [];
  const step = Math.max(2, Math.ceil((hi - lo) / 5));
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) ticks.push(v);

  const firstForecast = observed.length;

  return (
    <div className="-mx-2 overflow-x-auto px-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[560px]" role="img" aria-label={labels.aria}>
        {observed.length > 0 && (
          <rect x={PAD.left} y={PAD.top} width={x(firstForecast) - PAD.left - 10} height={H - PAD.top - PAD.bottom} className="fill-tint" opacity="0.03" rx="8" />
        )}
        <rect x={x(lastKnown) + 10} y={PAD.top} width={W - PAD.right - x(lastKnown) - 10} height={H - PAD.top - PAD.bottom} className="fill-ai" opacity="0.05" rx="8" />

        {ticks.map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} className="stroke-tint" opacity="0.1" />
            <text x={PAD.left - 8} y={y(v) + 4} textAnchor="end" fontSize="11" className="fill-subtle">
              {v}°
            </text>
          </g>
        ))}

        <path d={band('max')} className="fill-ai" opacity="0.15" />
        <path d={band('min')} className="fill-chart-min" opacity="0.1" />

        <path d={knownLine('min')} fill="none" className="stroke-chart-min" strokeWidth="2" strokeLinejoin="round" opacity="0.8" />
        <path d={knownLine('max')} fill="none" className="stroke-accent" strokeWidth="2.5" strokeLinejoin="round" />
        <path d={aiLine('min')} fill="none" className="stroke-chart-min" strokeWidth="2" strokeDasharray="5 5" opacity="0.8" />
        <path d={aiLine('max')} fill="none" className="stroke-ai" strokeWidth="2.5" strokeDasharray="6 5" />

        {all.map((d, i) => {
          const isAi = i > lastKnown;
          return (
            <g key={d.date}>
              <circle cx={x(i)} cy={y(d.max)} r="3.5" className={isAi ? 'fill-ai' : 'fill-accent'}>
                <title>{`${formatDay(d.date, lang)}: ${d.min}° / ${d.max}°`}</title>
              </circle>
              <text x={x(i)} y={H - PAD.bottom + 18} textAnchor="middle" fontSize="11" className={isAi ? 'fill-ai' : 'fill-subtle'}>
                {formatDay(d.date, lang, { weekday: 'short' })}
              </text>
              <text x={x(i)} y={H - PAD.bottom + 32} textAnchor="middle" fontSize="10" className="fill-faint">
                {formatDay(d.date, lang, { day: 'numeric' })}
              </text>
            </g>
          );
        })}
      </svg>

      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-subtle">
        {observed.length > 0 && (
          <li className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-sm bg-tint/10" /> {labels.observed}
          </li>
        )}
        <li className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-accent" /> {labels.forecast}
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 border-t-2 border-dashed border-ai" /> {labels.predicted}
        </li>
      </ul>
    </div>
  );
}
