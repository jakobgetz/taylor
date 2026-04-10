export interface Contribution {
  title: string;
  year?: number;
  description: string;
}

export type Field =
  | 'Analysis'
  | 'Geometry'
  | 'Number Theory'
  | 'Algebra'
  | 'Probability'
  | 'Logic'
  | 'Applied Math'
  | 'Topology';

export type Era = 'Ancient' | 'Medieval' | 'Renaissance' | 'Enlightenment' | 'Modern';

export interface Mathematician {
  id: string;
  name: string;
  birth: number;        // year (negative = BC)
  death: number | null; // year
  nationality: string;
  fields: Field[];
  era: Era;
  portraitFile: string; // Wikimedia Commons filename
  shortBio: string;
  quote?: string;
  contributions: Contribution[];
  appRelated?: Array<'taylor' | 'fourier' | 'geometric'>;
}

export const FIELD_COLORS: Record<Field, string> = {
  'Analysis':     '#3b82f6',
  'Geometry':     '#10b981',
  'Number Theory':'#8b5cf6',
  'Algebra':      '#f59e0b',
  'Probability':  '#ef4444',
  'Logic':        '#6366f1',
  'Applied Math': '#14b8a6',
  'Topology':     '#ec4899',
};

export const ERA_COLORS: Record<Era, string> = {
  'Ancient':       '#fffbeb',
  'Medieval':      '#f0fdf4',
  'Renaissance':   '#eff6ff',
  'Enlightenment': '#faf5ff',
  'Modern':        '#fdf2f8',
};

export const ERA_TEXT_COLORS: Record<Era, string> = {
  'Ancient':       '#92400e',
  'Medieval':      '#166534',
  'Renaissance':   '#1e40af',
  'Enlightenment': '#5b21b6',
  'Modern':        '#9d174d',
};

export const ERA_BAND_DATA: { era: Era; startYear: number; endYear: number }[] = [
  { era: 'Ancient',       startYear: -400, endYear:  500 },
  { era: 'Medieval',      startYear:  500, endYear: 1400 },
  { era: 'Renaissance',   startYear: 1400, endYear: 1600 },
  { era: 'Enlightenment', startYear: 1600, endYear: 1800 },
  { era: 'Modern',        startYear: 1800, endYear: 1970 },
];

export const ALL_FIELDS: Field[] = [
  'Analysis', 'Geometry', 'Number Theory', 'Algebra',
  'Probability', 'Logic', 'Applied Math', 'Topology',
];

export const MATHEMATICIANS: Mathematician[] = [
  {
    id: 'euclid',
    name: 'Euclid',
    birth: -325,
    death: -265,
    nationality: 'Greek',
    fields: ['Geometry', 'Number Theory'],
    era: 'Ancient',
    portraitFile: 'Euklid-von-Alexandria_1.jpg',
    shortBio: 'Euclid of Alexandria was an ancient Greek mathematician often referred to as the "father of geometry." His treatise Elements is one of the most influential works in the history of mathematics, serving as the main textbook for teaching mathematics for over 2,000 years.',
    quote: 'There is no royal road to geometry.',
    contributions: [
      { title: 'Elements', year: -300, description: 'A 13-volume treatise organizing all known geometry and number theory through axioms and logical proofs. It defined the axiomatic method and remained the standard mathematics textbook for over two millennia.' },
      { title: 'Infinitely Many Primes', description: 'Proved there are infinitely many prime numbers — one of the earliest examples of a proof by contradiction, still taught today.' },
      { title: "Euclid's Algorithm", description: 'Described an efficient method for computing the greatest common divisor of two numbers. One of the oldest algorithms still in common use, it forms the basis of modern number theory and cryptography.' },
    ],
  },
  {
    id: 'archimedes',
    name: 'Archimedes',
    birth: -287,
    death: -212,
    nationality: 'Greek',
    fields: ['Geometry', 'Applied Math', 'Analysis'],
    era: 'Ancient',
    portraitFile: 'Domenico-Fetti_Archimedes_1620.jpg',
    shortBio: 'Archimedes of Syracuse is considered the greatest mathematician of antiquity. He anticipated modern calculus by applying infinitesimals to compute areas and volumes, approximated π with astonishing accuracy, and made foundational discoveries in physics including the principle of the lever and buoyancy.',
    quote: 'Give me a place to stand and a long enough lever and I will move the Earth.',
    contributions: [
      { title: 'Method of Exhaustion', description: 'Applied an early precursor to calculus to compute the area of a circle, volume of a sphere, and area under a parabola — anticipating integral calculus by 1,800 years.' },
      { title: 'Approximation of π', description: 'Calculated π to be between 223/71 and 22/7 by inscribing and circumscribing polygons with 96 sides — the most accurate estimate for centuries.' },
      { title: "Archimedes' Principle", description: 'Discovered that the buoyancy force on a submerged object equals the weight of fluid displaced. Legend says he leapt from his bath shouting "Eureka!" upon the discovery.' },
    ],
  },
  {
    id: 'al-khwarizmi',
    name: 'al-Khwārizmī',
    birth: 780,
    death: 850,
    nationality: 'Persian',
    fields: ['Algebra', 'Geometry', 'Number Theory'],
    era: 'Medieval',
    portraitFile: 'Al-Khwarizmi_Amirkabir_University_of_Technology.png',
    shortBio: "Muhammad ibn Musa al-Khwārizmī was a 9th-century Persian mathematician whose work gave algebra its name and introduced systematic methods for solving linear and quadratic equations. The word 'algorithm' derives from the Latinization of his name.",
    contributions: [
      { title: 'Algebra', year: 820, description: 'His book "Al-Kitāb al-mukhtaṣar fī ḥisāb al-jabr waʾl-muqābala" gave algebra its name. It presented the first systematic treatment of linear and quadratic equations, laying the foundation of algebraic thinking.' },
      { title: 'Hindu-Arabic Numerals in the West', description: 'Introduced the Hindu-Arabic numeral system (including zero) to the Islamic world and eventually Europe, replacing Roman numerals and transforming commerce and science.' },
      { title: 'Algorithms', description: 'His name, Latinized as "Algoritmi," gave rise to the word algorithm — the concept of a step-by-step procedure for solving problems, fundamental to all computing.' },
    ],
  },
  {
    id: 'fibonacci',
    name: 'Fibonacci',
    birth: 1170,
    death: 1250,
    nationality: 'Italian',
    fields: ['Number Theory', 'Algebra'],
    era: 'Medieval',
    portraitFile: 'Fibonacci.jpg',
    shortBio: 'Leonardo of Pisa, known as Fibonacci, was the most talented Western mathematician of the Middle Ages. He introduced the Hindu-Arabic numeral system to Europe and described the Fibonacci sequence — numbers that appear throughout nature, art, and mathematics.',
    contributions: [
      { title: 'Liber Abaci', year: 1202, description: 'His "Book of Calculation" introduced Europe to the Hindu-Arabic numeral system and demonstrated its superiority over Roman numerals for commerce, accounting, and science.' },
      { title: 'Fibonacci Sequence', description: 'Described the sequence 0, 1, 1, 2, 3, 5, 8, 13, ... where each term is the sum of the two before it. This sequence appears in flower petals, nautilus shells, pine cones, and countless natural phenomena.' },
    ],
  },
  {
    id: 'descartes',
    name: 'René Descartes',
    birth: 1596,
    death: 1650,
    nationality: 'French',
    fields: ['Geometry', 'Algebra', 'Analysis'],
    era: 'Renaissance',
    portraitFile: 'Frans_Hals_-_Portret_van_René_Descartes.jpg',
    shortBio: 'René Descartes invented analytic geometry, bridging algebra and geometry by introducing the coordinate system that bears his name. His work made it possible to describe geometric curves with algebraic equations — a unification that transformed all of mathematics.',
    quote: 'I think, therefore I am.',
    contributions: [
      { title: 'Cartesian Coordinate System', year: 1637, description: 'Invented the (x, y) coordinate system, allowing geometric shapes to be described algebraically and equations to be visualized geometrically. This single idea unified algebra and geometry into analytic geometry.' },
      { title: 'La Géométrie', year: 1637, description: 'Introduced modern algebraic notation (a, b, c for constants; x, y, z for unknowns) and solved geometric problems algebraically — foundational to how mathematics is written today.' },
    ],
    appRelated: ['taylor', 'fourier', 'geometric'],
  },
  {
    id: 'fermat',
    name: 'Pierre de Fermat',
    birth: 1607,
    death: 1665,
    nationality: 'French',
    fields: ['Number Theory', 'Geometry', 'Probability', 'Analysis'],
    era: 'Enlightenment',
    portraitFile: 'Pierre_de_Fermat.jpg',
    shortBio: "Pierre de Fermat was an amateur mathematician who made profound contributions to number theory, analytic geometry, and the early development of calculus. He is most famous for Fermat's Last Theorem — a conjecture he scrawled in a book margin that remained unproven for 358 years.",
    contributions: [
      { title: "Fermat's Last Theorem", year: 1637, description: 'Conjectured that no three positive integers a, b, c satisfy aⁿ + bⁿ = cⁿ for n > 2. He claimed to have "a truly marvelous proof" that didn\'t fit in the margin. Andrew Wiles finally proved it in 1995.' },
      { title: 'Foundations of Calculus', description: 'Developed a method for finding maxima, minima, and tangents to curves — anticipating differential calculus decades before Newton and Leibniz.' },
      { title: 'Probability Theory', year: 1654, description: 'Co-founded probability theory with Pascal through correspondence on gambling problems, developing the concept of expected value and laying the groundwork for statistics.' },
    ],
  },
  {
    id: 'pascal',
    name: 'Blaise Pascal',
    birth: 1623,
    death: 1662,
    nationality: 'French',
    fields: ['Probability', 'Geometry', 'Number Theory'],
    era: 'Enlightenment',
    portraitFile: 'Blaise_pascal.jpg',
    shortBio: "Blaise Pascal was a child prodigy who made lasting contributions to mathematics, physics, and philosophy. He laid the foundations of probability theory with Fermat, proved a landmark theorem in projective geometry at age 16, and invented one of the world's first mechanical calculators at age 19.",
    contributions: [
      { title: "Pascal's Triangle", description: 'Systematized the triangular array of binomial coefficients, revealing deep connections to combinatorics, probability, and the binomial theorem. Although known earlier, Pascal\'s extensive use made it his.' },
      { title: 'Probability Theory', year: 1654, description: 'With Fermat, developed mathematical probability to solve the "Problem of Points" — how to fairly split stakes in an interrupted gambling game. This launched probability as a rigorous mathematical discipline.' },
      { title: 'Mechanical Calculator', year: 1642, description: 'At age 19, built the Pascaline — one of the first mechanical calculators, capable of adding and subtracting with automatic carry. He built 50 of them.' },
    ],
  },
  {
    id: 'newton',
    name: 'Isaac Newton',
    birth: 1643,
    death: 1727,
    nationality: 'British',
    fields: ['Analysis', 'Geometry', 'Applied Math'],
    era: 'Enlightenment',
    portraitFile: 'GodfreyKneller-IsaacNewton-1689.jpg',
    shortBio: 'Sir Isaac Newton invented calculus, formulated the laws of motion and universal gravitation, and made foundational contributions to optics and mathematics. Often ranked the greatest mathematician and physicist of all time, he spent 1665–66 in isolation during a plague epidemic — and changed science forever.',
    quote: 'If I have seen further it is by standing on the shoulders of Giants.',
    contributions: [
      { title: 'Calculus (Method of Fluxions)', year: 1666, description: 'Invented calculus — including differentiation and integration — which he called "the method of fluxions." Developed during his annus mirabilis (1665–66) while Cambridge was closed due to plague.' },
      { title: 'Generalized Binomial Theorem', year: 1665, description: 'Extended the binomial theorem to fractional and negative exponents: (1+x)ⁿ = 1 + nx + n(n−1)x²/2! + ... A direct precursor to Taylor series expansions.' },
      { title: 'Laws of Motion & Gravitation', year: 1687, description: 'In Principia Mathematica, described three laws of motion and the law of universal gravitation, unifying terrestrial and celestial mechanics into a single mathematical framework.' },
      { title: "Newton's Method", description: 'Devised an iterative algorithm for finding roots of equations, still widely used in numerical computing.' },
    ],
    appRelated: ['taylor'],
  },
  {
    id: 'leibniz',
    name: 'Gottfried Leibniz',
    birth: 1646,
    death: 1716,
    nationality: 'German',
    fields: ['Analysis', 'Logic', 'Algebra'],
    era: 'Enlightenment',
    portraitFile: 'Gottfried_Wilhelm_Leibniz,_Bernhard_Christoph_Francke.jpg',
    shortBio: 'Gottfried Wilhelm Leibniz was a German polymath who independently invented calculus and whose notation — dy/dx for derivatives and ∫ for integrals — is the one used universally today. He also made pioneering contributions to logic, binary arithmetic, and philosophy.',
    contributions: [
      { title: 'Calculus & Leibniz Notation', year: 1684, description: "Published calculus in 1684 — before Newton's version appeared. His notation (dy/dx, ∫f dx, d²y/dx²) became the universal standard. A bitter priority dispute with Newton divided European and British mathematics for generations." },
      { title: 'Binary Number System', description: 'Developed and championed the binary system (base 2), recognizing its mathematical elegance. He wrote of the mystical significance of 0 and 1 — laying conceptual groundwork for digital computing 250 years later.' },
      { title: 'Leibniz Formula for π', description: 'Discovered that π/4 = 1 − 1/3 + 1/5 − 1/7 + ... — an infinite series for π connecting number theory, geometry, and analysis.' },
    ],
    appRelated: ['taylor', 'fourier'],
  },
  {
    id: 'taylor',
    name: 'Brook Taylor',
    birth: 1685,
    death: 1731,
    nationality: 'British',
    fields: ['Analysis', 'Geometry'],
    era: 'Enlightenment',
    portraitFile: 'Brook_Taylor.jpg',
    shortBio: "Brook Taylor was an English mathematician best known for the Taylor series — the representation of smooth functions as infinite polynomials. His 1715 publication Methodus Incrementorum Directa et Inversa also pioneered the calculus of finite differences. Outside mathematics he was a gifted painter who wrote foundational works on perspective.",
    contributions: [
      { title: 'Taylor Series', year: 1715, description: 'Published the Taylor series: f(x) = f(a) + f′(a)(x−a) + f″(a)(x−a)²/2! + ... Any smooth function can be expressed as an infinite polynomial. The special case a=0 is the Maclaurin series, and this representation is central to all of analysis.' },
      { title: "Taylor's Theorem", year: 1715, description: 'Proved that smooth functions can be approximated locally by polynomials, with a computable error bound. This gave the series a rigorous foundation and the tool to know when an approximation is "good enough."' },
      { title: 'Calculus of Finite Differences', description: 'Systematically developed the discrete analog of differential calculus, relating sequences and their differences — later fundamental to numerical computing.' },
    ],
    appRelated: ['taylor'],
  },
  {
    id: 'euler',
    name: 'Leonhard Euler',
    birth: 1707,
    death: 1783,
    nationality: 'Swiss',
    fields: ['Analysis', 'Number Theory', 'Geometry', 'Applied Math', 'Topology'],
    era: 'Enlightenment',
    portraitFile: 'Leonhard_Euler.jpg',
    shortBio: "Leonhard Euler was the most prolific mathematician in history, producing over 800 publications covering virtually every area of mathematics. He introduced the notation f(x), e, i, π, and Σ that we use today. He continued producing mathematics at an undiminished rate even after going completely blind.",
    quote: 'Mathematicians have tried in vain to discover some order in the sequence of prime numbers, and we have reason to believe that it is a mystery into which the human mind will never penetrate.',
    contributions: [
      { title: "Euler's Identity", description: 'Derived e^(iπ) + 1 = 0 — considered the most beautiful equation in mathematics — linking the five most fundamental constants: e, i, π, 0, and 1.' },
      { title: "Euler's Number e", description: 'Defined and popularized e ≈ 2.71828 as the base of the natural logarithm. The function eˣ is its own derivative — the cornerstone of all exponential analysis.' },
      { title: 'Graph Theory', year: 1736, description: 'Founded graph theory by proving it impossible to cross all seven Königsberg bridges exactly once. Introduced the concepts of vertices and edges — now the basis of network science.' },
      { title: 'Basel Problem', year: 1734, description: 'Stunned the mathematical world by proving 1 + 1/4 + 1/9 + 1/16 + ... = π²/6, connecting an infinite series of fractions to π.' },
    ],
    appRelated: ['taylor', 'fourier', 'geometric'],
  },
  {
    id: 'lagrange',
    name: 'Joseph-Louis Lagrange',
    birth: 1736,
    death: 1813,
    nationality: 'Italian-French',
    fields: ['Analysis', 'Number Theory', 'Algebra', 'Applied Math'],
    era: 'Enlightenment',
    portraitFile: 'Lagrange_portrait.jpg',
    shortBio: 'Joseph-Louis Lagrange was one of the greatest mathematicians of the 18th century, making foundational contributions to analysis, number theory, algebra, and mechanics. He put the Taylor series on a rigorous footing by providing the precise formula for its error term.',
    contributions: [
      { title: 'Lagrange Remainder', year: 1797, description: 'Provided the rigorous error formula for Taylor series: Rₙ(x) = f^(n+1)(ξ)·(x−a)^(n+1)/(n+1)! for some ξ between a and x. This quantified exactly how good a polynomial approximation is.' },
      { title: 'Lagrangian Mechanics', year: 1788, description: 'Reformulated classical mechanics using generalized coordinates and the Lagrangian function (kinetic minus potential energy). This elegant formulation generalized Newtonian mechanics and is used in quantum field theory today.' },
      { title: 'Calculus of Variations', description: 'Developed the mathematics of finding functions that optimize quantities, leading to the Euler–Lagrange equations — fundamental in physics, economics, and optimal control.' },
    ],
    appRelated: ['taylor'],
  },
  {
    id: 'laplace',
    name: 'Pierre-Simon Laplace',
    birth: 1749,
    death: 1827,
    nationality: 'French',
    fields: ['Analysis', 'Probability', 'Applied Math'],
    era: 'Enlightenment',
    portraitFile: 'Pierre-Simon_Laplace.jpg',
    shortBio: "Pierre-Simon Laplace was a French polymath who systematized probability theory, invented the Laplace transform, and proved the stability of the solar system. He famously told Napoleon he had no need for the 'hypothesis of God' in his celestial mechanics.",
    contributions: [
      { title: 'Laplace Transform', description: 'Developed ℒ{f(t)} = ∫₀^∞ f(t)e^(−st) dt, which converts differential equations into algebraic ones. Indispensable in engineering, physics, and control theory.' },
      { title: "Laplace's Equation", description: 'Studied ∇²f = 0 — solutions are "harmonic functions" describing gravitational and electromagnetic fields, fluid dynamics, and heat conduction in steady state.' },
      { title: 'Central Limit Theorem', year: 1812, description: "Extended and rigorously proved the central limit theorem: the sum of many independent random variables tends to a normal distribution. This is why the bell curve appears everywhere in nature." },
    ],
  },
  {
    id: 'fourier',
    name: 'Joseph Fourier',
    birth: 1768,
    death: 1830,
    nationality: 'French',
    fields: ['Analysis', 'Applied Math'],
    era: 'Enlightenment',
    portraitFile: 'Joseph_Fourier.jpg',
    shortBio: 'Jean-Baptiste Joseph Fourier showed that any periodic function can be expressed as a sum of sines and cosines — a revolutionary and initially controversial claim. His heat equation and Fourier series transformed mathematical physics, and today they underlie signal processing, audio compression, medical imaging, and quantum mechanics.',
    contributions: [
      { title: 'Fourier Series', year: 1822, description: 'Proved that any periodic function can be written as f(x) = a₀/2 + Σ[aₙcos(nx) + bₙsin(nx)]. Initially rejected by Lagrange, this idea became one of the most powerful tools in all of mathematics and physics.' },
      { title: 'Fourier Transform', description: 'Extended Fourier series to non-periodic functions, producing the Fourier transform. It is now the foundation of signal processing, image compression (JPEG), audio analysis, MRI scanning, and quantum mechanics.' },
      { title: 'Heat Equation', year: 1822, description: 'Formulated ∂T/∂t = α·∇²T describing heat diffusion — and solved it using Fourier series. This sparked a revolution in mathematical physics and the rigorous study of partial differential equations.' },
      { title: 'Greenhouse Effect Discovery', year: 1824, description: 'First described how the atmosphere retains heat from the sun — now called the greenhouse effect. He estimated Earth would be much colder without atmospheric absorption.' },
    ],
    appRelated: ['fourier'],
  },
  {
    id: 'gauss',
    name: 'Carl Friedrich Gauss',
    birth: 1777,
    death: 1855,
    nationality: 'German',
    fields: ['Number Theory', 'Algebra', 'Analysis', 'Geometry', 'Applied Math'],
    era: 'Modern',
    portraitFile: 'Carl_Friedrich_Gauss.jpg',
    shortBio: 'Carl Friedrich Gauss, the "Prince of Mathematicians," was arguably the greatest mathematician since antiquity. He made transformative contributions to number theory, algebra, statistics, differential geometry, and physics. He famously summed 1 to 100 instantly as a schoolboy and never stopped producing extraordinary mathematics.',
    quote: 'Mathematics is the queen of the sciences, and number theory is the queen of mathematics.',
    contributions: [
      { title: 'Fundamental Theorem of Algebra', year: 1799, description: 'Proved (in his doctoral dissertation at age 22) that every polynomial with complex coefficients has at least one complex root. He later gave three more proofs of increasing elegance.' },
      { title: 'Disquisitiones Arithmeticae', year: 1801, description: 'Published at age 24, this foundational text systematized modular arithmetic, proved the law of quadratic reciprocity, and launched algebraic number theory. Riemann, Dirichlet, and Dedekind built on it for the next century.' },
      { title: 'Normal Distribution', description: 'Derived the Gaussian (normal) distribution in error analysis of astronomical observations. The bell curve now appears in statistics, quantum mechanics, and throughout nature.' },
      { title: 'Non-Euclidean Geometry', description: 'Independently discovered that consistent geometries exist where the parallel postulate fails — a revolutionary insight he kept private. It was published by Lobachevsky and Bolyai, with Gauss acknowledging their priority.' },
    ],
    appRelated: ['fourier'],
  },
  {
    id: 'cauchy',
    name: 'Augustin-Louis Cauchy',
    birth: 1789,
    death: 1857,
    nationality: 'French',
    fields: ['Analysis', 'Number Theory', 'Algebra'],
    era: 'Modern',
    portraitFile: 'Augustin-Louis_Cauchy.jpg',
    shortBio: 'Augustin-Louis Cauchy put calculus on rigorous foundations using epsilon-delta definitions of limits, continuity, and derivatives — replacing the intuitive but imprecise methods of Newton and Leibniz. He also founded complex analysis and made over 800 publications across mathematics and physics.',
    contributions: [
      { title: 'Rigorous Foundations of Calculus', year: 1821, description: "In Cours d'analyse, Cauchy rigorously defined limits, continuity, derivatives, and convergent series using the epsilon-delta approach. This transformed calculus from an intuitive art into a logically rigorous science." },
      { title: 'Cauchy Integral Theorem', year: 1825, description: 'Proved the cornerstone of complex analysis: the line integral of a complex analytic function around any closed curve is zero. This unlocked an entire universe of mathematical tools.' },
      { title: 'Cauchy Sequences', description: 'Introduced Cauchy sequences as a criterion for convergence: a sequence converges if its terms become arbitrarily close to each other. Used to rigorously construct the real numbers.' },
    ],
    appRelated: ['taylor', 'fourier'],
  },
  {
    id: 'abel',
    name: 'Niels Henrik Abel',
    birth: 1802,
    death: 1829,
    nationality: 'Norwegian',
    fields: ['Algebra', 'Analysis'],
    era: 'Modern',
    portraitFile: 'Niels_Henrik_Abel.jpg',
    shortBio: 'Niels Henrik Abel solved a 300-year-old problem at age 22 by proving that no general algebraic formula exists for solving quintic equations. He died at 26, poverty-stricken and unknown, but his work launched modern abstract algebra and the theory of elliptic functions.',
    contributions: [
      { title: 'Impossibility of the Quintic', year: 1824, description: 'Proved that there is no algebraic formula (using radicals) for solving polynomial equations of degree 5 or higher — a problem open for 300 years. This launched group theory and Galois theory.' },
      { title: 'Abelian Groups', description: "His study of commutativity led to 'abelian groups' (where a·b = b·a) being named in his honor — a central concept in abstract algebra, topology, and physics." },
      { title: 'Convergence of Series', year: 1826, description: "Made fundamental contributions to the rigorous theory of series convergence, including Abel's theorem connecting power series to their limits at the boundary of convergence." },
    ],
  },
  {
    id: 'riemann',
    name: 'Bernhard Riemann',
    birth: 1826,
    death: 1866,
    nationality: 'German',
    fields: ['Analysis', 'Geometry', 'Number Theory'],
    era: 'Modern',
    portraitFile: 'Georg_Friedrich_Bernhard_Riemann.jpeg',
    shortBio: "Bernhard Riemann died at 39 but left a legacy that reshaped mathematics and physics for centuries. His non-Euclidean geometry provided Einstein with the mathematical language of general relativity. His 1859 paper on prime numbers contained the Riemann Hypothesis — mathematics' most famous unsolved problem.",
    contributions: [
      { title: 'Riemann Hypothesis', year: 1859, description: 'Conjectured that all non-trivial zeros of the Riemann zeta function ζ(s) lie on the line Re(s) = 1/2. The most famous unsolved problem in mathematics, with a $1M Millennium Prize. It has profound implications for the distribution of prime numbers.' },
      { title: 'Riemannian Geometry', year: 1854, description: 'In his habilitation lecture, introduced curved spaces (Riemannian manifolds) as a generalization of Euclidean geometry. Einstein used this framework 60 years later to describe spacetime in general relativity.' },
      { title: 'Riemann Integral', description: 'Gave the first rigorous definition of the integral as the limit of Riemann sums, replacing informal geometric notions with precise mathematics.' },
    ],
    appRelated: ['fourier'],
  },
  {
    id: 'cantor',
    name: 'Georg Cantor',
    birth: 1845,
    death: 1918,
    nationality: 'German',
    fields: ['Logic', 'Analysis', 'Number Theory'],
    era: 'Modern',
    portraitFile: 'Georg_Cantor2.jpg',
    shortBio: "Georg Cantor created set theory and proved that infinities come in different sizes — a discovery so radical that leading mathematicians of his day called it 'a grave disease' and 'utter nonsense.' Cantor suffered severe depression partly from the attacks, but his work eventually reshaped all of mathematics.",
    quote: 'The essence of mathematics lies in its freedom.',
    contributions: [
      { title: 'Set Theory', year: 1874, description: 'Founded set theory — the language in which all modern mathematics is written. Introduced sets, subsets, unions, intersections, and the power set.' },
      { title: 'Sizes of Infinity', description: 'Proved not all infinities are equal: the natural numbers and rationals have the same cardinality (ℵ₀), but the real numbers are a strictly larger infinity. There is an infinite hierarchy of infinities.' },
      { title: "Cantor's Diagonal Argument", year: 1891, description: 'Proved by an ingenious diagonal argument that real numbers are uncountable: no matter how you list them, you can always construct one that is missing. A masterpiece of mathematical reasoning.' },
    ],
  },
  {
    id: 'poincare',
    name: 'Henri Poincaré',
    birth: 1854,
    death: 1912,
    nationality: 'French',
    fields: ['Topology', 'Analysis', 'Applied Math'],
    era: 'Modern',
    portraitFile: 'Henri_Poincare.jpg',
    shortBio: 'Henri Poincaré was the last mathematician to master virtually all areas of mathematics as it existed in his time — called "The Last Universalist." He founded algebraic topology, discovered deterministic chaos while studying the three-body problem, and nearly discovered special relativity at the same time as Einstein.',
    contributions: [
      { title: 'Poincaré Conjecture', year: 1904, description: 'Conjectured that every simply connected closed 3-manifold is homeomorphic to the 3-sphere. Proved by Grigori Perelman in 2003 — the only Millennium Prize Problem solved so far.' },
      { title: 'Chaos Theory', year: 1890, description: 'Discovered that even simple deterministic systems (like the three-body gravitational problem) can be exquisitely sensitive to initial conditions — making long-term prediction impossible. The birth of chaos theory.' },
      { title: 'Algebraic Topology', description: 'Founded algebraic topology by introducing fundamental groups and homology. His "Analysis Situs" launched a major mathematical discipline connecting geometry and algebra.' },
    ],
  },
  {
    id: 'hilbert',
    name: 'David Hilbert',
    birth: 1862,
    death: 1943,
    nationality: 'German',
    fields: ['Logic', 'Geometry', 'Analysis', 'Algebra'],
    era: 'Modern',
    portraitFile: 'Hilbert.jpg',
    shortBio: "David Hilbert was the most influential mathematician of the early 20th century. His 23 open problems defined mathematics research for a hundred years. He envisioned formalizing all of mathematics as a complete, consistent system — a dream demolished by Gödel's incompleteness theorems.",
    quote: 'We must know. We will know.',
    contributions: [
      { title: "Hilbert's 23 Problems", year: 1900, description: 'At the 1900 International Congress, posed 23 unsolved problems that set the agenda for 20th-century mathematics. Many have been solved; some (including the Riemann Hypothesis) remain open today.' },
      { title: 'Hilbert Space', description: 'Developed infinite-dimensional vector spaces with inner products (Hilbert spaces). They are the mathematical foundation of quantum mechanics and all of functional analysis.' },
      { title: 'Foundations of Geometry', year: 1899, description: 'Published "Grundlagen der Geometrie" — the first logically complete axiomatization of Euclidean geometry, replacing Euclid\'s 2,000-year-old Elements.' },
    ],
  },
  {
    id: 'noether',
    name: 'Emmy Noether',
    birth: 1882,
    death: 1935,
    nationality: 'German',
    fields: ['Algebra', 'Analysis'],
    era: 'Modern',
    portraitFile: 'Noether.jpg',
    shortBio: "Emmy Noether is considered the most important woman in the history of mathematics. Despite severe discrimination — she was initially unpaid and couldn't officially lecture — she created modern abstract algebra and proved Noether's theorem, which Einstein called one of the most important recent advances in mathematical physics.",
    contributions: [
      { title: "Noether's Theorem", year: 1915, description: 'Proved that every continuous symmetry of a physical system corresponds to a conservation law. Time symmetry → conservation of energy. Spatial symmetry → conservation of momentum. This is a cornerstone of modern physics.' },
      { title: 'Abstract Algebra', year: 1921, description: 'Her paper "Theory of Ideals in Ring Domains" revolutionized algebra by shifting from specific calculations to structural properties. She introduced the modern theory of rings, ideals, and modules in one sweeping unified framework.' },
      { title: 'Noetherian Rings', description: 'Characterized rings satisfying the ascending chain condition. Noetherian rings have remarkable finiteness properties and are central to modern commutative algebra and algebraic geometry.' },
    ],
  },
  {
    id: 'ramanujan',
    name: 'Srinivasa Ramanujan',
    birth: 1887,
    death: 1920,
    nationality: 'Indian',
    fields: ['Number Theory', 'Analysis'],
    era: 'Modern',
    portraitFile: 'Srinivasa_Ramanujan_-_OPC_-_1.jpg',
    shortBio: "Srinivasa Ramanujan was a self-taught mathematical genius from India who, with almost no formal training, produced thousands of extraordinary results in number theory and analysis. His collaborator G.H. Hardy said working with him was the most romantic incident in his life. Ramanujan died at 32, having reshaped mathematics from a hospital bed.",
    quote: 'An equation for me has no meaning unless it expresses a thought of God.',
    contributions: [
      { title: "Ramanujan's Notebooks", description: "Filled 3 notebooks with thousands of formulas — most without proof. Every formula checked since has been correct. Mathematicians still publish papers proving results from Ramanujan's notebooks a century later." },
      { title: 'Infinite Series for π', description: 'Discovered extraordinarily fast-converging series for 1/π. His formula adds about 8 decimal digits of π per term — the basis of modern π computation algorithms.' },
      { title: 'Taxicab Numbers', description: "When Hardy arrived in taxicab 1729, Ramanujan instantly noted it's the smallest number expressible as a sum of two cubes in two ways: 1³+12³ = 9³+10³. A legend illustrating his unmatched intuition." },
      { title: 'Mock Theta Functions', description: 'Discovered just before his death, these mysterious functions eluded explanation for 90 years until unified with "mock modular forms" in 2002 — still being actively researched.' },
    ],
  },
  {
    id: 'turing',
    name: 'Alan Turing',
    birth: 1912,
    death: 1954,
    nationality: 'British',
    fields: ['Logic', 'Applied Math'],
    era: 'Modern',
    portraitFile: 'Alan_Turing_Aged_16.jpg',
    shortBio: "Alan Turing founded theoretical computer science and artificial intelligence, proved fundamental limits on what computers can compute, and broke the German Enigma code during WWII — an achievement credited with shortening the war by two years. He was prosecuted for homosexuality in 1952 and died at 41.",
    quote: 'We can only see a short distance ahead, but we can see plenty there that needs to be done.',
    contributions: [
      { title: 'Turing Machine', year: 1936, description: 'Invented the theoretical model of a Turing machine — a simple abstract device that can simulate any computer algorithm. This provided the mathematical foundation of all computation and computer science.' },
      { title: 'Halting Problem', year: 1936, description: 'Proved that no general algorithm can determine whether a given program will halt or run forever. This fundamental limit on computability has profound implications for mathematics and computer science.' },
      { title: 'Enigma Code Breaking', year: 1939, description: 'Led the mathematical team at Bletchley Park that broke the German Enigma cipher, designing the Bombe electromechanical device. Churchill credited this work with turning the tide of WWII.' },
      { title: 'Turing Test & AI', year: 1950, description: 'In "Computing Machinery and Intelligence," proposed the Turing Test to assess machine intelligence. This paper launched artificial intelligence as a field of research.' },
    ],
  },
];
