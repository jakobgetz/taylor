import { useState, useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { TaylorFunction, Term } from '../data/functions';
import './FormulaBar.css';

interface Props {
  functions: TaylorFunction[];
  selected: TaylorFunction;
  onSelectFunction: (fn: TaylorFunction) => void;
  selectedTerm: Term | null;
  onSelectTerm: (term: Term | null) => void;
}

function renderLatex(latex: string): string {
  return katex.renderToString(latex, { throwOnError: false, output: 'html' });
}

export function FormulaBar({
  functions,
  selected,
  onSelectFunction,
  selectedTerm,
  onSelectTerm,
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

  const handleTermClick = (term: Term) => {
    onSelectTerm(selectedTerm?.index === term.index ? null : term);
  };

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

      {/* ── Field 2: sigma notation ── */}
      <div className="formula-field formula-field--short">
        <span
          className="short-form"
          dangerouslySetInnerHTML={{
            __html: renderLatex(selected.shortFormLatex),
          }}
        />
      </div>

      <div className="formula-divider" />

      {/* ── Field 3: expanded long form ── */}
      <div className="formula-field formula-field--long">
        <div className="long-form">
          {selected.terms.map((term, i) => {
            const isSelected = selectedTerm?.index === term.index;
            return (
              <span key={term.index} className="term-group">
                {/* sign between terms (not part of the clickable chip) */}
                {i > 0 && (
                  <span className="term-operator">
                    {term.sign === '+' ? '+' : '−'}
                  </span>
                )}

                <button
                  className={`term-chip ${isSelected ? 'term-chip--selected' : ''}`}
                  onClick={() => handleTermClick(term)}
                  title={`Show only term ${i}`}
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: renderLatex(term.latex),
                    }}
                  />
                </button>
              </span>
            );
          })}
          <span className="ellipsis">&thinsp;+&thinsp;&hellip;</span>
        </div>
      </div>
    </div>
  );
}
