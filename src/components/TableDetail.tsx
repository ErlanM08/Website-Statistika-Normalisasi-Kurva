import { useDataStore } from '../store/useDataStore';
import { formatCalculated, formatIntegerInput, formatUserInput } from '../utils/formatters';
import { Button } from './ui/Button';

const headers = [
  ['No.', 'Nomor urut baris perhitungan'],
  ['Xi', 'Nilai data atau titik tengah kelas'],
  ['fi', 'Frekuensi observasi'],
  ['fi[%]', 'Frekuensi relatif: fi dibagi total n dikali 100%'],
  ['Fi', 'Frekuensi kumulatif absolut sampai baris ini'],
  ['Fi[%]', 'Frekuensi kumulatif relatif sampai baris ini'],
  ['u', 'Nilai inverse CDF normal standar dari Fi[%]'],
  ['u Interpolasi', 'Hasil regresi OLS: u_int = m.Xi + b'],
  ["P{u'}", 'PDF normal standar berdasarkan u interpolasi'],
  ["P{x'}", "PDF pada skala data asli: P{u'} dibagi sigma teoritik"],
  ["f{x'}", "Frekuensi teoritis normal: P{x'} x delta x n"],
];

export function TableDetail() {
  const results = useDataStore((state) => state.results);
  const visible = useDataStore((state) => state.isTableVisible);
  const toggleTable = useDataStore((state) => state.toggleTable);
  const totals = results
    ? {
        fi: results.tableRows.reduce((sum, row) => sum + row.fi, 0),
        fiPercent: results.tableRows.reduce((sum, row) => sum + row.fiPercent, 0),
        FiAbsolute: results.tableRows.reduce((sum, row) => sum + row.FiAbsolute, 0),
        fxPrime: results.tableRows.reduce((sum, row) => sum + row.fxPrime, 0),
      }
    : null;

  return (
    <section className="card overflow-hidden" data-tour-id="table-detail">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-semibold">Tabel Hasil Perhitungan</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">11 kolom hasil perhitungan normalisasi kurva.</p>
        </div>
        <Button variant="secondary" onClick={toggleTable}>
          {visible ? 'Sembunyikan Tabel Detail' : 'Lihat Tabel Detail'}
        </Button>
      </div>

      {visible ? (
        <div className="max-h-[520px] overflow-auto">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="sticky top-0 z-10 bg-[#00bfa5] text-xs font-bold uppercase text-white shadow-sm">
              <tr>
                {headers.map(([label, title]) => (
                  <th key={label} className="whitespace-nowrap px-4 py-3 font-bold" title={title}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results?.tableRows.map((row, index) => (
                <tr key={row.no} className={index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-teal-50/60 dark:bg-slate-800/70'}>
                  <td className="px-4 py-3">{row.no.toString()}</td>
                  <td className="px-4 py-3">{formatUserInput(row.xi)}</td>
                  <td className="px-4 py-3">{formatIntegerInput(row.fi)}</td>
                  <td className="px-4 py-3">{formatCalculated(row.fiPercent)}</td>
                  <td className="px-4 py-3">{formatIntegerInput(row.FiAbsolute)}</td>
                  <td className="px-4 py-3">{formatCalculated(row.FiPercent)}</td>
                  <td className="px-4 py-3">{row.isExcluded ? '∞' : formatCalculated(row.u)}</td>
                  <td className="px-4 py-3">{formatCalculated(row.uInterpolasi)}</td>
                  <td className="px-4 py-3">{row.isExcluded ? '0' : formatCalculated(row.Pu)}</td>
                  <td className="px-4 py-3">{row.isExcluded ? '0' : formatCalculated(row.Px)}</td>
                  <td className="px-4 py-3 font-semibold text-teal-700 dark:text-teal-100">{row.isExcluded ? '0' : formatCalculated(row.fxPrime)}</td>
                </tr>
              )) ?? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={11}>
                    Belum ada hasil analisis.
                  </td>
                </tr>
              )}
            </tbody>
            {totals ? (
              <tfoot className="sticky bottom-0 bg-slate-100 text-sm font-bold text-slate-900 dark:bg-slate-800 dark:text-white">
                <tr>
                  <td className="px-4 py-3">TOTAL</td>
                  <td className="px-4 py-3">--</td>
                  <td className="px-4 py-3">{formatIntegerInput(totals.fi)}</td>
                  <td className="px-4 py-3">{formatCalculated(totals.fiPercent)}</td>
                  <td className="px-4 py-3">{formatIntegerInput(totals.FiAbsolute)}</td>
                  <td className="px-4 py-3">--</td>
                  <td className="px-4 py-3">--</td>
                  <td className="px-4 py-3">--</td>
                  <td className="px-4 py-3">--</td>
                  <td className="px-4 py-3">--</td>
                  <td className="px-4 py-3 text-teal-700 dark:text-teal-100">{formatCalculated(totals.fxPrime)}</td>
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>
      ) : null}
    </section>
  );
}
