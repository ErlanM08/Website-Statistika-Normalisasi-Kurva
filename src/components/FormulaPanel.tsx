import { Calculator, Sigma, TrendingUp } from 'lucide-react';
import { type ReactNode } from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import { useDataStore } from '../store/useDataStore';
import { formatNumber } from '../utils/format';

interface FormulaStep {
  no: string;
  title: string;
  formula: ReactNode;
  value: string;
}

export function FormulaPanel() {
  const results = useDataStore((state) => state.results);
  const visible = useDataStore((state) => state.isFormulaVisible);
  if (!visible) return null;

  const steps: FormulaStep[] = [
    {
      no: '1',
      title: 'fi[%]',
      formula: <BlockMath math={`f_i[\\%] = \\frac{f_i}{n} \\times 100\\%`} />,
      value: results ? `n = ${results.n}` : '--',
    },
    {
      no: '2',
      title: 'Fi[%]',
      formula: <BlockMath math={`F_i[\\%] = \\sum_{k=1}^{i} f_k[\\%]`} />,
      value: results ? `${formatNumber(results.tableRows[results.tableRows.length - 1]?.FiPercent)}%` : '--',
    },
    {
      no: '3',
      title: 'u',
      formula: (
        <>
          <BlockMath math={`u_i = \\frac{u_b - u_a}{P_b - P_a} \\times (F_i - P_a) + u_a`} />
          <FormulaNote>
            Jika Fi[%] = 100% maka <InlineMath math={`u = \\infty`} />
          </FormulaNote>
        </>
      ),
      value: 'Fi[%] = 100% menghasilkan infinity',
    },
    {
      no: '4',
      title: 'u Interpolasi',
      formula: (
        <>
          <BlockMath math={`u_{int} = m \\cdot X_i + b`} />
          <BlockMath math={`m = \\frac{n\\sum X_i u_i - \\sum X_i \\sum u_i}{n\\sum X_i^2 - (\\sum X_i)^2}`} />
          <BlockMath math={`b = \\bar{u} - m \\cdot \\bar{X}`} />
        </>
      ),
      value: results ? `m=${formatNumber(results.regression.m)}, b=${formatNumber(results.regression.b)}` : '--',
    },
    {
      no: '5',
      title: "P(U')",
      formula: <BlockMath math={`P(U') = \\frac{1}{\\sqrt{2\\pi}} \\cdot e^{-\\frac{u_{int}^2}{2}}`} />,
      value: results ? `berdasarkan u interpolasi; sigma=${formatNumber(results.stdTeoritik)}` : '--',
    },
    {
      no: '6',
      title: "P(X')",
      formula: (
        <>
          <BlockMath math={`P(X') = \\frac{P(U')}{\\sigma'}`} />
          <FormulaNote>
            <InlineMath math={`\\sigma'`} /> adalah deviasi standar teoritik.
          </FormulaNote>
        </>
      ),
      value: results ? `sigma=${formatNumber(results.stdTeoritik)}` : '--',
    },
    {
      no: '7',
      title: "F(X')",
      formula: (
        <>
          <BlockMath math={`F(X') = P(X') \\times \\Delta \\times n`} />
          <FormulaNote>
            <InlineMath math={`\\Delta`} /> = selisih antar nilai Xi yang berurutan
          </FormulaNote>
        </>
      ),
      value: results ? `Delta=${formatNumber(results.delta)}` : '--',
    },
    {
      no: '8',
      title: "Harga Rata-Rata Teoritik (x̄')",
      formula: <BlockMath math={`\\bar{x}' \\Rightarrow u_{int} = 0 \\Rightarrow \\bar{x}' = \\frac{-b}{m}`} />,
      value: formatNumber(results?.meanTeoritik),
    },
    {
      no: '9',
      title: "Deviasi Standar Teoritik (σ')",
      formula: (
        <>
          <BlockMath math={`\\sigma' = \\bar{x}' - x_{(u=-1)}`} />
          <FormulaNote>x saat u interpolasi = -1, dari persamaan regresi</FormulaNote>
        </>
      ),
      value: formatNumber(results?.stdTeoritik),
    },
  ];

  return (
    <aside className="card overflow-hidden">
      <div className="border-b border-slate-100 p-6 dark:border-slate-800">
        <h2 className="text-xl font-semibold">Rumus & Keterangan</h2>
        <p className="text-sm tracking-wide text-slate-500 dark:text-slate-400">Pipeline Empirical Distribution Fitting</p>
      </div>
      <div className="space-y-4 p-6">
        {steps.map(({ no, title, formula, value }) => (
          <article key={no} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
            <p className="mb-2 flex items-center gap-2 font-bold text-teal-800 dark:text-teal-100">
              {no === '4' ? <TrendingUp className="size-4" /> : no === '9' ? <Sigma className="size-4" /> : <Calculator className="size-4" />}
              {no}. {title}
            </p>
            <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800">{formula}</div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Nilai aktual: <span className="font-semibold text-teal-700 dark:text-teal-100">{value}</span>
            </p>
          </article>
        ))}
      </div>
    </aside>
  );
}

function FormulaNote({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">{children}</p>;
}
