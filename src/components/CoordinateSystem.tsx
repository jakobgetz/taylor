import { useMemo } from 'react';
import type { TaylorFunction } from '../data/functions';
import './CoordinateSystem.css';

interface Props {
  fn: TaylorFunction;
  termRange: [number, number] | null;
  numTerms: number;
}

const W = 900;
const H = 500;
const PAD = { top: 24, right: 24, bottom: 48, left: 56 };
const N_SAMPLES = 700;

function buildPath(
  compute: (x: number) => number,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  toSvgX: (x: number) => number,
  toSvgY: (y: number) => number,
): string {
  const slack = (yMax - yMin) * 0.3;
  let d = '';
  let penDown = false;

  for (let i = 0; i <= N_SAMPLES; i++) {
    const x = xMin + ((xMax - xMin) * i) / N_SAMPLES;
    const y = compute(x);

    if (!isFinite(y) || y < yMin - slack || y > yMax + slack) {
      penDown = false;
      continue;
    }

    const sx = toSvgX(x).toFixed(2);
    const sy = toSvgY(Math.max(yMin - slack, Math.min(yMax + slack, y))).toFixed(2);

    if (!penDown) {
      d += `M${sx},${sy}`;
      penDown = true;
    } else {
      d += `L${sx},${sy}`;
    }
  }
  return d;
}

function niceGrid(min: number, max: number, maxLines = 14): number[] {
  const range = max - min;
  const rawStep = range / maxLines;
  const pow = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const niceMult = [1, 2, 2.5, 5, 10].find((m) => m * pow >= rawStep) ?? 10;
  const step = niceMult * pow;
  const lines: number[] = [];
  const start = Math.ceil(min / step) * step;
  for (let v = start; v <= max + 1e-9; v += step) {
    lines.push(parseFloat(v.toFixed(10)));
  }
  return lines;
}

function fmt(v: number): string {
  if (Math.abs(v) < 1e-9) return '0';
  const s = parseFloat(v.toPrecision(4)).toString();
  return s.replace(/\.?0+$/, '');
}

export function CoordinateSystem({ fn, termRange, numTerms }: Props) {
  const [xMin, xMax] = fn.xRange;
  const [yMin, yMax] = fn.yRange;

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const toSvgX = (x: number) =>
    PAD.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const toSvgY = (y: number) =>
    H - PAD.bottom - ((y - yMin) / (yMax - yMin)) * plotH;

  const axisX = Math.max(xMin, Math.min(xMax, 0));
  const axisY = Math.max(yMin, Math.min(yMax, 0));

  const xGrid = useMemo(() => niceGrid(xMin, xMax), [xMin, xMax]);
  const yGrid = useMemo(() => niceGrid(yMin, yMax), [yMin, yMax]);

  // Full Taylor partial sum using numTerms visible terms
  const taylorSum = useMemo(
    () => (x: number) =>
      fn.terms.slice(0, numTerms).reduce((s, t) => s + t.compute(x), 0),
    [fn, numTerms],
  );

  // Partial sum for the selected range
  const rangeSum = useMemo(() => {
    if (termRange === null) return null;
    const [lo, hi] = termRange;
    const rangeTerms = fn.terms.slice(lo, hi + 1);
    return (x: number) => rangeTerms.reduce((s, t) => s + t.compute(x), 0);
  }, [fn, termRange]);

  const exactPath = useMemo(
    () => buildPath(fn.exact, xMin, xMax, yMin, yMax, toSvgX, toSvgY),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn],
  );

  const taylorPath = useMemo(
    () => buildPath(taylorSum, xMin, xMax, yMin, yMax, toSvgX, toSvgY),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn, numTerms],
  );

  const rangePath = useMemo(
    () =>
      rangeSum
        ? buildPath(rangeSum, xMin, xMax, yMin, yMax, toSvgX, toSvgY)
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn, termRange],
  );

  const isSingleTerm =
    termRange !== null && termRange[0] === termRange[1];
  const isRange = termRange !== null && termRange[0] !== termRange[1];

  const legendLines = isRange ? 3 : termRange !== null ? 3 : 2;
  const legendH = 20 + legendLines * 22;

  return (
    <div className="coord-wrapper">
      <svg
        className="coord-svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <clipPath id="plot-clip">
            <rect x={PAD.left} y={PAD.top} width={plotW} height={plotH} />
          </clipPath>
        </defs>

        <rect x={PAD.left} y={PAD.top} width={plotW} height={plotH} className="plot-bg" />

        {/* ── grid lines ── */}
        <g className="grid">
          {xGrid.map((v) => (
            <line key={`xg-${v}`} x1={toSvgX(v)} y1={PAD.top} x2={toSvgX(v)} y2={H - PAD.bottom} className="grid-line" />
          ))}
          {yGrid.map((v) => (
            <line key={`yg-${v}`} x1={PAD.left} y1={toSvgY(v)} x2={W - PAD.right} y2={toSvgY(v)} className="grid-line" />
          ))}
        </g>

        {/* ── axes ── */}
        <line x1={toSvgX(axisX)} y1={PAD.top} x2={toSvgX(axisX)} y2={H - PAD.bottom} className="axis-line" />
        <line x1={PAD.left} y1={toSvgY(axisY)} x2={W - PAD.right} y2={toSvgY(axisY)} className="axis-line" />

        {/* ── tick labels: x ── */}
        {xGrid.map((v) =>
          Math.abs(v) < 1e-9 ? null : (
            <text key={`xl-${v}`} x={toSvgX(v)} y={toSvgY(axisY) + 16} className="tick-label tick-label--x">
              {fmt(v)}
            </text>
          ),
        )}

        {/* ── tick labels: y ── */}
        {yGrid.map((v) =>
          Math.abs(v) < 1e-9 ? null : (
            <text key={`yl-${v}`} x={toSvgX(axisX) - 6} y={toSvgY(v) + 4} className="tick-label tick-label--y">
              {fmt(v)}
            </text>
          ),
        )}

        <text x={toSvgX(axisX) - 6} y={toSvgY(axisY) + 16} className="tick-label tick-label--y">0</text>

        {/* ── curves (clipped) ── */}
        <g clipPath="url(#plot-clip)">
          {/* Full Taylor sum — shown always; dimmed when a range is active */}
          <path
            d={taylorPath}
            className={`curve-taylor ${termRange !== null ? 'curve-taylor--dim' : ''}`}
          />

          {/* Exact function — always visible, drawn on top */}
          <path d={exactPath} className="curve-exact" />

          {/* Range / single-term curve */}
          {rangePath && (
            <path d={rangePath} className="curve-term" />
          )}
        </g>

        {/* ── legend ── */}
        <g className="legend" transform={`translate(${W - PAD.right - 230}, ${PAD.top + 10})`}>
          <rect width={220} height={legendH} className="legend-bg" rx={6} />

          {/* exact */}
          <line x1={10} y1={16} x2={36} y2={16} className="legend-swatch legend-swatch--exact" />
          <text x={44} y={20} className="legend-label">{fn.name} (exact)</text>

          {/* Taylor sum */}
          <line
            x1={10} y1={38} x2={36} y2={38}
            className={`legend-swatch ${termRange !== null ? 'legend-swatch--taylor-dim' : 'legend-swatch--taylor'}`}
          />
          <text x={44} y={42} className="legend-label">
            Taylor sum ({numTerms} terms)
          </text>

          {/* range / single term */}
          {termRange !== null && (
            <>
              <line x1={10} y1={60} x2={36} y2={60} className="legend-swatch legend-swatch--term" />
              <text x={44} y={64} className="legend-label">
                {isSingleTerm
                  ? `Term ${termRange[0]}`
                  : `Terms ${termRange[0]}–${termRange[1]}`}
              </text>
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
