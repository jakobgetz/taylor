import { useState, useRef, useCallback, useEffect } from 'react';
import './UnitCircle.css';

const CX = 240;
const CY = 240;
const R = 130;

const toSvgX = (x: number) => CX + x * R;
const toSvgY = (y: number) => CY - y * R;

const SPECIAL_ANGLES: [number, string][] = [
  [0, '0'],
  [Math.PI / 6, 'π/6'],
  [Math.PI / 4, 'π/4'],
  [Math.PI / 3, 'π/3'],
  [Math.PI / 2, 'π/2'],
  [(2 * Math.PI) / 3, '2π/3'],
  [(3 * Math.PI) / 4, '3π/4'],
  [(5 * Math.PI) / 6, '5π/6'],
  [Math.PI, 'π'],
  [(7 * Math.PI) / 6, '7π/6'],
  [(5 * Math.PI) / 4, '5π/4'],
  [(4 * Math.PI) / 3, '4π/3'],
  [(3 * Math.PI) / 2, '3π/2'],
  [(5 * Math.PI) / 3, '5π/3'],
  [(7 * Math.PI) / 4, '7π/4'],
  [(11 * Math.PI) / 6, '11π/6'],
  [2 * Math.PI, '2π'],
];

type ExactValues = { sin: string; cos: string; tan: string; cot: string; sec: string; csc: string };

// k = round(theta / (π/12)); columns: [sin, cos, tan, cot, sec, csc]; '∞' = undefined
const EXACT_TABLE: Record<number, [string, string, string, string, string, string]> = {
  0:  ['0',      '1',       '0',       '∞',       '1',        '∞'      ],
  2:  ['½',      '√3/2',    '√3/3',    '√3',      '2√3/3',    '2'      ],
  3:  ['√2/2',   '√2/2',    '1',       '1',       '√2',       '√2'     ],
  4:  ['√3/2',   '½',       '√3',      '√3/3',    '2',        '2√3/3'  ],
  6:  ['1',      '0',       '∞',       '0',       '∞',        '1'      ],
  8:  ['√3/2',   '−½',      '−√3',     '−√3/3',   '−2',       '2√3/3'  ],
  9:  ['√2/2',   '−√2/2',   '−1',      '−1',      '−√2',      '√2'     ],
  10: ['½',      '−√3/2',   '−√3/3',   '−√3',     '−2√3/3',   '2'      ],
  12: ['0',      '−1',      '0',       '∞',       '−1',       '∞'      ],
  14: ['−½',     '−√3/2',   '√3/3',    '√3',      '−2√3/3',   '−2'     ],
  15: ['−√2/2',  '−√2/2',   '1',       '1',       '−√2',      '−√2'    ],
  16: ['−√3/2',  '−½',      '√3',      '√3/3',    '−2',       '−2√3/3' ],
  18: ['−1',     '0',       '∞',       '0',       '∞',        '−1'     ],
  20: ['−√3/2',  '½',       '−√3',     '−√3/3',   '2',        '−2√3/3' ],
  21: ['−√2/2',  '√2/2',    '−1',      '−1',      '√2',       '−√2'    ],
  22: ['−½',     '√3/2',    '−√3/3',   '−√3',     '2√3/3',    '−2'     ],
  24: ['0',      '1',       '0',       '∞',       '1',        '∞'      ],
};

function getExactAngle(displayTheta: number): string | null {
  for (const [val, label] of SPECIAL_ANGLES) {
    if (Math.abs(displayTheta - val) < 0.02) return label;
  }
  return null;
}

function getExactValues(displayTheta: number): ExactValues | null {
  const k = Math.round(displayTheta / (Math.PI / 12));
  const snapped = k * Math.PI / 12;
  if (Math.abs(displayTheta - snapped) > 0.025) return null;
  const row = EXACT_TABLE[k];
  if (!row) return null;
  return { sin: row[0], cos: row[1], tan: row[2], cot: row[3], sec: row[4], csc: row[5] };
}

function isUndef(v: number) {
  return !isFinite(v) || Math.abs(v) > 50;
}

function fmtVal(v: number) {
  if (isUndef(v)) return '∞';
  return v.toFixed(4);
}

interface FnRowProps {
  dot: string;
  name: string;
  value: number;
  color: string;
  exact?: string;
  hovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function FnRow({ dot, name, value, color, exact, hovered, onMouseEnter, onMouseLeave }: FnRowProps) {
  const undef = isUndef(value) || exact === '∞';
  const barWidth = undef ? 0 : Math.min(1, Math.abs(value) / 5);
  return (
    <div
      className={`uc-fn-row${hovered ? ' uc-fn-row--hovered' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="uc-fn-main">
        <div className="uc-fn-dot" style={{ background: dot }} />
        <span className="uc-fn-name">{name}</span>
        <span className="uc-fn-eq">=</span>
        {exact && exact !== '∞' ? (
          <>
            <span className="uc-fn-exact">{exact}</span>
            <span className="uc-fn-approx">≈ {value.toFixed(4)}</span>
          </>
        ) : (
          <span className={`uc-fn-val${undef ? ' uc-fn-val--undef' : ''}`}>
            {undef ? '∞' : fmtVal(value)}
          </span>
        )}
      </div>
      {!undef && (
        <div className="uc-fn-bar-wrap">
          <div
            className="uc-fn-bar"
            style={{ width: `${barWidth * 100}%`, background: color }}
          />
        </div>
      )}
    </div>
  );
}

export function UnitCircle() {
  const [theta, _setTheta] = useState(Math.PI / 4);
  const [dragging, _setDragging] = useState(false);
  const [hoveredFn, setHoveredFn] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef(false);

  const setDragging = (v: boolean) => {
    draggingRef.current = v;
    _setDragging(v);
  };

  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const tanT = sinT / cosT;
  const cotT = cosT / sinT;
  const secT = 1 / cosT;
  const cscT = 1 / sinT;

  const showTan = Math.abs(cosT) > 0.08;
  const showCot = Math.abs(sinT) > 0.08;

  // Segment opacity/width based on hover
  const seg = (name: string, baseWidth: number) => ({
    opacity: hoveredFn === null || hoveredFn === name ? 1 : 0.15,
    strokeWidth: hoveredFn === name ? baseWidth * 2 : baseWidth,
    transition: 'opacity 0.15s, stroke-width 0.15s',
  });

  // Label positions along sec/csc lines (clamped so they stay on screen)
  const secLabelT  = showTan ? Math.min(0.6, 1.0 / Math.max(1, Math.abs(secT))) : 0;
  const secLblX    = CX + secLabelT * R + 14;
  const secLblY    = CY - secLabelT * tanT * R;
  const cscLabelT  = showCot ? Math.min(0.6, 1.0 / Math.max(1, Math.abs(cscT))) : 0;
  const cscLblX    = CX + cscLabelT * cotT * R;
  const cscLblY    = CY - cscLabelT * R - 14;

  // SVG coords for point P
  const px = toSvgX(cosT);
  const py = toSvgY(sinT);

  // Angle display
  const displayTheta = ((theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const degrees = (displayTheta * 180 / Math.PI).toFixed(1);
  const exactAngle = getExactAngle(displayTheta);
  const piCoeff = displayTheta / Math.PI;
  const piLabel = exactAngle ?? `${piCoeff.toFixed(3)}π`;
  const approxRad = displayTheta.toFixed(3);
  const exactVals = getExactValues(displayTheta);

  const getAngleFromEvent = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = (e.clientX - rect.left) * (480 / rect.width);
    const svgY = (e.clientY - rect.top) * (480 / rect.height);
    const mathX = (svgX - CX) / R;
    const mathY = -(svgY - CY) / R;
    return Math.atan2(mathY, mathX);
  }, []);

  const handleSvgMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    const angle = getAngleFromEvent(e);
    if (angle !== null) _setTheta(angle);
    setDragging(true);
  }, [getAngleFromEvent]);

  const handleSvgMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingRef.current) return;
    e.preventDefault();
    const angle = getAngleFromEvent(e);
    if (angle !== null) _setTheta(angle);
  }, [getAngleFromEvent]);

  useEffect(() => {
    const handleMouseUp = () => setDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Grid lines
  const gridLines = [];
  for (let v = -2; v <= 2; v++) {
    // Vertical lines (x = v)
    const isDash = v !== 0;
    gridLines.push(
      <line
        key={`vx${v}`}
        x1={toSvgX(v)} y1={toSvgY(-2.5)}
        x2={toSvgX(v)} y2={toSvgY(2.5)}
        stroke="#e2e8f0" strokeWidth={0.5}
        strokeDasharray={isDash ? '4 4' : undefined}
      />
    );
    // Horizontal lines (y = v)
    gridLines.push(
      <line
        key={`hy${v}`}
        x1={toSvgX(-2.5)} y1={toSvgY(v)}
        x2={toSvgX(2.5)} y2={toSvgY(v)}
        stroke="#e2e8f0" strokeWidth={0.5}
        strokeDasharray={isDash ? '4 4' : undefined}
      />
    );
  }

  return (
    <div className="uc-container">
      <div className="uc-svg-wrap">
        <svg
          ref={svgRef}
          viewBox="0 0 480 480"
          className="uc-svg"
          onMouseDown={handleSvgMouseDown}
          onMouseMove={handleSvgMouseMove}
          style={{ cursor: dragging ? 'grabbing' : 'crosshair' }}
        >
          <defs>
            <marker id="arrowX" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8" />
            </marker>
            <marker id="arrowY" markerWidth="8" markerHeight="8" refX="3" refY="6" orient="auto">
              <path d="M0,0 L6,0 L3,8 z" fill="#94a3b8" />
            </marker>
          </defs>

          {/* Grid */}
          {gridLines}

          {/* Axes */}
          <line
            x1={toSvgX(-2.3)} y1={CY}
            x2={toSvgX(2.3)} y2={CY}
            stroke="#94a3b8" strokeWidth={1}
            markerEnd="url(#arrowX)"
          />
          <line
            x1={CX} y1={toSvgY(-2.3)}
            x2={CX} y2={toSvgY(2.3)}
            stroke="#94a3b8" strokeWidth={1}
            markerEnd="url(#arrowY)"
          />

          {/* Tick labels */}
          <text x={toSvgX(1) + 4} y={CY + 16} fontSize={11} fill="#64748b" style={{ userSelect: "none" }}>1</text>
          <text x={toSvgX(-1) - 14} y={CY + 16} fontSize={11} fill="#64748b" style={{ userSelect: "none" }}>-1</text>
          <text x={CX + 4} y={toSvgY(1) - 4} fontSize={11} fill="#64748b" style={{ userSelect: "none" }}>1</text>
          <text x={CX + 4} y={toSvgY(-1) + 4} fontSize={11} fill="#64748b" style={{ userSelect: "none" }}>-1</text>

          {/* Unit circle */}
          <circle cx={CX} cy={CY} r={R} stroke="#cbd5e1" strokeWidth={1.5} fill="none" />

          {/* Tan hint line */}
          {showTan && (
            <line
              x1={toSvgX(1)} y1={toSvgY(-2)}
              x2={toSvgX(1)} y2={toSvgY(2)}
              stroke="#fed7aa" strokeWidth={0.5} strokeDasharray="4 4"
            />
          )}

          {/* Cot hint line */}
          {showCot && (
            <line
              x1={toSvgX(-2)} y1={toSvgY(1)}
              x2={toSvgX(2)} y2={toSvgY(1)}
              stroke="#ddd6fe" strokeWidth={0.5} strokeDasharray="4 4"
            />
          )}

          {/* Angle arc and θ label removed — angle is shown in the values panel */}

          {/* sec line: (0,0) to (1, tanT) */}
          {showTan && (
            <>
              <line
                x1={CX} y1={CY}
                x2={toSvgX(1)} y2={toSvgY(tanT)}
                stroke="#059669" strokeDasharray="5 3"
                {...seg('sec', 2)}
              />
              <text
                x={secLblX} y={secLblY}
                fontSize={11} fill="#059669"
                textAnchor="start" dominantBaseline="middle"
                style={{ userSelect: 'none', pointerEvents: 'none', opacity: hoveredFn === null || hoveredFn === 'sec' ? 1 : 0.15, transition: 'opacity 0.15s' }}
              >sec θ</text>
            </>
          )}

          {/* csc line: (0,0) to (cotT, 1) */}
          {showCot && (
            <>
              <line
                x1={CX} y1={CY}
                x2={toSvgX(cotT)} y2={toSvgY(1)}
                stroke="#db2777" strokeDasharray="5 3"
                {...seg('csc', 2)}
              />
              <text
                x={cscLblX} y={cscLblY}
                fontSize={11} fill="#db2777"
                textAnchor="middle" dominantBaseline="auto"
                style={{ userSelect: 'none', pointerEvents: 'none', opacity: hoveredFn === null || hoveredFn === 'csc' ? 1 : 0.15, transition: 'opacity 0.15s' }}
              >csc θ</text>
            </>
          )}

          {/* cos segment: (0,0) to (cosT, 0) */}
          <line
            x1={CX} y1={CY}
            x2={toSvgX(cosT)} y2={CY}
            stroke="#2563eb"
            {...seg('cos', 2.5)}
          />
          <text
            x={(CX + toSvgX(cosT)) / 2}
            y={CY + (sinT >= 0 ? 14 : -6)}
            fontSize={11} fill="#2563eb" textAnchor="middle"
            style={{ userSelect: 'none', pointerEvents: 'none', opacity: hoveredFn === null || hoveredFn === 'cos' ? 1 : 0.15, transition: 'opacity 0.15s' }}
          >cos θ</text>

          {/* sin segment: (cosT, 0) to (cosT, sinT) */}
          <line
            x1={toSvgX(cosT)} y1={CY}
            x2={toSvgX(cosT)} y2={toSvgY(sinT)}
            stroke="#dc2626"
            {...seg('sin', 2.5)}
          />
          <text
            x={toSvgX(cosT) + (cosT >= 0 ? 14 : -14)}
            y={(CY + toSvgY(sinT)) / 2}
            fontSize={11} fill="#dc2626"
            textAnchor={cosT >= 0 ? 'start' : 'end'} dominantBaseline="middle"
            style={{ userSelect: 'none', pointerEvents: 'none', opacity: hoveredFn === null || hoveredFn === 'sin' ? 1 : 0.15, transition: 'opacity 0.15s' }}
          >sin θ</text>

          {/* tan segment: (1, 0) to (1, tanT) */}
          {showTan && (
            <>
              <line
                x1={toSvgX(1)} y1={CY}
                x2={toSvgX(1)} y2={toSvgY(tanT)}
                stroke="#d97706"
                {...seg('tan', 2)}
              />
              <text
                x={toSvgX(1) + 12}
                y={(CY + toSvgY(tanT)) / 2}
                fontSize={11} fill="#d97706"
                textAnchor="start" dominantBaseline="middle"
                style={{ userSelect: 'none', pointerEvents: 'none', opacity: hoveredFn === null || hoveredFn === 'tan' ? 1 : 0.15, transition: 'opacity 0.15s' }}
              >tan θ</text>
            </>
          )}

          {/* cot segment: (0,1) to (cotT, 1) */}
          {showCot && (
            <>
              <line
                x1={CX} y1={toSvgY(1)}
                x2={toSvgX(cotT)} y2={toSvgY(1)}
                stroke="#7c3aed"
                {...seg('cot', 2)}
              />
              <text
                x={(CX + toSvgX(cotT)) / 2}
                y={toSvgY(1) + (sinT >= 0 ? -10 : 14)}
                fontSize={11} fill="#7c3aed" textAnchor="middle"
                style={{ userSelect: 'none', pointerEvents: 'none', opacity: hoveredFn === null || hoveredFn === 'cot' ? 1 : 0.15, transition: 'opacity 0.15s' }}
              >cot θ</text>
            </>
          )}

          {/* Radius OP */}
          <line
            x1={CX} y1={CY}
            x2={px} y2={py}
            stroke="#64748b" strokeWidth={1}
            style={{ opacity: hoveredFn === null ? 1 : 0.3, transition: 'opacity 0.15s' }}
          />

          {/* Draggable point P */}
          <circle
            cx={px}
            cy={py}
            r={8}
            fill="white"
            stroke="#0f172a"
            strokeWidth={2}
            style={{ cursor: dragging ? 'grabbing' : 'grab' }}
          />

          {/* P label */}
          <text
            x={px + (cosT >= 0 ? 14 : -14)}
            y={py + (sinT >= 0 ? -10 : 14)}
            fontSize={12}
            fill="#0f172a"
            fontWeight="600"
            textAnchor={cosT >= 0 ? 'start' : 'end'}
            style={{ userSelect: "none", pointerEvents: "none" }}
          >P</text>
        </svg>
      </div>

      <div className="uc-values">
        <div className="uc-angle">
          <div className="uc-angle-pi">
            {piLabel} <span className="uc-angle-approx">≈ {approxRad} rad</span>
          </div>
          <div className="uc-angle-deg">{degrees}°</div>
        </div>

        <FnRow dot="#dc2626" name="sin θ" value={sinT} color="#dc2626" exact={exactVals?.sin} hovered={hoveredFn === 'sin'} onMouseEnter={() => setHoveredFn('sin')} onMouseLeave={() => setHoveredFn(null)} />
        <FnRow dot="#2563eb" name="cos θ" value={cosT} color="#2563eb" exact={exactVals?.cos} hovered={hoveredFn === 'cos'} onMouseEnter={() => setHoveredFn('cos')} onMouseLeave={() => setHoveredFn(null)} />
        <FnRow dot="#d97706" name="tan θ" value={tanT} color="#d97706" exact={exactVals?.tan} hovered={hoveredFn === 'tan'} onMouseEnter={() => setHoveredFn('tan')} onMouseLeave={() => setHoveredFn(null)} />
        <FnRow dot="#7c3aed" name="cot θ" value={cotT} color="#7c3aed" exact={exactVals?.cot} hovered={hoveredFn === 'cot'} onMouseEnter={() => setHoveredFn('cot')} onMouseLeave={() => setHoveredFn(null)} />
        <FnRow dot="#059669" name="sec θ" value={secT} color="#059669" exact={exactVals?.sec} hovered={hoveredFn === 'sec'} onMouseEnter={() => setHoveredFn('sec')} onMouseLeave={() => setHoveredFn(null)} />
        <FnRow dot="#db2777" name="csc θ" value={cscT} color="#db2777" exact={exactVals?.csc} hovered={hoveredFn === 'csc'} onMouseEnter={() => setHoveredFn('csc')} onMouseLeave={() => setHoveredFn(null)} />
      </div>
    </div>
  );
}
