import { useState } from 'react';
import { useStore } from '../store';
import { ACTIVITY_CATEGORIES } from '../constants';

export default function WeeksPage() {
  const { weeks, setWeeks, selWeekIdx, setSelWeekIdx } = useStore();
  const [wkName, setWkName] = useState('');
  const [wkMain, setWkMain] = useState('');
  const [wkSub, setWkSub] = useState('');
  // actInputs[weekIdx][category] = current input value
  const [actInputs, setActInputs] = useState<Record<number, Record<string, string>>>({});

  function addWeek() {
    if (!wkName.trim()) return;
    const emptyActs = Object.fromEntries(ACTIVITY_CATEGORIES.map(c => [c, []]));
    setWeeks([...weeks, { name: wkName.trim(), mainTheme: wkMain.trim(), subTheme: wkSub.trim(), activities: emptyActs }]);
    setWkName(''); setWkMain(''); setWkSub('');
  }

  function delWeek(i: number) {
    setWeeks(weeks.filter((_, idx) => idx !== i));
    if (selWeekIdx === i) setSelWeekIdx(null);
    else if (selWeekIdx !== null && selWeekIdx > i) setSelWeekIdx(selWeekIdx - 1);
  }

  function addAct(wi: number, cat: string) {
    const val = (actInputs[wi]?.[cat] || '').trim();
    if (!val) return;
    setWeeks(weeks.map((w, idx) => idx !== wi ? w : {
      ...w,
      activities: { ...w.activities, [cat]: [...(w.activities[cat] || []), val] },
    }));
    setActInputs(prev => ({ ...prev, [wi]: { ...prev[wi], [cat]: '' } }));
  }

  function delAct(wi: number, cat: string, ai: number) {
    setWeeks(weeks.map((w, idx) => idx !== wi ? w : {
      ...w,
      activities: { ...w.activities, [cat]: w.activities[cat].filter((_, j) => j !== ai) },
    }));
  }

  function setInput(wi: number, cat: string, val: string) {
    setActInputs(prev => ({ ...prev, [wi]: { ...prev[wi], [cat]: val } }));
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
            <input value={wkName} onChange={e => setWkName(e.target.value)} placeholder="예: 5월 3주차" onKeyUp={e => e.key === 'Enter' && addWeek()} />
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
            {/* 헤더 */}
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

            {/* 활동 카테고리별 */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ACTIVITY_CATEGORIES.map(cat => {
                const items = w.activities?.[cat] || [];
                const inputVal = actInputs[i]?.[cat] || '';
                return (
                  <div key={cat} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', width: 82, flexShrink: 0, paddingTop: 6, lineHeight: 1.3 }}>
                      {cat}
                    </span>
                    <div style={{ flex: 1 }}>
                      {items.length > 0 && (
                        <div className="act-chips" style={{ marginBottom: 4 }}>
                          {items.map((a, j) => (
                            <span key={j} className="act-chip">
                              {a}<span className="del" onClick={() => delAct(i, cat, j)}>×</span>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="add-row">
                        <input
                          type="text"
                          value={inputVal}
                          onChange={e => setInput(i, cat, e.target.value)}
                          placeholder="활동 입력 후 Enter"
                          onKeyUp={e => e.key === 'Enter' && addAct(i, cat)}
                          style={{ fontSize: 12, padding: '5px 9px' }}
                        />
                        <button className="add-btn" onClick={() => addAct(i, cat)} style={{ fontSize: 12, padding: '0 10px' }}>+</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      }
    </div>
  );
}
