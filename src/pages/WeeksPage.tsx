import { useState } from 'react';
import { useStore } from '../store';
import { ACTIVITY_CATEGORIES } from '../constants';

type EditState = {
  name: string;
  mainTheme: string;
  subTheme: string;
  activities: Record<string, string[]>;
  actInputs: Record<string, string>;
};

export default function WeeksPage() {
  const { weeks, setWeeks, selWeekIdx, setSelWeekIdx } = useStore();
  const [wkName, setWkName] = useState('');
  const [wkMain, setWkMain] = useState('');
  const [wkSub, setWkSub] = useState('');
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editData, setEditData] = useState<EditState | null>(null);

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
    setEditIdx(null);
    setEditData(null);
  }

  function startEdit(i: number) {
    const w = weeks[i];
    setEditIdx(i);
    setEditData({
      name: w.name,
      mainTheme: w.mainTheme,
      subTheme: w.subTheme,
      activities: Object.fromEntries(
        Object.entries(w.activities).map(([k, v]) => [k, [...v]])
      ),
      actInputs: {},
    });
  }

  function saveEdit(i: number) {
    if (!editData) return;
    setWeeks(weeks.map((w, idx) => idx !== i ? w : {
      ...w,
      name: editData.name,
      mainTheme: editData.mainTheme,
      subTheme: editData.subTheme,
      activities: editData.activities,
    }));
    setEditIdx(null);
    setEditData(null);
  }

  function cancelEdit() {
    setEditIdx(null);
    setEditData(null);
  }

  function editAddAct(cat: string) {
    if (!editData) return;
    const val = (editData.actInputs[cat] || '').trim();
    if (!val) return;
    setEditData({
      ...editData,
      activities: { ...editData.activities, [cat]: [...(editData.activities[cat] || []), val] },
      actInputs: { ...editData.actInputs, [cat]: '' },
    });
  }

  function editDelAct(cat: string, ai: number) {
    if (!editData) return;
    setEditData({
      ...editData,
      activities: { ...editData.activities, [cat]: editData.activities[cat].filter((_, j) => j !== ai) },
    });
  }

  function setEditInput(cat: string, val: string) {
    if (!editData) return;
    setEditData({ ...editData, actInputs: { ...editData.actInputs, [cat]: val } });
  }

  return (
    <div>
      <div className="pg-header">
        <div className="pg-title">주간활동</div>
        <div className="pg-sub">주차별 대주제·소주제·활동 목록을 관리해요.</div>
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
        : weeks.map((w, i) => {
          const isEditing = editIdx === i;
          const ed = editData!;

          return (
            <div key={i} className={`week-card${selWeekIdx === i ? ' active' : ''}`}>
              {/* 헤더 */}
              <div className="week-hdr">
                <div style={{ flex: 1, minWidth: 0 }}>
                  {isEditing ? (
                    <input
                      value={ed.name}
                      onChange={e => setEditData({ ...ed, name: e.target.value })}
                      style={{ fontSize: 14, fontWeight: 700, color: selWeekIdx === i ? 'var(--p3)' : 'var(--text)', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0, padding: '1px 2px', width: '100%', outline: 'none', marginBottom: 6 }}
                    />
                  ) : (
                    <div className="week-name" style={{ color: selWeekIdx === i ? 'var(--p3)' : 'var(--text)', marginBottom: 5 }}>
                      {w.name}
                    </div>
                  )}
                  <div className="theme-row">
                    {isEditing ? (
                      <>
                        <input
                          value={ed.mainTheme}
                          onChange={e => setEditData({ ...ed, mainTheme: e.target.value })}
                          placeholder="대주제"
                          style={{ fontSize: 12, padding: '2px 7px', border: '1px solid #AFA9EC', borderRadius: 6, background: '#EEEDFE', color: '#3C3489', width: 110, outline: 'none' }}
                        />
                        <input
                          value={ed.subTheme}
                          onChange={e => setEditData({ ...ed, subTheme: e.target.value })}
                          placeholder="소주제"
                          style={{ fontSize: 12, padding: '2px 7px', border: '1px solid #5DCAA5', borderRadius: 6, background: '#E1F5EE', color: '#085041', width: 110, outline: 'none' }}
                        />
                      </>
                    ) : (
                      <>
                        {w.mainTheme && <span style={{ fontSize: 12, padding: '2px 7px', border: '1px solid #AFA9EC', borderRadius: 6, background: '#EEEDFE', color: '#3C3489' }}>{w.mainTheme}</span>}
                        {w.subTheme && <span style={{ fontSize: 12, padding: '2px 7px', border: '1px solid #5DCAA5', borderRadius: 6, background: '#E1F5EE', color: '#085041' }}>{w.subTheme}</span>}
                      </>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
                  {isEditing ? (
                    <>
                      <button
                        className="sbtn"
                        style={{ background: 'var(--p)', color: '#fff', borderColor: 'var(--p)' }}
                        onClick={() => saveEdit(i)}
                      >
                        저장
                      </button>
                      <button className="sbtn" onClick={cancelEdit}>취소</button>
                      <button className="icon-btn" onClick={() => delWeek(i)}>🗑</button>
                    </>
                  ) : (
                    <>
                      <button className={`use-btn${selWeekIdx === i ? ' on' : ''}`} onClick={() => setSelWeekIdx(i)}>
                        {selWeekIdx === i ? '✓ 사용중' : '이번 주로'}
                      </button>
                      <button className="sbtn" onClick={() => startEdit(i)}>수정</button>
                    </>
                  )}
                </div>
              </div>

              {/* 활동 카테고리별 */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(() => {
                  const cats = isEditing
                    ? ACTIVITY_CATEGORIES
                    : ACTIVITY_CATEGORIES.filter(cat => (w.activities?.[cat] || []).length > 0);

                  if (!isEditing && cats.length === 0) {
                    return (
                      <p style={{ fontSize: 12, color: 'var(--hint)', margin: 0 }}>
                        활동이 없어요. 수정 버튼을 눌러 추가해보세요.
                      </p>
                    );
                  }

                  return cats.map(cat => {
                    const items = isEditing ? (ed.activities[cat] || []) : (w.activities?.[cat] || []);
                    return (
                      <div key={cat} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', width: 82, flexShrink: 0, paddingTop: 4, lineHeight: 1.3 }}>
                          {cat}
                        </span>
                        <div style={{ flex: 1 }}>
                          {items.length > 0 && (
                            <div className="act-chips" style={{ marginBottom: isEditing ? 4 : 0 }}>
                              {items.map((a, j) => (
                                <span key={j} className="act-chip">
                                  {a}
                                  {isEditing && (
                                    <span className="del" onClick={() => editDelAct(cat, j)}>×</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          )}
                          {isEditing && (
                            <div className="add-row">
                              <input
                                type="text"
                                value={ed.actInputs[cat] || ''}
                                onChange={e => setEditInput(cat, e.target.value)}
                                placeholder="활동 입력 후 Enter"
                                onKeyUp={e => e.key === 'Enter' && editAddAct(cat)}
                                style={{ fontSize: 12, padding: '5px 9px' }}
                              />
                              <button className="add-btn" onClick={() => editAddAct(cat)} style={{ fontSize: 12, padding: '0 10px' }}>+</button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          );
        })
      }
    </div>
  );
}
