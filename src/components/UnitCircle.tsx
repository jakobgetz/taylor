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

function getExactRadians(displayTheta: number): string | null {
  for (const [val, label] of SPECIAL_ANGLES) {
    if (Math.abs(displayTheta - val) < 0.02) return label;
  }
  return null;
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
}

function FnRow({ dot, name, value, color }: FnRowProps) {
  const undef = isUndef(value);
  const barWidth = undef ? 0 : Math.min(1, Math.abs(value) / 5);
  return (
    <div className="uc-fn-row">
      <div className="uc-fn-main">
        <div className="uc-fn-dot" style={{ background: dot }} />
        <span className="uc-fn-name" dangerouslySetInnerHTML={{ __html: name }} />
        <span className="uc-fn-eq">=</span>
        <span className={`uc-fn-val${undef ? ' uc-fn-val--undef' : ''}`}>
          {fmtVal(value)}
        </span>
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

  // SVG coords for point P
  const px = toSvgX(cosT);
  const py = toSvgY(sinT);

  // Angle arc
  const arcR = 30;
  const sx0 = CX + arcR;
  const sy0 = CY;
  const sx1 = CX + arcR * Math.cos(theta);
  const sy1 = CY - arcR * Math.sin(theta);
  const largeArc = Math.abs(theta) > Math.PI ? 1 : 0;
  const sweep = theta >= 0 ? 1 : 0;
  const showArc = Math.abs(theta) > 0.02;

  // Theta label position
  const thetaLabelDist = 0.35 * R;
  const thetaMid = theta / 2;
  const thetaLabelX = CX + thetaLabelDist * Math.cos(thetaMid);
  const thetaLabelY = CY - thetaLabelDist * Math.sin(thetaMid);

  // Angle display
  const displayTheta = ((theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const degrees = (displayTheta * 180 / Math.PI).toFixed(1);
  const exactRad = getExactRadians(displayTheta);
  const radians = exactRad ?? displayTheta.toFixed(4);

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

          {/* Angle arc */}
          {showArc && (
            <path
              d={`M ${sx0} ${sy0} A ${arcR} ${arcR} 0 ${largeArc} ${sweep} ${sx1} ${sy1}`}
              fill="none"
              stroke="#475569"
              strokeWidth={1.5}
            />
          )}

          {/* θ label */}
          {showArc ? (
            <text
              x={thetaLabelX}
              y={thetaLabelY}
              fontSize={13}
              fontStyle="italic"
              fill="#475569"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ userSelect: "none", pointerEvents: "none" }}
            >θ</text>
          ) : (
            <text
              x={255} y={225}
              fontSize={13}
              fontStyle="italic"
              fill="#475569"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ userSelect: "none", pointerEvents: "none" }}
            >θ</text>
          )}

          {/* sec line: (0,0) to (1, tanT) */}
          {showTan && (
            <line
              x1={CX} y1={CY}
              x2={toSvgX(1)} y2={toSvgY(tanT)}
              stroke="#059669" strokeWidth={1.5} strokeDasharray="5 3"
            />
          )}

          {/* csc line: (0,0) to (cotT, 1) */}
          {showCot && (
            <line
              x1={CX} y1={CY}
              x2={toSvgX(cotT)} y2={toSvgY(1)}
              stroke="#db2777" strokeWidth={1.5} strokeDasharray="5 3"
            />
          )}

          {/* cos segment: (0,0) to (cosT, 0) */}
          <line
            x1={CX} y1={CY}
            x2={toSvgX(cosT)} y2={CY}
            stroke="#2563eb" strokeWidth={2.5}
          />
          <text
            x={(CX + toSvgX(cosT)) / 2}
            y={CY + 14}
            fontSize={11}
            fill="#2563eb"
            textAnchor="middle"
            style={{ userSelect: "none", pointerEvents: "none" }}
          >cos θ</text>

          {/* sin segment: (cosT, 0) to (cosT, sinT) */}
          <line
            x1={toSvgX(cosT)} y1={CY}
            x2={toSvgX(cosT)} y2={toSvgY(sinT)}
            stroke="#dc2626" strokeWidth={2.5}
          />
          <text
            x={toSvgX(cosT) + (cosT >= 0 ? 14 : -14)}
            y={(CY + toSvgY(sinT)) / 2}
            fontSize={11}
            fill="#dc2626"
            textAnchor={cosT >= 0 ? 'start' : 'end'}
            dominantBaseline="middle"
            style={{ userSelect: "none", pointerEvents: "none" }}
          >sin θ</text>

          {/* tan segment: (1, 0) to (1, tanT) */}
          {showTan && (
            <>
              <line
                x1={toSvgX(1)} y1={CY}
                x2={toSvgX(1)} y2={toSvgY(tanT)}
                stroke="#d97706" strokeWidth={2}
              />
              <text
                x={toSvgX(1) + 12}
                y={(CY + toSvgY(tanT)) / 2}
                fontSize={11}
                fill="#d97706"
                textAnchor="start"
                dominantBaseline="middle"
                style={{ userSelect: "none", pointerEvents: "none" }}
              >tan θ</text>
            </>
          )}

          {/* cot segment: (0,1) to (cotT, 1) */}
          {showCot && (
            <>
              <line
                x1={CX} y1={toSvgY(1)}
                x2={toSvgX(cotT)} y2={toSvgY(1)}
                stroke="#7c3aed" strokeWidth={2}
              />
              <text
                x={(CX + toSvgX(cotT)) / 2}
                y={toSvgY(1) + (sinT >= 0 ? -10 : 14)}
                fontSize={11}
                fill="#7c3aed"
                textAnchor="middle"
                style={{ userSelect: "none", pointerEvents: "none" }}
              >cot θ</text>
            </>
          )}

          {/* Radius OP */}
          <line
            x1={CX} y1={CY}
            x2={px} y2={py}
            stroke="#64748b" strokeWidth={1}
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
          <div className="uc-angle-deg">
            θ = {degrees}<span>°</span>
          </div>
          <div className="uc-angle-rad">{radians} rad</div>
        </div>

        <FnRow dot="#dc2626" name="sin&thinsp;θ" value={sinT} color="#dc2626" />
        <FnRow dot="#2563eb" name="cos&thinsp;θ" value={cosT} color="#2563eb" />
        <FnRow dot="#d97706" name="tan&thinsp;θ" value={tanT} color="#d97706" />
        <FnRow dot="#7c3aed" name="cot&thinsp;θ" value={cotT} color="#7c3aed" />
        <FnRow dot="#059669" name="sec&thinsp;θ" value={secT} color="#059669" />
        <FnRow dot="#db2777" name="csc&thinsp;θ" value={cscT} color="#db2777" />
      </div>
    </div>
  );
}
