import { useState } from 'react';
import { useStore } from '../store';

export default function WeeksPage() {
  const { weeks, setWeeks, selWeekIdx, setSelWeekIdx } = useStore();
  const [wkName, setWkName] = useState('');
  const [wkMain, setWkMain] = useState('');
  const [wkSub, setWkSub] = useState('');
  const [actInputs, setActInputs] = useState<Record<number, string>>({});

  function addWeek() {
    if (!wkName.trim()) return;
    setWeeks([...weeks, { name: wkName.trim(), mainTheme: wkMain.trim(), subTheme: wkSub.trim(), activities: [] }]);
    setWkName(''); setWkMain(''); setWkSub('');
  }

  function delWeek(i: number) {
    setWeeks(weeks.filter((_, idx) => idx !== i));
    if (selWeekIdx === i) setSelWeekIdx(null);
    else if (selWeekIdx !== null && selWeekIdx > i) setSelWeekIdx(selWeekIdx - 1);
  }

  function addAct(i: number) {
    const val = (actInputs[i] || '').trim();
    if (!val) return;
    setWeeks(weeks.map((w, idx) => idx === i ? { ...w, activities: [...w.activities, val] } : w));
    setActInputs(prev => ({ ...prev, [i]: '' }));
  }

  function delAct(wi: number, ai: number) {
    setWeeks(weeks.map((w, idx) => idx === wi ? { ...w, activities: w.activities.filter((_, j) => j !== ai) } : w));
  }

  return (
    <div>
      <div className="pg-header">
        <div className="pg-title">주간활동 관리</div>
        <div className="pg-sub">주차별 대주제·소주제·활동 목록을 등록하고 이번 주로 설정해요</div>
      </div>

      <div className="nwk-form">
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 10 }}>+ 새 주차 추가</div>
        <div className="g3" style={{ marginBottom: 10 }}>
          <div className="sec" style={{ margin: 0 }}>
            <label>주차 이름 *</label>
            <input value={wkName} onChange={e => setWkName(e.target.value)} placeholder="예: 5월 3주차" onKeyDown={e => e.key === 'Enter' && addWeek()} />
          </div>
          <div className="sec" style={{ margin: 0 }}>
            <label>대주제</label>
            <input value={wkMain} onChange={e => setWkMain(e.target.value)} placeholder="예: 봄과 자연" />
          </div>
          <div className="sec" style={{ margin: 0 }}>
            <label>소주제</label>
            <input value={wkSub} onChange={e => setWkSub(e.target.value)} placeholder="예: 봄꽃과 곤충" />
          </div>
        </div>
        <button className="sbtn" onClick={addWeek}>+ 주차 생성</button>
      </div>

      {weeks.length === 0
        ? <p className="empty-msg">등록된 주차가 없어요.<br />위에서 새 주차를 추가해보세요.</p>
        : weeks.map((w, i) => (
          <div key={i} className={`week-card${selWeekIdx === i ? ' active' : ''}`}>
            <div className="week-hdr">
              <div>
                <div className="week-name">{w.name}</div>
                <div className="theme-row">
                  {w.mainTheme && <span className="tmb" style={{ background: '#EEEDFE', color: '#3C3489', border: '1px solid #AFA9EC' }}>대: {w.mainTheme}</span>}
                  {w.subTheme && <span className="tmb" style={{ background: '#E1F5EE', color: '#085041', border: '1px solid #5DCAA5' }}>소: {w.subTheme}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <button className={`use-btn${selWeekIdx === i ? ' on' : ''}`} onClick={() => setSelWeekIdx(i)}>
                  {selWeekIdx === i ? '✓ 사용중' : '이번 주로'}
                </button>
                <button className="icon-btn" onClick={() => delWeek(i)}>🗑</button>
              </div>
            </div>
            <div className="act-chips" style={{ marginBottom: 8 }}>
              {w.activities.map((a, j) => (
                <span key={j} className="act-chip">{a}<span className="del" onClick={() => delAct(i, j)}>×</span></span>
              ))}
            </div>
            <div className="add-row">
              <input
                type="text"
                value={actInputs[i] || ''}
                onChange={e => setActInputs(prev => ({ ...prev, [i]: e.target.value }))}
                placeholder="활동 추가 (Enter)"
                onKeyDown={e => e.key === 'Enter' && addAct(i)}
                style={{ fontSize: 12 }}
              />
              <button className="add-btn" onClick={() => addAct(i)} style={{ fontSize: 12 }}>+ 추가</button>
            </div>
          </div>
        ))
      }
    </div>
  );
}
