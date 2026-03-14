'use client';

interface Props {
  values: number[];
  colorFn?: (val: number, avg: number) => string;
}

function defaultColorFn(val: number, avg: number): string {
  if (avg === 0) return '#8a68c0';
  const ratio = val / avg;
  if (ratio < 0.9) return '#60c860';
  if (ratio <= 1.1) return '#8a68c0';
  return '#c04040';
}

export function Sparkline({ values, colorFn = defaultColorFn }: Props) {
  const BAR_W = 8;
  const GAP = 2;
  const MAX_H = 24;

  const nonZero = values.filter((v) => v > 0);
  const avg = nonZero.length > 0 ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length : 0;
  const maxVal = Math.max(...values, 1);

  const totalW = values.length * BAR_W + (values.length - 1) * GAP;

  return (
    <svg
      width={totalW}
      height={MAX_H}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
      aria-label="sparkline"
    >
      {values.map((val, i) => {
        const h = Math.max(2, Math.round((val / maxVal) * MAX_H));
        const x = i * (BAR_W + GAP);
        const y = MAX_H - h;
        const color = colorFn(val, avg);
        return <rect key={i} x={x} y={y} width={BAR_W} height={h} fill={color} rx={1} />;
      })}
    </svg>
  );
}
