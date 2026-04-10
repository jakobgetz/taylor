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

/** Maximum number of terms generated per function */
export const N_MAX = 15;

function factorial(n: number): number {
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function pw(x: number, n: number): number {
  return Math.pow(x, n);
}

/** C(1/2, n) for the binomial series sqrt(1+x) */
function binomHalf(n: number): number {
  if (n === 0) return 1;
  let r = 1;
  for (let k = 0; k < n; k++) r *= (0.5 - k) / (k + 1);
  return r;
}

/** Coefficient of x^{2n+1} in arcsin(x) series */
function arcsinCoeff(n: number): number {
  return factorial(2 * n) / (Math.pow(4, n) * Math.pow(factorial(n), 2) * (2 * n + 1));
}

/** Coefficients for tan(x) = sum TAN_C[n] * x^{2n+1} */
const TAN_C = [
  1,
  1 / 3,
  2 / 15,
  17 / 315,
  62 / 2835,
  1382 / 155925,
  21844 / 6081075,
  929569 / 638512875,
  6404582 / 10854718875,
  443861162 / 1856156927625,
];

/** LaTeX labels for tan terms (nice exact fractions) */
const TAN_LATEX = [
  'x',
  '\\tfrac{1}{3}x^{3}',
  '\\tfrac{2}{15}x^{5}',
  '\\tfrac{17}{315}x^{7}',
  '\\tfrac{62}{2835}x^{9}',
  '\\tfrac{1382}{155925}x^{11}',
  '\\tfrac{21844}{6081075}x^{13}',
  '\\tfrac{929569}{638512875}x^{15}',
  '\\tfrac{6404582}{10854718875}x^{17}',
  '\\tfrac{443861162}{1856156927625}x^{19}',
];

/** Format a coefficient compactly (drop trailing zeros) */
function fmtC(c: number): string {
  return parseFloat(Math.abs(c).toFixed(5)).toString();
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
    terms: Array.from({ length: N_MAX }, (_, n) => ({
      index: n,
      sign: (n % 2 === 0 ? '+' : '-') as '+' | '-',
      latex: n === 0 ? '1' : `\\tfrac{x^{${2 * n}}}{${2 * n}!}`,
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
    terms: Array.from({ length: N_MAX }, (_, n) => ({
      index: n,
      sign: (n % 2 === 0 ? '+' : '-') as '+' | '-',
      latex: n === 0 ? 'x' : `\\tfrac{x^{${2 * n + 1}}}{${2 * n + 1}!}`,
      compute: (x: number) =>
        Math.pow(-1, n) * pw(x, 2 * n + 1) / factorial(2 * n + 1),
    })),
  },
  {
    id: 'exp',
    name: 'eˣ',
    nameLatex: 'e^{x}',
    shortFormLatex: '\\displaystyle\\sum_{n=0}^{\\infty} \\frac{x^n}{n!}',
    exact: Math.exp,
    xRange: [-3, 3],
    yRange: [-0.5, 12],
    terms: Array.from({ length: N_MAX }, (_, n) => ({
      index: n,
      sign: '+' as '+',
      latex: n === 0 ? '1' : n === 1 ? 'x' : `\\tfrac{x^{${n}}}{${n}!}`,
      compute: (x: number) => pw(x, n) / factorial(n),
    })),
  },
  {
    id: 'exp_neg',
    name: 'e⁻ˣ',
    nameLatex: 'e^{-x}',
    shortFormLatex:
      '\\displaystyle\\sum_{n=0}^{\\infty} \\frac{(-1)^n x^n}{n!}',
    exact: (x: number) => Math.exp(-x),
    xRange: [-3, 3],
    yRange: [-0.5, 12],
    terms: Array.from({ length: N_MAX }, (_, n) => ({
      index: n,
      sign: (n % 2 === 0 ? '+' : '-') as '+' | '-',
      latex: n === 0 ? '1' : n === 1 ? 'x' : `\\tfrac{x^{${n}}}{${n}!}`,
      compute: (x: number) => Math.pow(-1, n) * pw(x, n) / factorial(n),
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
    terms: Array.from({ length: N_MAX }, (_, i) => {
      const n = i + 1;
      return {
        index: i,
        sign: (n % 2 === 1 ? '+' : '-') as '+' | '-',
        latex: n === 1 ? 'x' : `\\tfrac{x^{${n}}}{${n}}`,
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
    terms: Array.from({ length: N_MAX }, (_, n) => ({
      index: n,
      sign: '+' as '+',
      latex: n === 0 ? '1' : n === 1 ? 'x' : `x^{${n}}`,
      compute: (x: number) => pw(x, n),
    })),
  },
  {
    id: 'geom_neg',
    name: '1/(1+x²)',
    nameLatex: '\\dfrac{1}{1+x^2}',
    shortFormLatex: '\\displaystyle\\sum_{n=0}^{\\infty} (-1)^n x^{2n}',
    exact: (x: number) => 1 / (1 + x * x),
    xRange: [-3, 3],
    yRange: [-0.5, 2],
    terms: Array.from({ length: N_MAX }, (_, n) => ({
      index: n,
      sign: (n % 2 === 0 ? '+' : '-') as '+' | '-',
      latex: n === 0 ? '1' : `x^{${2 * n}}`,
      compute: (x: number) => Math.pow(-1, n) * pw(x, 2 * n),
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
    terms: Array.from({ length: N_MAX }, (_, n) => ({
      index: n,
      sign: (n % 2 === 0 ? '+' : '-') as '+' | '-',
      latex: n === 0 ? 'x' : `\\tfrac{x^{${2 * n + 1}}}{${2 * n + 1}}`,
      compute: (x: number) =>
        Math.pow(-1, n) * pw(x, 2 * n + 1) / (2 * n + 1),
    })),
  },
  {
    id: 'arcsin',
    name: 'arcsin(x)',
    nameLatex: '\\arcsin(x)',
    shortFormLatex:
      '\\displaystyle\\sum_{n=0}^{\\infty} \\frac{(2n)!}{4^n(n!)^2(2n+1)}\\,x^{2n+1}',
    exact: Math.asin,
    xRange: [-1, 1],
    yRange: [-2, 2],
    terms: Array.from({ length: N_MAX }, (_, n) => {
      const c = arcsinCoeff(n);
      return {
        index: n,
        sign: '+' as '+',
        latex: n === 0 ? 'x' : `${fmtC(c)}x^{${2 * n + 1}}`,
        compute: (x: number) => c * pw(x, 2 * n + 1),
      };
    }),
  },
  {
    id: 'sqrt',
    name: '√(1+x)',
    nameLatex: '\\sqrt{1+x}',
    shortFormLatex:
      '\\displaystyle\\sum_{n=0}^{\\infty} \\binom{\\!\\tfrac{1}{2}\\!}{n}\\, x^n',
    exact: (x: number) => Math.sqrt(1 + x),
    xRange: [-0.99, 4],
    yRange: [-0.5, 3],
    terms: Array.from({ length: N_MAX }, (_, n) => {
      const c = binomHalf(n);
      return {
        index: n,
        sign: (c >= 0 ? '+' : '-') as '+' | '-',
        latex:
          n === 0 ? '1' :
          n === 1 ? '\\tfrac{1}{2}x' :
          `${fmtC(c)}x^{${n}}`,
        compute: (x: number) => c * pw(x, n),
      };
    }),
  },
  {
    id: 'tan',
    name: 'tan(x)',
    nameLatex: '\\tan(x)',
    shortFormLatex:
      '\\displaystyle x + \\tfrac{x^3}{3} + \\tfrac{2x^5}{15} + \\tfrac{17x^7}{315} + \\cdots',
    exact: Math.tan,
    xRange: [-1.4, 1.4],
    yRange: [-4, 4],
    terms: Array.from({ length: Math.min(TAN_C.length, N_MAX) }, (_, n) => ({
      index: n,
      sign: '+' as '+',
      latex: TAN_LATEX[n],
      compute: (x: number) => TAN_C[n] * pw(x, 2 * n + 1),
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
    terms: Array.from({ length: N_MAX }, (_, n) => ({
      index: n,
      sign: '+' as '+',
      latex: n === 0 ? 'x' : `\\tfrac{x^{${2 * n + 1}}}{${2 * n + 1}!}`,
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
    terms: Array.from({ length: N_MAX }, (_, n) => ({
      index: n,
      sign: '+' as '+',
      latex: n === 0 ? '1' : `\\tfrac{x^{${2 * n}}}{${2 * n}!}`,
      compute: (x: number) => pw(x, 2 * n) / factorial(2 * n),
    })),
  },
];
