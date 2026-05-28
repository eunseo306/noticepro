import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { DOMAINS } from '../constants';

export default function StatsPage() {
  const { kids, records } = useStore();
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [kidIdx, setKidIdx] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const kidName = kids[kidIdx] || '';
  const monthRecs = records.filter(r => r.kidName === kidName && r.date?.startsWith(month));

  const domainCounts = Object.fromEntries(DOMAINS.map(d => [d.k, 0]));
  monthRecs.forEach(r => (r.domains || []).forEach(dk => { if (dk in domainCounts) domainCounts[dk]++; }));

  const total = Object.values(domainCounts).reduce((a, b) => a + b, 0);
  const maxVal = Math.max(...Object.values(domainCounts), 1);
  const notifyCount = monthRecs.filter(r => r.type === 'notify').length;
  const obsCount = monthRecs.filter(r => r.type === 'observe').length;
  const [yr, mo] = month.split('-');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const vals = DOMAINS.map(d => domainCounts[d.k]);
    const colors = DOMAINS.map(d => d.br);
    const sum = vals.reduce((a, b) => a + b, 0);
    const cx = 90, cy = 90, r = 75, ri = 45;
    ctx.clearRect(0, 0, 180, 180);
    if (sum === 0) {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = '#E5E3DC'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, ri, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
      ctx.fillStyle = '#a09f99'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('기록 없음', cx, cy);
      return;
    }
    let angle = -Math.PI / 2;
    vals.forEach((v, i) => {
      if (v === 0) return;
      const slice = (v / sum) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle, angle + slice); ctx.closePath();
      ctx.fillStyle = colors[i]; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, ri + 1, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
      angle += slice;
    });
    ctx.beginPath(); ctx.arc(cx, cy, ri, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.fillStyle = '#534AB7'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(sum), cx, cy - 7);
    ctx.fillStyle = '#a09f99'; ctx.font = '10px sans-serif';
    ctx.fillText('관찰', cx, cy + 10);
  });

  return (
    <div>
      <div className="pg-header">
        <div className="pg-title">누적 현황</div>
        <div className="pg-sub">유아별 누리과정 영역 관찰 현황을 확인해요.</div>
      </div>

      {!kids.length ? (
        <p className="empty-msg">유아관리 탭에서 유아를 먼저 등록해주세요</p>
      ) : <>
        <div className="stat-month-row">
          <label>월 선택</label>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={{ width: 160 }} />
        </div>

        <div className="stat-child-tabs">
          {kids.map((k, i) => (
            <div key={i} className={`stat-child-tab${kidIdx === i ? ' on' : ''}`} onClick={() => setKidIdx(i)}>{k}</div>
          ))}
        </div>

        <div className="stat-card">
          <div className="stat-title">{yr}년 {parseInt(mo)}월 · {kidName} 기록 요약</div>
          <div className="g3" style={{ marginBottom: 0 }}>
            <div className="stat-num-card"><div className="stat-num" style={{ color: 'var(--p)' }}>{monthRecs.length}</div><div className="stat-num-label">전체 기록</div></div>
            <div className="stat-num-card"><div className="stat-num" style={{ color: 'var(--t1)' }}>{notifyCount}</div><div className="stat-num-label">📮 알림장</div></div>
            <div className="stat-num-card"><div className="stat-num" style={{ color: 'var(--a1)' }}>{obsCount}</div><div className="stat-num-label">🔍 관찰기록</div></div>
          </div>
        </div>

        <div className="stat-card" style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 20, alignItems: 'center' }}>
          <div>
            <div className="stat-title" style={{ marginBottom: 16 }}>누리과정 영역별 관찰 횟수</div>
            {DOMAINS.map(d => {
              const cnt = domainCounts[d.k];
              const pct = Math.round(cnt / maxVal * 100);
              return (
                <div key={d.k} className="bar-row">
                  <div className="bar-label">{d.em} {d.k}</div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%`, background: d.br }} /></div>
                  <div className="bar-count" style={{ color: d.co }}>{cnt}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <canvas ref={canvasRef} width={180} height={180} />
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
              {DOMAINS.map(d => {
                const pct = total > 0 ? Math.round(domainCounts[d.k] / total * 100) : 0;
                return (
                  <div key={d.k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.br, flexShrink: 0, display: 'inline-block' }} />
                    <span style={{ color: 'var(--muted)', flex: 1 }}>{d.k}</span>
                    <span style={{ fontWeight: 700, color: d.co }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">영역별 카드</div>
          <div className="stat-grid">
            {DOMAINS.map(d => (
              <div key={d.k} className="stat-num-card" style={{ background: d.bg, border: `1px solid ${d.br}` }}>
                <div className="stat-num" style={{ color: d.co, fontSize: 22 }}>{domainCounts[d.k]}</div>
                <div style={{ fontSize: 9, color: d.co, fontWeight: 600, marginTop: 2 }}>{d.em} {d.k}</div>
              </div>
            ))}
          </div>
        </div>

        {monthRecs.length > 0 && (
          <div className="stat-card">
            <div className="stat-title">이달 기록 목록 ({monthRecs.length}건)</div>
            {[...monthRecs].reverse().map((r, i) => (
              <div key={i} className="card-sm" style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 11, color: 'var(--hint)', marginBottom: 3 }}>
                  {r.date} · {r.type === 'notify' ? '📮 알림장' : '🔍 관찰'}
                </div>
                {(r.domains || []).length > 0 && (
                  <div style={{ marginBottom: 4 }}>
                    {(r.domains || []).map(dk => {
                      const d = DOMAINS.find(x => x.k === dk);
                      return d ? <span key={dk} className="badge" style={{ background: d.bg, color: d.co, border: `1px solid ${d.br}`, marginRight: 3 }}>{d.em} {dk}</span> : null;
                    })}
                  </div>
                )}
                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
                  {r.body.slice(0, 80)}{r.body.length > 80 ? '...' : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </>}
    </div>
  );
}
