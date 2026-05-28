import { useState, useEffect } from 'react';
import { AppProvider, useStore } from './store';
import Sidebar from './components/Sidebar';
import ClassModal from './components/ClassModal';
import DashboardPage from './pages/DashboardPage';
import WeeksPage from './pages/WeeksPage';
import NotifyPage from './pages/NotifyPage';
import ObservePage from './pages/ObservePage';
import ArchivePage from './pages/ArchivePage';
import StatsPage from './pages/StatsPage';
import KidsPage from './pages/KidsPage';
import type { Page } from './types';

function AppContent() {
  const { className } = useStore();
  const [page, setPage] = useState<Page>('home');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!className) setTimeout(() => setShowModal(true), 400);
  }, []);

  return (
    <div className="layout">
      <Sidebar current={page} onNav={setPage} onClassModal={() => setShowModal(true)} />
      <div className="main">
        <div className="main-inner">
          {page === 'home'    && <DashboardPage onNav={setPage} />}
          {page === 'weeks'   && <WeeksPage />}
          {page === 'notify'  && <NotifyPage />}
          {page === 'observe' && <ObservePage />}
          {page === 'archive' && <ArchivePage />}
          {page === 'stats'   && <StatsPage />}
          {page === 'kids'    && <KidsPage />}
        </div>
      </div>
      {showModal && <ClassModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
