import { useState } from 'react';
import type { TaylorFunction } from './data/functions';
import { FUNCTIONS, N_MAX } from './data/functions';
import { FormulaBar } from './components/FormulaBar';
import { CoordinateSystem } from './components/CoordinateSystem';
import './App.css';

const DEFAULT_NUM_TERMS = 8;

export default function App() {
  const [selectedFn, setSelectedFn] = useState<TaylorFunction>(FUNCTIONS[0]);
  const [termRange, setTermRange] = useState<[number, number] | null>(null);
  const [numTerms, setNumTerms] = useState(DEFAULT_NUM_TERMS);

  const handleSelectFunction = (fn: TaylorFunction) => {
    setSelectedFn(fn);
    setTermRange(null);
  };

  const handleNumTermsChange = (n: number) => {
    const clamped = Math.max(1, Math.min(Math.min(N_MAX, selectedFn.terms.length), n));
    setNumTerms(clamped);
    // Reset range if it references terms no longer visible
    if (termRange && (termRange[0] >= clamped || termRange[1] >= clamped)) {
      setTermRange(null);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-title">Taylor Series Explorer</span>
        <span className="app-sub">
          Click a term to isolate it&ensp;·&ensp;Shift+click to extend range&ensp;·&ensp;Click <em>Σ</em> to show all
        </span>
      </header>

      <FormulaBar
        functions={FUNCTIONS}
        selected={selectedFn}
        onSelectFunction={handleSelectFunction}
        termRange={termRange}
        onSelectTermRange={setTermRange}
        numTerms={numTerms}
        onNumTermsChange={handleNumTermsChange}
      />

      <CoordinateSystem fn={selectedFn} termRange={termRange} numTerms={numTerms} />
    </div>
  );
}
