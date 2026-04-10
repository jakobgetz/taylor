import { useState, useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import type { TaylorFunction } from './data/functions';
import { FUNCTIONS, N_MAX } from './data/functions';
import { FOURIER_FUNCTIONS } from './data/fourier-functions';
import { FormulaBar } from './components/FormulaBar';
import { CoordinateSystem } from './components/CoordinateSystem';
import { UnitCircle } from './components/UnitCircle';
import { Mathematicians } from './components/Mathematicians';
import './App.css';

const DEFAULT_NUM_TERMS = 8;

const TAYLOR_FORMULA = katex.renderToString(
  'f(x) = \\displaystyle\\sum_{n=0}^{\\infty} \\dfrac{f^{(n)}(a)}{n!}\\,(x-a)^n',
  { throwOnError: false, output: 'html' }
);

const FOURIER_FORMULA = katex.renderToString(
  'f(x) = \\dfrac{a_0}{2} + \\displaystyle\\sum_{n=1}^{\\infty}\\bigl[a_n\\cos(nx)+b_n\\sin(nx)\\bigr]',
  { throwOnError: false, output: 'html' }
);

export default function App() {
  const [mode, setMode] = useState<'taylor' | 'fourier' | 'geometric' | 'mathematicians'>('taylor');
  const [modeOpen, setModeOpen] = useState(false);
  const modeRef = useRef<HTMLDivElement>(null);
  const [selectedFn, setSelectedFn] = useState<TaylorFunction>(FUNCTIONS[0]);
  const [termRange, setTermRange] = useState<[number, number] | null>(null);
  const [numTerms, setNumTerms] = useState(DEFAULT_NUM_TERMS);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modeRef.current && !modeRef.current.contains(e.target as Node)) {
        setModeOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleModeChange = (newMode: 'taylor' | 'fourier' | 'geometric' | 'mathematicians') => {
    setMode(newMode);
    if (newMode !== 'geometric' && newMode !== 'mathematicians') {
      setSelectedFn(newMode === 'taylor' ? FUNCTIONS[0] : FOURIER_FUNCTIONS[0]);
    }
    setTermRange(null);
    setNumTerms(DEFAULT_NUM_TERMS);
    setModeOpen(false);
  };

  const currentFunctions = mode === 'taylor' ? FUNCTIONS : FOURIER_FUNCTIONS;

  const handleSelectFunction = (fn: TaylorFunction) => {
    setSelectedFn(fn);
    setTermRange(null);
  };

  const handleNumTermsChange = (n: number) => {
    const maxFn = selectedFn.terms.length;
    const clamped = Math.max(1, Math.min(Math.min(N_MAX, maxFn), n));
    setNumTerms(clamped);
    if (termRange && (termRange[0] >= clamped || termRange[1] >= clamped)) {
      setTermRange(null);
    }
  };

  const formula = mode === 'taylor' ? TAYLOR_FORMULA : FOURIER_FORMULA;
  const note = mode === 'taylor'
    ? 'all examples use a\u00a0=\u00a00 (Maclaurin series)'
    : 'all examples use period 2\u03C0';
  const seriesLabel = mode === 'taylor' ? 'Taylor' : 'Fourier';
  const modeTitle = mode === 'taylor' ? 'Taylor Series Explorer'
    : mode === 'fourier' ? 'Fourier Series Explorer'
    : mode === 'geometric' ? 'Geometric Functions'
    : 'Mathematicians';

  return (
    <div className="app">
      <header className="app-header">
        <div className="mode-selector" ref={modeRef}>
          <button
            className={`mode-btn ${modeOpen ? 'mode-btn--open' : ''}`}
            onClick={() => setModeOpen(o => !o)}
          >
            {modeTitle}
            <span className="mode-arrow">{modeOpen ? '▴' : '▾'}</span>
          </button>
          {modeOpen && (
            <div className="mode-dropdown">
              <button
                className={`mode-option ${mode === 'taylor' ? 'mode-option--active' : ''}`}
                onClick={() => handleModeChange('taylor')}
              >Taylor Series</button>
              <button
                className={`mode-option ${mode === 'fourier' ? 'mode-option--active' : ''}`}
                onClick={() => handleModeChange('fourier')}
              >Fourier Series</button>
              <button
                className={`mode-option ${mode === 'geometric' ? 'mode-option--active' : ''}`}
                onClick={() => handleModeChange('geometric')}
              >Geometric Functions</button>
              <button
                className={`mode-option ${mode === 'mathematicians' ? 'mode-option--active' : ''}`}
                onClick={() => handleModeChange('mathematicians')}
              >Mathematicians</button>
            </div>
          )}
        </div>
        {mode !== 'geometric' && mode !== 'mathematicians' && (
          <>
            <span className="app-fn-label">{selectedFn.label}</span>
            <span className="app-general-formula" dangerouslySetInnerHTML={{ __html: formula }} />
            <span className="app-maclaurin-note">{note}</span>
          </>
        )}
        {mode === 'geometric' && (
          <span className="app-geo-subtitle">Drag the point · explore the unit circle</span>
        )}
        {mode === 'mathematicians' && (
          <span className="app-geo-subtitle">↑ ↓ arrow keys to navigate · click to explore</span>
        )}
      </header>

      {mode === 'geometric' ? (
        <UnitCircle />
      ) : mode === 'mathematicians' ? (
        <Mathematicians />
      ) : (
        <>
          <FormulaBar
            functions={currentFunctions}
            selected={selectedFn}
            onSelectFunction={handleSelectFunction}
            termRange={termRange}
            onSelectTermRange={setTermRange}
            numTerms={numTerms}
            onNumTermsChange={handleNumTermsChange}
          />

          <CoordinateSystem
            fn={selectedFn}
            termRange={termRange}
            numTerms={numTerms}
            seriesLabel={seriesLabel}
          />
        </>
      )}
    </div>
  );
}
