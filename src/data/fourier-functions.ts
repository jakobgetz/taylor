import type { TaylorFunction } from './functions';

export const N_MAX_FOURIER = 12;

const PI = Math.PI;

export const FOURIER_FUNCTIONS: TaylorFunction[] = [
  // 1. Square wave
  {
    id: 'f-square',
    name: 'Square Wave',
    label: 'Square Wave',
    nameLatex: '\\operatorname{sgn}(\\sin x)',
    shortFormLatex: '\\displaystyle\\frac{4}{\\pi}\\sum_{k=1}^{\\infty}\\frac{\\sin((2k{-}1)x)}{2k{-}1}',
    piAxis: true,
    xRange: [-2 * PI, 2 * PI],
    yRange: [-1.6, 1.6],
    exact: (x: number) => {
      const mod = ((x % (2 * PI)) + 2 * PI) % (2 * PI);
      return mod < PI ? 1 : mod > PI ? -1 : 0;
    },
    terms: Array.from({ length: N_MAX_FOURIER }, (_, i) => {
      const k = i + 1;
      const m = 2 * k - 1;
      return {
        index: i,
        sign: '+' as const,
        latex: m === 1 ? '\\tfrac{4}{\\pi}\\sin(x)' : `\\tfrac{4}{${m}\\pi}\\sin(${m}x)`,
        compute: (x: number) => (4 / (m * PI)) * Math.sin(m * x),
      };
    }),
  },

  // 2. Sawtooth wave
  {
    id: 'f-sawtooth',
    name: 'Sawtooth Wave',
    label: 'Sawtooth Wave',
    nameLatex: 'x/\\pi',
    shortFormLatex: '\\displaystyle\\frac{2}{\\pi}\\sum_{n=1}^{\\infty}\\frac{(-1)^{n+1}}{n}\\sin(nx)',
    piAxis: true,
    xRange: [-2 * PI, 2 * PI],
    yRange: [-1.6, 1.6],
    exact: (x: number) => {
      let mod = x % (2 * PI);
      if (mod > PI) mod -= 2 * PI;
      if (mod < -PI) mod += 2 * PI;
      return mod / PI;
    },
    terms: Array.from({ length: N_MAX_FOURIER }, (_, i) => {
      const n = i + 1;
      // |coeff| = 2/(n*PI), simplified latex
      let latexCoeff: string;
      if (n === 1) latexCoeff = '\\tfrac{2}{\\pi}';
      else if (n === 2) latexCoeff = '\\tfrac{1}{\\pi}';
      else if (n % 2 === 0) latexCoeff = `\\tfrac{1}{${n / 2}\\pi}`;
      else latexCoeff = `\\tfrac{2}{${n}\\pi}`;
      return {
        index: i,
        sign: (n % 2 === 1 ? '+' : '-') as '+' | '-',
        latex: n === 1 ? `${latexCoeff}\\sin(x)` : `${latexCoeff}\\sin(${n}x)`,
        compute: (x: number) => (2 / (n * PI)) * Math.pow(-1, n + 1) * Math.sin(n * x),
      };
    }),
  },

  // 3. Triangle wave
  {
    id: 'f-triangle',
    name: 'Triangle Wave',
    label: 'Triangle Wave',
    nameLatex: '1 - \\tfrac{2|x|}{\\pi}',
    shortFormLatex: '\\displaystyle\\frac{8}{\\pi^2}\\sum_{k=1}^{\\infty}\\frac{\\cos((2k{-}1)x)}{(2k{-}1)^2}',
    piAxis: true,
    xRange: [-2 * PI, 2 * PI],
    yRange: [-1.5, 1.5],
    exact: (x: number) => {
      let mod = x % (2 * PI);
      if (mod > PI) mod -= 2 * PI;
      if (mod < -PI) mod += 2 * PI;
      return 1 - (2 * Math.abs(mod)) / PI;
    },
    terms: Array.from({ length: N_MAX_FOURIER }, (_, i) => {
      const k = i + 1;
      const m = 2 * k - 1;
      return {
        index: i,
        sign: '+' as const,
        latex: m === 1 ? '\\tfrac{8}{\\pi^2}\\cos(x)' : `\\tfrac{8}{${m * m}\\pi^2}\\cos(${m}x)`,
        compute: (x: number) => (8 / (m * m * PI * PI)) * Math.cos(m * x),
      };
    }),
  },

  // 4. Parabola x²
  {
    id: 'f-parabola',
    name: 'Parabolic Wave',
    label: 'Parabolic Wave',
    nameLatex: 'x^2',
    shortFormLatex: '\\displaystyle\\frac{\\pi^2}{3}+\\sum_{n=1}^{\\infty}\\frac{4(-1)^n}{n^2}\\cos(nx)',
    piAxis: true,
    xRange: [-PI, PI],
    yRange: [-0.5, 10.5],
    exact: (x: number) => {
      let mod = x % (2 * PI);
      if (mod > PI) mod -= 2 * PI;
      if (mod < -PI) mod += 2 * PI;
      return mod * mod;
    },
    terms: Array.from({ length: N_MAX_FOURIER }, (_, i) => {
      if (i === 0) {
        return {
          index: 0,
          sign: '+' as const,
          latex: '\\tfrac{\\pi^2}{3}',
          compute: (_: number) => PI * PI / 3,
        };
      }
      const n = i; // n goes 1..11
      // |coeff| = 4/n^2, sign is + if n even, - if n odd
      let latexBody: string;
      if (n === 1) latexBody = `4\\cos(x)`;
      else if (n === 2) latexBody = `\\cos(2x)`;
      else if (n % 2 === 0) {
        const d = (n / 2) * (n / 2);
        latexBody = d === 1 ? `\\cos(${n}x)` : `\\tfrac{1}{${d}}\\cos(${n}x)`;
      } else {
        latexBody = `\\tfrac{4}{${n * n}}\\cos(${n}x)`;
      }
      return {
        index: i,
        sign: (n % 2 === 0 ? '+' : '-') as '+' | '-',
        latex: latexBody,
        compute: (x: number) => (4 * Math.pow(-1, n) / (n * n)) * Math.cos(n * x),
      };
    }),
  },

  // 5. |sin(x)|
  {
    id: 'f-abssin',
    name: '|sin(x)|',
    label: 'Full-Wave Rectified Sine',
    nameLatex: '|\\sin x|',
    shortFormLatex: '\\displaystyle\\frac{2}{\\pi}-\\frac{4}{\\pi}\\sum_{k=1}^{\\infty}\\frac{\\cos(2kx)}{4k^2-1}',
    piAxis: true,
    xRange: [-2 * PI, 2 * PI],
    yRange: [-0.3, 1.4],
    exact: (x: number) => Math.abs(Math.sin(x)),
    terms: Array.from({ length: N_MAX_FOURIER }, (_, i) => {
      if (i === 0) {
        return {
          index: 0,
          sign: '+' as const,
          latex: '\\tfrac{2}{\\pi}',
          compute: (_: number) => 2 / PI,
        };
      }
      const k = i;
      const denom = 4 * k * k - 1;
      return {
        index: i,
        sign: '-' as const,
        latex: `\\tfrac{4}{${denom}\\pi}\\cos(${2 * k}x)`,
        compute: (x: number) => (-4 / (denom * PI)) * Math.cos(2 * k * x),
      };
    }),
  },

  // 6. Half-wave rectified sine
  {
    id: 'f-halfwave',
    name: 'Half-Wave Rectified',
    label: 'Half-Wave Rectified Sine',
    nameLatex: '\\max(\\sin x,\\,0)',
    shortFormLatex: '\\displaystyle\\frac{1}{\\pi}+\\frac{\\sin x}{2}-\\frac{2}{\\pi}\\sum_{k=1}^{\\infty}\\frac{\\cos(2kx)}{4k^2-1}',
    piAxis: true,
    xRange: [-2 * PI, 2 * PI],
    yRange: [-0.3, 1.4],
    exact: (x: number) => Math.max(Math.sin(x), 0),
    terms: Array.from({ length: N_MAX_FOURIER }, (_, i) => {
      if (i === 0) {
        return {
          index: 0,
          sign: '+' as const,
          latex: '\\tfrac{1}{\\pi}',
          compute: (_: number) => 1 / PI,
        };
      }
      if (i === 1) {
        return {
          index: 1,
          sign: '+' as const,
          latex: '\\tfrac{1}{2}\\sin(x)',
          compute: (x: number) => 0.5 * Math.sin(x),
        };
      }
      const k = i - 1;
      const denom = 4 * k * k - 1;
      return {
        index: i,
        sign: '-' as const,
        latex: `\\tfrac{2}{${denom}\\pi}\\cos(${2 * k}x)`,
        compute: (x: number) => (-2 / (denom * PI)) * Math.cos(2 * k * x),
      };
    }),
  },

  // 7. Step function
  {
    id: 'f-step',
    name: 'Step Function',
    label: 'Step Function',
    nameLatex: '\\mathbf{1}_{(0,\\pi)}(x)',
    shortFormLatex: '\\displaystyle\\frac{1}{2}+\\frac{2}{\\pi}\\sum_{k=1}^{\\infty}\\frac{\\sin((2k{-}1)x)}{2k{-}1}',
    piAxis: true,
    xRange: [-2 * PI, 2 * PI],
    yRange: [-0.3, 1.4],
    exact: (x: number) => {
      const mod = ((x % (2 * PI)) + 2 * PI) % (2 * PI);
      return mod < PI ? 1 : mod > PI ? 0 : 0.5;
    },
    terms: Array.from({ length: N_MAX_FOURIER }, (_, i) => {
      if (i === 0) {
        return {
          index: 0,
          sign: '+' as const,
          latex: '\\tfrac{1}{2}',
          compute: (_: number) => 0.5,
        };
      }
      const k = i;
      const m = 2 * k - 1;
      return {
        index: i,
        sign: '+' as const,
        latex: m === 1 ? '\\tfrac{2}{\\pi}\\sin(x)' : `\\tfrac{2}{${m}\\pi}\\sin(${m}x)`,
        compute: (x: number) => (2 / (m * PI)) * Math.sin(m * x),
      };
    }),
  },
];
