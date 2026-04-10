import { useState } from 'react';
import { FUNCTIONS, TaylorFunction, Term } from './data/functions';
import { FormulaBar } from './components/FormulaBar';
import { CoordinateSystem } from './components/CoordinateSystem';
import './App.css';

export default function App() {
  const [selectedFn, setSelectedFn] = useState<TaylorFunction>(FUNCTIONS[0]);
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);

  const handleSelectFunction = (fn: TaylorFunction) => {
    setSelectedFn(fn);
    setSelectedTerm(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-title">Taylor Series Explorer</span>
        <span className="app-sub">
          Click a term in the series to isolate it in the plot
        </span>
      </header>

      <FormulaBar
        functions={FUNCTIONS}
        selected={selectedFn}
        onSelectFunction={handleSelectFunction}
        selectedTerm={selectedTerm}
        onSelectTerm={setSelectedTerm}
      />

      <CoordinateSystem fn={selectedFn} selectedTerm={selectedTerm} />
    </div>
  );
}
