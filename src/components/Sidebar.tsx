import { useStore } from '../store';
import type { Page } from '../types';

interface Props {
  current: Page;
  onNav: (page: Page) => void;
  onClassModal: () => void;
}

function getClassEmoji(name: string): string {
  const n = name;
  if (/햇살|햇빛|해님/.test(n)) return '☀️';
  if (/달님|달빛|달/.test(n)) return '🌙';
  if (/별님|별빛|별/.test(n)) return '⭐';
  if (/무지개/.test(n)) return '🌈';
  if (/하늘/.test(n)) return '🌤️';
  if (/구름/.test(n)) return '☁️';
  if (/바람/.test(n)) return '🌬️';
  if (/새싹|씨앗/.test(n)) return '🌱';
  if (/나무/.test(n)) return '🌳';
  if (/꽃|장미|진달래|개나리/.test(n)) return '🌸';
  if (/민들레/.test(n)) return '🌻';
  if (/열매/.test(n)) return '🍎';
  if (/사랑/.test(n)) return '❤️';
  if (/토끼/.test(n)) return '🐰';
  if (/판다/.test(n)) return '🐼';
  if (/곰/.test(n)) return '🐻';
  if (/기린/.test(n)) return '🦒';
  if (/펭귄/.test(n)) return '🐧';
  if (/나비/.test(n)) return '🦋';
  if (/강아지|멍멍/.test(n)) return '🐶';
  if (/고양이|냥/.test(n)) return '🐱';
  if (/병아리|닭/.test(n)) return '🐥';
  if (/오리/.test(n)) return '🦆';
  if (/돼지/.test(n)) return '🐷';
  if (/코끼리/.test(n)) return '🐘';
  if (/사자/.test(n)) return '🦁';
  if (/호랑이|범/.test(n)) return '🐯';
  if (/여우/.test(n)) return '🦊';
  if (/늑대/.test(n)) return '🐺';
  if (/원숭이/.test(n)) return '🐒';
  if (/부엉이|올빼미/.test(n)) return '🦉';
  if (/독수리|매/.test(n)) return '🦅';
  if (/앵무/.test(n)) return '🦜';
  if (/홍학/.test(n)) return '🦩';
  if (/공작/.test(n)) return '🦚';
  if (/두루미|학/.test(n)) return '🕊️';
  if (/개구리/.test(n)) return '🐸';
  if (/거북이|거북/.test(n)) return '🐢';
  if (/고래/.test(n)) return '🐳';
  if (/돌고래/.test(n)) return '🐬';
  if (/물고기|금붕어/.test(n)) return '🐟';
  if (/문어/.test(n)) return '🐙';
  if (/사슴/.test(n)) return '🦌';
  if (/다람쥐/.test(n)) return '🐿️';
  if (/햄스터/.test(n)) return '🐹';
  if (/고슴도치/.test(n)) return '🦔';
  if (/수달/.test(n)) return '🦦';
  if (/너구리/.test(n)) return '🦝';
  if (/얼룩말/.test(n)) return '🦓';
  if (/하마/.test(n)) return '🦛';
  if (/캥거루/.test(n)) return '🦘';
  if (/꿀벌|벌/.test(n)) return '🐝';
  if (/무당벌레/.test(n)) return '🐞';
  if (/공룡/.test(n)) return '🦕';
  if (/상어/.test(n)) return '🦈';
  if (/봄/.test(n)) return '🌸';
  if (/여름/.test(n)) return '🌞';
  if (/가을/.test(n)) return '🍂';
  if (/겨울/.test(n)) return '❄️';
  return '🏫';
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
        <div className="brand-tagline">아이들의 모든 순간을 모아 기록하다 ✨</div>
        <div className="brand-name">MoaRok!</div>
        <div className="brand-sub">유아 알림장·관찰기록·평가 통합 플랫폼</div>
      </div>
      <div className="class-info" style={{ cursor: 'default' }}>
        <div className="class-badge">현재 반</div>
        <div className="class-name"><span>{className ? getClassEmoji(className) : '🏫'}</span><span>{className || '반 설정 필요'}</span></div>
      </div>
      <nav className="nav">
        <div className="nav-section">기록생성</div>
        {item('notify', '📮', '알림장')}
        {item('observe', '🔍', '관찰기록')}
        <div className="nav-divider" />
        <div className="nav-section">기록관리</div>
        {item('archive', '🗂️', '기록함')}
        {item('stats', '📊', '누적 현황')}
        <div className="nav-divider" />
        <div className="nav-section">설정</div>
        {item('home', '🏠', '홈')}
        {item('weeks', '📅', '주간활동')}
        {item('kids', '👧', '유아관리')}
        <div className="nav-item" onClick={onClassModal}><span className="icon">⚙️</span>반 설정</div>
      </nav>
    </div>
  );
}
