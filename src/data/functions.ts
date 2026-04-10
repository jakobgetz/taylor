export interface Term {
  index: number;
  sign: '+' | '-';
  latex: string; // KaTeX string for the term body (no sign)
  compute: (x: number) => number; // returns signed value of this term
}

export interface TaylorFunction {
  id: string;
  name: string;           // plain text label for dropdowns
  nameLatex: string;      // KaTeX for formula bar field 1
  shortFormLatex: string; // KaTeX for formula bar field 2
  terms: Term[];
  exact: (x: number) => number;
  xRange: [number, number];
  yRange: [number, number];
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function pw(x: number, n: number): number {
  return Math.pow(x, n);
}

export const FUNCTIONS: TaylorFunction[] = [
  {
    id: 'cos',
    name: 'cos(x)',
    nameLatex: '\\cos(x)',
    shortFormLatex:
      '\\displaystyle\\sum_{n=0}^{\\infty} \\frac{(-1)^n\\, x^{2n}}{(2n)!}',
    exact: Math.cos,
    xRange: [-2 * Math.PI, 2 * Math.PI],
    yRange: [-2, 2],
    terms: Array.from({ length: 8 }, (_, n) => ({
      index: n,
      sign: (n % 2 === 0 ? '+' : '-') as '+' | '-',
      latex: n === 0 ? '1' : `x^{${2 * n}} / ${2 * n}!`,
      compute: (x: number) => Math.pow(-1, n) * pw(x, 2 * n) / factorial(2 * n),
    })),
  },
  {
    id: 'sin',
    name: 'sin(x)',
    nameLatex: '\\sin(x)',
    shortFormLatex:
      '\\displaystyle\\sum_{n=0}^{\\infty} \\frac{(-1)^n\\, x^{2n+1}}{(2n+1)!}',
    exact: Math.sin,
    xRange: [-2 * Math.PI, 2 * Math.PI],
    yRange: [-2, 2],
    terms: Array.from({ length: 8 }, (_, n) => ({
      index: n,
      sign: (n % 2 === 0 ? '+' : '-') as '+' | '-',
      latex: n === 0 ? 'x' : `x^{${2 * n + 1}} / ${2 * n + 1}!`,
      compute: (x: number) =>
        Math.pow(-1, n) * pw(x, 2 * n + 1) / factorial(2 * n + 1),
    })),
  },
  {
    id: 'exp',
    name: 'eˣ',
    nameLatex: 'e^{x}',
    shortFormLatex:
      '\\displaystyle\\sum_{n=0}^{\\infty} \\frac{x^n}{n!}',
    exact: Math.exp,
    xRange: [-3, 3],
    yRange: [-0.5, 12],
    terms: Array.from({ length: 8 }, (_, n) => ({
      index: n,
      sign: '+' as '+',
      latex: n === 0 ? '1' : n === 1 ? 'x' : `x^{${n}} / ${n}!`,
      compute: (x: number) => pw(x, n) / factorial(n),
    })),
  },
  {
    id: 'ln',
    name: 'ln(1+x)',
    nameLatex: '\\ln(1+x)',
    shortFormLatex:
      '\\displaystyle\\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1}\\, x^n}{n}',
    exact: (x: number) => Math.log(1 + x),
    xRange: [-0.9, 4],
    yRange: [-3, 3],
    terms: Array.from({ length: 8 }, (_, i) => {
      const n = i + 1;
      return {
        index: i,
        sign: (n % 2 === 1 ? '+' : '-') as '+' | '-',
        latex: n === 1 ? 'x' : `x^{${n}} / ${n}`,
        compute: (x: number) => Math.pow(-1, n + 1) * pw(x, n) / n,
      };
    }),
  },
  {
    id: 'geometric',
    name: '1/(1−x)',
    nameLatex: '\\dfrac{1}{1-x}',
    shortFormLatex: '\\displaystyle\\sum_{n=0}^{\\infty} x^n',
    exact: (x: number) => 1 / (1 - x),
    xRange: [-2, 0.95],
    yRange: [-3, 8],
    terms: Array.from({ length: 8 }, (_, n) => ({
      index: n,
      sign: '+' as '+',
      latex: n === 0 ? '1' : n === 1 ? 'x' : `x^{${n}}`,
      compute: (x: number) => pw(x, n),
    })),
  },
  {
    id: 'arctan',
    name: 'arctan(x)',
    nameLatex: '\\arctan(x)',
    shortFormLatex:
      '\\displaystyle\\sum_{n=0}^{\\infty} \\frac{(-1)^n\\, x^{2n+1}}{2n+1}',
    exact: Math.atan,
    xRange: [-4, 4],
    yRange: [-2, 2],
    terms: Array.from({ length: 8 }, (_, n) => ({
      index: n,
      sign: (n % 2 === 0 ? '+' : '-') as '+' | '-',
      latex: n === 0 ? 'x' : `x^{${2 * n + 1}} / ${2 * n + 1}`,
      compute: (x: number) =>
        Math.pow(-1, n) * pw(x, 2 * n + 1) / (2 * n + 1),
    })),
  },
  {
    id: 'sinh',
    name: 'sinh(x)',
    nameLatex: '\\sinh(x)',
    shortFormLatex:
      '\\displaystyle\\sum_{n=0}^{\\infty} \\frac{x^{2n+1}}{(2n+1)!}',
    exact: Math.sinh,
    xRange: [-3, 3],
    yRange: [-8, 8],
    terms: Array.from({ length: 8 }, (_, n) => ({
      index: n,
      sign: '+' as '+',
      latex: n === 0 ? 'x' : `x^{${2 * n + 1}} / ${2 * n + 1}!`,
      compute: (x: number) => pw(x, 2 * n + 1) / factorial(2 * n + 1),
    })),
  },
  {
    id: 'cosh',
    name: 'cosh(x)',
    nameLatex: '\\cosh(x)',
    shortFormLatex:
      '\\displaystyle\\sum_{n=0}^{\\infty} \\frac{x^{2n}}{(2n)!}',
    exact: Math.cosh,
    xRange: [-3, 3],
    yRange: [-0.5, 8],
    terms: Array.from({ length: 8 }, (_, n) => ({
      index: n,
      sign: '+' as '+',
      latex: n === 0 ? '1' : `x^{${2 * n}} / ${2 * n}!`,
      compute: (x: number) => pw(x, 2 * n) / factorial(2 * n),
    })),
  },
];
