import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import type { Mathematician, Field } from '../data/mathematicians';
import {
  MATHEMATICIANS,
  FIELD_COLORS,
  ERA_COLORS,
  ERA_TEXT_COLORS,
  ERA_BAND_DATA,
  ALL_FIELDS,
} from '../data/mathematicians';
import './Mathematicians.css';

// ─── Piecewise year → pixel mapping ───────────────────────────────────────────
const BREAKPOINTS = [
  { year: -600, y: 20 },
  { year: -400, y: 60 },
  { year:  1000, y: 340 },
  { year:  1600, y: 580 },
  { year:  2020, y: 1700 },
] as const;

const TOTAL_HEIGHT = 1760;

function yearToY(year: number): number {
  for (let i = 0; i < BREAKPOINTS.length - 1; i++) {
    const a = BREAKPOINTS[i], b = BREAKPOINTS[i + 1];
    if (year >= a.year && year <= b.year) {
      const t = (year - a.year) / (b.year - a.year);
      return a.y + t * (b.y - a.y);
    }
  }
  return year < BREAKPOINTS[0].year ? BREAKPOINTS[0].y : BREAKPOINTS[BREAKPOINTS.length - 1].y;
}

function formatYear(year: number): string {
  return year < 0 ? `${Math.abs(year)} BC` : `${year}`;
}

function formatLifespan(m: Mathematician): string {
  const d = m.death ? formatYear(m.death) : '?';
  return `${formatYear(m.birth)} – ${d}`;
}

const YEAR_TICKS = [-500, -300, -100, 0, 500, 1000, 1200, 1400, 1500, 1600, 1650, 1700, 1750, 1800, 1850, 1900, 1950, 2000];

// ─── Static layout computation ────────────────────────────────────────────────
const CARD_H = 70;   // estimated card height + gap
const CARD_GAP = 8;
const LANE_W = 5;
const LANE_GAP = 1;

const SORTED = [...MATHEMATICIANS].sort((a, b) => a.birth - b.birth);

// Non-overlapping card positions: alternate left/right in birth-year order,
// push down if previous card on same side would overlap.
const CARD_LAYOUT: Map<string, { y: number; side: 'left' | 'right' }> = (() => {
  const map = new Map<string, { y: number; side: 'left' | 'right' }>();
  let bottomL = -Infinity;
  let bottomR = -Infinity;
  SORTED.forEach((m, i) => {
    const naturalY = yearToY(m.birth) - CARD_H / 2;
    const side: 'left' | 'right' = i % 2 === 0 ? 'left' : 'right';
    let y: number;
    if (side === 'left') {
      y = Math.max(naturalY, bottomL + CARD_GAP);
      bottomL = y + CARD_H;
    } else {
      y = Math.max(naturalY, bottomR + CARD_GAP);
      bottomR = y + CARD_H;
    }
    map.set(m.id, { y, side });
  });
  return map;
})();

// Lifespan lane assignment: greedy interval scheduling
const { LANE_MAP, NUM_LANES } = (() => {
  const laneEnd: number[] = [];
  const map = new Map<string, number>();
  for (const m of SORTED) {
    const death = m.death ?? m.birth + 80;
    let lane = laneEnd.findIndex(e => e <= m.birth);
    if (lane === -1) { lane = laneEnd.length; laneEnd.push(death); }
    else { laneEnd[lane] = death; }
    map.set(m.id, lane);
  }
  return { LANE_MAP: map, NUM_LANES: laneEnd.length };
})();

// Total canvas height needed (cards may extend beyond TOTAL_HEIGHT)
const CANVAS_H = (() => {
  let max = TOTAL_HEIGHT;
  for (const { y } of CARD_LAYOUT.values()) max = Math.max(max, y + CARD_H);
  return max + 100;
})();

// Half-width of the lifespan bar cluster
const BARS_HALF_W = Math.ceil(NUM_LANES / 2) * (LANE_W + LANE_GAP);
// Card offset from center (leave room for bars + gap)
const CARD_OFFSET = BARS_HALF_W + 18;

// ─── Portrait URL helper ───────────────────────────────────────────────────────
function portraitUrl(filename: string, width = 200): string {
  return `https://en.wikipedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=${width}`;
}

// ─── Portrait component with fallback ─────────────────────────────────────────
interface PortraitProps {
  m: Mathematician;
  size: number;
  className?: string;
}

function Portrait({ m, size, className = '' }: PortraitProps) {
  const [failed, setFailed] = useState(false);
  const color = FIELD_COLORS[m.fields[0]];
  return failed ? (
    <div
      className={`math-portrait-fallback ${className}`}
      style={{ width: size, height: size, background: color, fontSize: size * 0.4 }}
    >
      {m.name.charAt(0)}
    </div>
  ) : (
    <img
      className={`math-portrait-img ${className}`}
      src={portraitUrl(m.portraitFile, size * 2)}
      alt={m.name}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function Mathematicians() {
  const [selectedId, setSelectedId] = useState<string>('euler');
  const [activeFields, setActiveFields] = useState<Set<Field>>(new Set());
  const [search, setSearch] = useState('');
  const [expandedContrib, setExpandedContrib] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => MATHEMATICIANS.find(m => m.id === selectedId) ?? null,
    [selectedId]
  );

  const isVisible = useCallback(
    (m: Mathematician) => {
      const matchField = activeFields.size === 0 || m.fields.some(f => activeFields.has(f));
      const matchSearch = search === '' || m.name.toLowerCase().includes(search.toLowerCase());
      return matchField && matchSearch;
    },
    [activeFields, search]
  );

  const toggleField = (f: Field) => {
    setActiveFields(prev => {
      const next = new Set(prev);
      next.has(f) ? next.delete(f) : next.add(f);
      return next;
    });
  };

  // Auto-scroll timeline to selected mathematician
  useEffect(() => {
    if (!selected || !timelineRef.current) return;
    const pos = CARD_LAYOUT.get(selected.id);
    const y = pos ? pos.y : yearToY(selected.birth);
    const el = timelineRef.current;
    el.scrollTo({ top: y - el.clientHeight / 2 + CARD_H / 2, behavior: 'smooth' });
    setExpandedContrib(null);
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const idx = SORTED.findIndex(m => m.id === selectedId);
      if (e.key === 'ArrowDown' && idx < SORTED.length - 1) setSelectedId(SORTED[idx + 1].id);
      if (e.key === 'ArrowUp' && idx > 0) setSelectedId(SORTED[idx - 1].id);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedId]);

  return (
    <div className="math-page">
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="math-toolbar">
        <input
          type="search"
          className="math-search"
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="math-field-filters">
          {ALL_FIELDS.filter(f => MATHEMATICIANS.some(m => m.fields.includes(f))).map(f => (
            <button
              key={f}
              className={`math-field-btn${activeFields.has(f) ? ' active' : ''}`}
              style={
                activeFields.has(f)
                  ? { background: FIELD_COLORS[f], borderColor: FIELD_COLORS[f], color: '#fff' }
                  : { borderColor: FIELD_COLORS[f], color: FIELD_COLORS[f] }
              }
              onClick={() => toggleField(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main layout ──────────────────────────────────────────── */}
      <div className="math-layout">

        {/* ── Timeline ─────────────────────────────────────────── */}
        <div className="math-timeline-scroll" ref={timelineRef}>
          <div className="math-timeline-inner" style={{ height: CANVAS_H }}>

            {/* Era background bands */}
            {ERA_BAND_DATA.map(band => {
              const top = yearToY(band.startYear);
              const height = yearToY(band.endYear) - top;
              return (
                <div
                  key={band.era}
                  className="math-era-band"
                  style={{ top, height, background: ERA_COLORS[band.era] }}
                >
                  <span
                    className="math-era-band-label"
                    style={{ color: ERA_TEXT_COLORS[band.era] }}
                  >
                    {band.era}
                  </span>
                </div>
              );
            })}

            {/* Center line */}
            <div className="math-center-line" />

            {/* Year tick marks */}
            {YEAR_TICKS.map(yr => (
              <div key={yr} className="math-tick" style={{ top: yearToY(yr) }}>
                <span className="math-tick-label">{formatYear(yr)}</span>
              </div>
            ))}

            {/* ── Lifespan bars ── */}
            {SORTED.map(m => {
              const lane = LANE_MAP.get(m.id) ?? 0;
              const topY = yearToY(m.birth);
              const botY = yearToY(m.death ?? m.birth + 80);
              // Center bars symmetrically around 50%
              const offset = (lane - (NUM_LANES - 1) / 2) * (LANE_W + LANE_GAP);
              const visible = isVisible(m);
              const isSelected = m.id === selectedId;
              return (
                <div
                  key={`bar-${m.id}`}
                  className={`math-lifespan-bar${isSelected ? ' math-lifespan-bar--selected' : ''}`}
                  style={{
                    top: topY,
                    height: Math.max(botY - topY, 4),
                    left: `calc(50% + ${offset}px)`,
                    width: LANE_W,
                    background: FIELD_COLORS[m.fields[0]],
                    opacity: visible ? (isSelected ? 1 : 0.65) : 0.08,
                  }}
                  onClick={() => setSelectedId(m.id)}
                  title={`${m.name} (${formatYear(m.birth)}–${m.death ? formatYear(m.death) : '?'})`}
                />
              );
            })}

            {/* Mathematician cards */}
            {SORTED.map(m => {
              const pos = CARD_LAYOUT.get(m.id)!;
              const isLeft = pos.side === 'left';
              const visible = isVisible(m);
              const isSelected = m.id === selectedId;

              return (
                <button
                  key={m.id}
                  className={[
                    'math-card',
                    isLeft ? 'math-card--left' : 'math-card--right',
                    isSelected ? 'math-card--selected' : '',
                  ].join(' ')}
                  style={{
                    top: pos.y,
                    [isLeft ? 'right' : 'left']: `calc(50% + ${CARD_OFFSET}px)`,
                    opacity: visible ? 1 : 0.08,
                    pointerEvents: visible ? 'auto' : 'none',
                    '--card-color': FIELD_COLORS[m.fields[0]],
                  } as React.CSSProperties}
                  onClick={() => setSelectedId(m.id)}
                  tabIndex={visible ? 0 : -1}
                >
                  <Portrait m={m} size={40} className="math-card-portrait" />
                  <div className="math-card-info">
                    <div className="math-card-name">{m.name}</div>
                    <div className="math-card-dates">{formatLifespan(m)}</div>
                    <div className="math-card-dots">
                      {m.fields.slice(0, 3).map(f => (
                        <span
                          key={f}
                          className="math-card-dot"
                          style={{ background: FIELD_COLORS[f] }}
                          title={f}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Detail panel ──────────────────────────────────────── */}
        <div className="math-detail-panel">
          {selected ? (
            <DetailPanel
              key={selected.id}
              m={selected}
              expandedContrib={expandedContrib}
              setExpandedContrib={setExpandedContrib}
            />
          ) : (
            <div className="math-detail-empty">
              <p>Select a mathematician to explore their story</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Detail panel ──────────────────────────────────────────────────────────────
interface DetailPanelProps {
  m: Mathematician;
  expandedContrib: string | null;
  setExpandedContrib: (id: string | null) => void;
}

function DetailPanel({ m, expandedContrib, setExpandedContrib }: DetailPanelProps) {
  const lifespan = m.death !== null ? m.death - m.birth : null;

  return (
    <div className="math-detail-content">
      {/* Header */}
      <div className="math-detail-header">
        <Portrait m={m} size={140} className="math-detail-portrait" />

        <div className="math-detail-meta">
          <h2 className="math-detail-name">{m.name}</h2>
          <div className="math-detail-dates">
            {formatLifespan(m)}
            {lifespan !== null && (
              <span className="math-detail-age"> · {lifespan} years</span>
            )}
          </div>
          <div className="math-detail-nationality">📍 {m.nationality}</div>

          <div
            className="math-detail-era-badge"
            style={{ background: ERA_COLORS[m.era], color: ERA_TEXT_COLORS[m.era] }}
          >
            {m.era}
          </div>

          <div className="math-detail-fields">
            {m.fields.map(f => (
              <span
                key={f}
                className="math-detail-field-tag"
                style={{ background: FIELD_COLORS[f] }}
              >
                {f}
              </span>
            ))}
          </div>

          {m.appRelated && (
            <div className="math-detail-app-badge">
              🔗 Featured in this app:{' '}
              {m.appRelated
                .map(r =>
                  r === 'taylor' ? 'Taylor Series'
                  : r === 'fourier' ? 'Fourier Series'
                  : 'Geometric Functions'
                )
                .join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      <p className="math-detail-bio">{m.shortBio}</p>

      {/* Quote */}
      {m.quote && (
        <blockquote className="math-detail-quote">
          "{m.quote}"
        </blockquote>
      )}

      {/* Contributions */}
      <h3 className="math-detail-contribs-title">Key Contributions</h3>
      <p className="math-detail-contribs-hint">Click any contribution to learn more</p>
      <div className="math-detail-contribs">
        {m.contributions.map((c, i) => {
          const cid = `${m.id}-${i}`;
          const isOpen = expandedContrib === cid;
          const color = FIELD_COLORS[m.fields[0]];
          return (
            <div
              key={cid}
              className={`math-contrib${isOpen ? ' math-contrib--open' : ''}`}
              style={{ '--contrib-color': color } as React.CSSProperties}
              onClick={() => setExpandedContrib(isOpen ? null : cid)}
            >
              <div className="math-contrib-header">
                <span className="math-contrib-title">{c.title}</span>
                <div className="math-contrib-right">
                  {c.year !== undefined && (
                    <span className="math-contrib-year">{formatYear(c.year)}</span>
                  )}
                  <span className="math-contrib-chevron">{isOpen ? '▲' : '▼'}</span>
                </div>
              </div>
              {isOpen && (
                <p className="math-contrib-desc">{c.description}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
