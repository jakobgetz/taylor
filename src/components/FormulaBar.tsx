import { useState, useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import type { TaylorFunction } from '../data/functions';
import { N_MAX } from '../data/functions';
import './FormulaBar.css';

interface Props {
  functions: TaylorFunction[];
  selected: TaylorFunction;
  onSelectFunction: (fn: TaylorFunction) => void;
  termRange: [number, number] | null;
  onSelectTermRange: (range: [number, number] | null) => void;
  numTerms: number;
  onNumTermsChange: (n: number) => void;
}

function renderLatex(latex: string): string {
  return katex.renderToString(latex, { throwOnError: false, output: 'html' });
}

export function FormulaBar({
  functions,
  selected,
  onSelectFunction,
  termRange,
  onSelectTermRange,
  numTerms,
  onNumTermsChange,
}: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleTermClick = (termIndex: number, e: React.MouseEvent) => {
    if (e.shiftKey && termRange !== null) {
      // Extend the range: anchor stays at termRange[0], stretch to new index
      const anchor = termRange[0];
      const lo = Math.min(anchor, termIndex);
      const hi = Math.max(anchor, termIndex);
      onSelectTermRange([lo, hi]);
    } else {
      // Single click: toggle selection of this term
      const isSingle = termRange !== null && termRange[0] === termIndex && termRange[1] === termIndex;
      onSelectTermRange(isSingle ? null : [termIndex, termIndex]);
    }
  };

  const visibleTerms = selected.terms.slice(0, numTerms);
  const maxTerms = Math.min(N_MAX, selected.terms.length);

  return (
    <div className="formula-bar">
      {/* ── Field 1: function name + dropdown ── */}
      <div className="formula-field formula-field--name" ref={dropdownRef}>
        <button
          className={`fn-button ${dropdownOpen ? 'fn-button--open' : ''}`}
          onClick={() => setDropdownOpen((o) => !o)}
          title="Choose a function"
        >
          <span
            dangerouslySetInnerHTML={{
              __html: renderLatex(selected.nameLatex),
            }}
          />
          <span className="fn-arrow">{dropdownOpen ? '▴' : '▾'}</span>
        </button>

        {dropdownOpen && (
          <div className="fn-dropdown">
            {functions.map((fn) => (
              <button
                key={fn.id}
                className={`fn-option ${fn.id === selected.id ? 'fn-option--active' : ''}`}
                onClick={() => {
                  onSelectFunction(fn);
                  setDropdownOpen(false);
                }}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: renderLatex(fn.nameLatex),
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="formula-divider" />

      {/* ── Field 2: sigma notation — click to reset selection ── */}
      <div className="formula-field formula-field--short">
        <button
          className={`short-form-btn ${termRange === null ? 'short-form-btn--active' : ''}`}
          onClick={() => onSelectTermRange(null)}
          title="Show full Taylor series"
        >
          <span
            dangerouslySetInnerHTML={{
              __html: renderLatex(selected.shortFormLatex),
            }}
          />
        </button>
      </div>

      <div className="formula-divider" />

      {/* ── Field 3: expanded long form with range selection ── */}
      <div className="formula-field formula-field--long">
        <div className="long-form">
          {visibleTerms.map((term, i) => {
            const inRange =
              termRange !== null &&
              term.index >= termRange[0] &&
              term.index <= termRange[1];
            const isRangeStart = termRange !== null && term.index === termRange[0];
            const isSingle =
              termRange !== null &&
              termRange[0] === termRange[1] &&
              term.index === termRange[0];
            const isFirst = i === 0;
            const isLast = i === visibleTerms.length - 1;

            const sign = i === 0 ? null : (term.sign === '+' ? '+' : '−');

            return (
              <button
                key={term.index}
                className={[
                  'term-chip',
                  isFirst ? 'term-chip--first' : '',
                  isLast ? 'term-chip--last' : '',
                  inRange ? 'term-chip--in-range' : '',
                  isSingle ? 'term-chip--selected' : '',
                  isRangeStart && !isSingle ? 'term-chip--range-start' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={(e) => handleTermClick(term.index, e)}
                title={
                  termRange === null
                    ? 'Click to isolate · Shift+click to start range'
                    : 'Click to reset · Shift+click to extend range'
                }
              >
                {sign && <span className="term-chip-sign">{sign}</span>}
                <span
                  dangerouslySetInnerHTML={{
                    __html: renderLatex(term.latex),
                  }}
                />
              </button>
            );
          })}
          <span className="ellipsis">&thinsp;+&thinsp;&hellip;</span>
        </div>
      </div>

      <div className="formula-divider" />

      {/* ── Field 4: numTerms stepper ── */}
      <div className="formula-field formula-field--stepper">
        <span className="stepper-label">Terms</span>
        <div className="stepper">
          <button
            className="stepper-btn"
            onClick={() => onNumTermsChange(numTerms - 1)}
            disabled={numTerms <= 1}
            aria-label="Fewer terms"
          >
            −
          </button>
          <span className="stepper-value">{numTerms}</span>
          <button
            className="stepper-btn"
            onClick={() => onNumTermsChange(numTerms + 1)}
            disabled={numTerms >= maxTerms}
            aria-label="More terms"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
