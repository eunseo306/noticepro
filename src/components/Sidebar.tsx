import { useStore } from '../store';
import type { Page } from '../types';

interface Props {
  current: Page;
  onNav: (page: Page) => void;
  onClassModal: () => void;
}

export default function Sidebar({ current, onNav, onClassModal }: Props) {
  const { className } = useStore();
  const item = (page: Page, icon: string, label: string) => (
    <div className={`nav-item${current === page ? ' on' : ''}`} onClick={() => onNav(page)}>
      <span className="icon">{icon}</span>{label}
    </div>
  );

  return (
    <div className="sidebar">
      <div className="brand">
        <div className="brand-name">유아기록 Pro</div>
        <div className="brand-sub">놀이 · 관찰 · 누리과정 평가</div>
      </div>
      <div className="class-info" onClick={onClassModal}>
        <div className="class-badge">현재 반</div>
        <div className="class-name"><span>🌻</span><span>{className || '반 설정 필요'}</span></div>
      </div>
      <nav className="nav">
        <div className="nav-section">수업 관리</div>
        {item('weeks', '📅', '주간활동')}
        {item('notify', '📮', '알림장')}
        <div className="nav-divider" />
        <div className="nav-section">기록 · 평가</div>
        {item('observe', '🔍', '관찰기록')}
        {item('archive', '🗂️', '기록함')}
        {item('stats', '📊', '누적 현황')}
        <div className="nav-divider" />
        <div className="nav-section">설정</div>
        {item('kids', '👧', '유아관리')}
        <div className="nav-item" onClick={onClassModal}><span className="icon">⚙️</span>반 설정</div>
      </nav>
    </div>
  );
}
