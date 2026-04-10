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
  { year: -400, y: 40 },
  { year:  1000, y: 320 },
  { year:  1600, y: 560 },
  { year:  1970, y: 1600 },
] as const;

const TOTAL_HEIGHT = 1660;

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

const YEAR_TICKS = [-300, -200, -100, 0, 500, 1000, 1200, 1400, 1500, 1600, 1650, 1700, 1750, 1800, 1850, 1900, 1950];

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
    const y = yearToY(selected.birth);
    const el = timelineRef.current;
    el.scrollTo({ top: y - el.clientHeight / 2, behavior: 'smooth' });
    setExpandedContrib(null);
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard navigation: up/down arrows move through mathematicians
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const sorted = [...MATHEMATICIANS].sort((a, b) => a.birth - b.birth);
      const idx = sorted.findIndex(m => m.id === selectedId);
      if (e.key === 'ArrowDown' && idx < sorted.length - 1) setSelectedId(sorted[idx + 1].id);
      if (e.key === 'ArrowUp' && idx > 0) setSelectedId(sorted[idx - 1].id);
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
          <div className="math-timeline-inner" style={{ height: TOTAL_HEIGHT + 80 }}>

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

            {/* Center dot for each mathematician */}
            {MATHEMATICIANS.map(m => (
              <div
                key={`dot-${m.id}`}
                className="math-center-dot"
                style={{
                  top: yearToY(m.birth),
                  background: isVisible(m) ? FIELD_COLORS[m.fields[0]] : '#e2e8f0',
                }}
              />
            ))}

            {/* Mathematician cards */}
            {MATHEMATICIANS.map((m, i) => {
              const isLeft = i % 2 === 0;
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
                    top: yearToY(m.birth),
                    opacity: visible ? 1 : 0.1,
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
