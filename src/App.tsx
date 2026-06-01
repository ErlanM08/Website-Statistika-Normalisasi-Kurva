import { Routes, Route } from 'react-router-dom';
import { ChartPanel } from './components/ChartPanel';
import { FormulaPanel } from './components/FormulaPanel';
import { KpiGrid } from './components/KpiGrid';
import { Sidebar } from './components/Sidebar';
import { TableDetail } from './components/TableDetail';
import { TopBar } from './components/TopBar';
import { TourOverlay } from './components/TourOverlay';
import { useDataStore } from './store/useDataStore';

function Dashboard() {
  const isFormulaVisible = useDataStore((state) => state.isFormulaVisible);

  return (
    <div className="min-h-dvh bg-surface dark:bg-slate-950">
      <Sidebar />
      <main className="lg:pl-[400px]">
        <TopBar />
        <div id="report-root" className="space-y-6 p-5 lg:p-10">
          <KpiGrid />
          <div className={isFormulaVisible ? 'grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]' : 'grid gap-6'}>
            <ChartPanel />
            <FormulaPanel />
          </div>
          <TableDetail />
        </div>
      </main>
      <TourOverlay />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
}
