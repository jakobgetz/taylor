import { useState, useMemo, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { CATEGORIES } from '../data/cheatsheet';
import type { Category, Formula } from '../data/cheatsheet';
import './Cheatsheet.css';

function renderLatex(latex: string): string {
  return katex.renderToString(latex, { throwOnError: false, output: 'html', displayMode: false });
}

function FormulaCard({ formula, color }: { formula: Formula; color: string }) {
  return (
    <div className="cs-formula-card" style={{ '--cs-color': color } as React.CSSProperties}>
      <div className="cs-formula-name">{formula.name}</div>
      <div
        className="cs-formula-math"
        dangerouslySetInnerHTML={{ __html: renderLatex(formula.latex) }}
      />
      {formula.note && <div className="cs-formula-note">{formula.note}</div>}
    </div>
  );
}

function CategorySection({ cat, searchQuery }: { cat: Category; searchQuery: string }) {
  const filtered = useMemo(() => {
    if (!searchQuery) return cat.formulas;
    const q = searchQuery.toLowerCase();
    return cat.formulas.filter(f =>
      f.name.toLowerCase().includes(q) || f.note?.toLowerCase().includes(q)
    );
  }, [cat.formulas, searchQuery]);

  if (filtered.length === 0) return null;

  return (
    <section className="cs-category" id={`cat-${cat.id}`}>
      <div className="cs-category-header" style={{ '--cs-color': cat.color } as React.CSSProperties}>
        <span className="cs-category-icon">{cat.icon}</span>
        <h2 className="cs-category-title">{cat.title}</h2>
        <span className="cs-category-count">{filtered.length}</span>
      </div>
      <div className="cs-formula-grid">
        {filtered.map(f => (
          <FormulaCard key={f.name} formula={f} color={cat.color} />
        ))}
      </div>
    </section>
  );
}

export function Cheatsheet() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const searchQuery = search.trim();

  const visibleCategories = useMemo(() => {
    if (activeFilter) return CATEGORIES.filter(c => c.id === activeFilter);
    if (!searchQuery) return CATEGORIES;
    return CATEGORIES.filter(cat =>
      cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.formulas.some(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.note?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [activeFilter, searchQuery]);

  const totalFormulas = useMemo(() =>
    visibleCategories.reduce((sum, c) => {
      if (!searchQuery) return sum + c.formulas.length;
      return sum + c.formulas.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.note?.toLowerCase().includes(searchQuery.toLowerCase())
      ).length;
    }, 0)
  , [visibleCategories, searchQuery]);

  const scrollToCategory = (id: string) => {
    setActiveFilter(null);
    setTimeout(() => {
      const el = document.getElementById(`cat-${id}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <div className="cs-root">
      <aside className="cs-sidebar">
        <div className="cs-sidebar-inner">
          <div className="cs-search-wrap">
            <input
              className="cs-search"
              type="text"
              placeholder="Search formulas…"
              value={search}
              onChange={e => { setSearch(e.target.value); setActiveFilter(null); }}
            />
            {search && (
              <button className="cs-search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
          <nav className="cs-nav">
            <button
              className={`cs-nav-all ${!activeFilter ? 'cs-nav-all--active' : ''}`}
              onClick={() => { setActiveFilter(null); setSearch(''); mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              All ({CATEGORIES.reduce((s, c) => s + c.formulas.length, 0)})
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`cs-nav-item ${activeFilter === cat.id ? 'cs-nav-item--active' : ''}`}
                style={{ '--cs-color': cat.color } as React.CSSProperties}
                onClick={() => {
                  if (search) { setSearch(''); setActiveFilter(cat.id); }
                  else if (activeFilter === cat.id) { setActiveFilter(null); }
                  else { scrollToCategory(cat.id); }
                }}
              >
                <span className="cs-nav-icon">{cat.icon}</span>
                <span className="cs-nav-label">{cat.title}</span>
                <span className="cs-nav-badge">{cat.formulas.length}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <main className="cs-main" ref={mainRef}>
        {searchQuery && (
          <div className="cs-search-summary">
            {totalFormulas === 0
              ? `No formulas match "${searchQuery}"`
              : `${totalFormulas} formula${totalFormulas !== 1 ? 's' : ''} matching "${searchQuery}"`}
          </div>
        )}
        {visibleCategories.length === 0 ? (
          <div className="cs-empty">
            <span>🔍</span>
            <p>No results found for <strong>"{searchQuery}"</strong></p>
            <button onClick={() => setSearch('')}>Clear search</button>
          </div>
        ) : (
          visibleCategories.map(cat => (
            <CategorySection key={cat.id} cat={cat} searchQuery={searchQuery} />
          ))
        )}
      </main>
    </div>
  );
}
