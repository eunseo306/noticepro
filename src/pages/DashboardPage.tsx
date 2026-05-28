import { useState } from 'react';
import { useStore } from '../store';
import { DOMAINS } from '../constants';
import type { Page } from '../types';

interface Props {
  onNav: (page: Page) => void;
}

const TOTAL_DOMAINS = DOMAINS.length; // 5

export default function DashboardPage({ onNav }: Props) {
  const { className, kids, records } = useStore();
  const now = new Date();
  const [month, setMonth] = useState(() =>
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  );

  const [yr, mo] = month.split('-');
  const monthLabel = `${yr}년 ${parseInt(mo)}월`;

  const months = Array.from({ length: 4 }, (_, i) => {
    const d = new Date(parseInt(yr), parseInt(mo) - 1 - (3 - i));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  function moLabel(m: string) {
    return `${parseInt(m.split('-')[1])}월`;
  }

  // 해당 아이의 해당 월 기록에서 커버된 누리과정 영역 Set 반환
  function coveredDomains(name: string, m: string): Set<string> {
    const recs = records.filter(r => r.kidName === name && r.date?.startsWith(m));
    const covered = new Set<string>();
    recs.forEach(r => (r.domains || []).forEach(d => covered.add(d)));
    return covered;
  }

  const monthRecs = records.filter(r => r.date?.startsWith(month));
  const totalCount = monthRecs.length;
  const notifyCount = monthRecs.filter(r => r.type === 'notify').length;
  const obsCount = monthRecs.filter(r => r.type === 'observe').length;

  const completedKids = kids.filter(k => coveredDomains(k, month).size === TOTAL_DOMAINS);
  const missingKids = kids.filter(k => coveredDomains(k, month).size === 0);

  return (
    <div>
      <div className="pg-header">
        <div className="pg-title">홈</div>
        <div className="pg-sub">{className || '우리반'} 기록 현황을 한눈에 확인해보세요.</div>
      </div>

      {!kids.length ? (
        <div className="card" style={{ textAlign: 'center', padding: '36px 18px' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👧</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>아직 등록된 유아가 없어요</div>
          <div style={{ fontSize: 12, color: 'var(--hint)', marginBottom: 18 }}>유아 관리에서 먼저 이름을 등록해주세요</div>
          <button className="sbtn" onClick={() => onNav('kids')}>유아 관리로 이동 →</button>
        </div>
      ) : (
        <>
          {/* 월 선택 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>기준 월</span>
            <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={{ width: 160 }} />
          </div>

          {/* 요약 */}
          <div className="g3" style={{ marginBottom: 12 }}>
            <div className="stat-num-card">
              <div className="stat-num" style={{ color: 'var(--p)' }}>{totalCount}</div>
              <div className="stat-num-label">전체 기록</div>
            </div>
            <div className="stat-num-card">
              <div className="stat-num" style={{ color: 'var(--t1)' }}>{notifyCount}</div>
              <div className="stat-num-label">📮 알림장</div>
            </div>
            <div className="stat-num-card">
              <div className="stat-num" style={{ color: 'var(--a1)' }}>{obsCount}</div>
              <div className="stat-num-label">🔍 관찰기록</div>
            </div>
          </div>

          {/* 미기록 알림 */}
          {missingKids.length > 0 && (
            <div style={{ background: '#FAEEDA', border: '1px solid var(--a3)', borderRadius: 'var(--radius)', padding: '11px 16px', marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 18, lineHeight: 1.4 }}>⚠️</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--a4)', marginBottom: 2 }}>
                  {monthLabel} 기록 없는 유아 {missingKids.length}명
                </div>
                <div style={{ fontSize: 12, color: 'var(--a4)' }}>{missingKids.join(', ')}</div>
              </div>
            </div>
          )}

          {/* 아이별 누리과정 영역 현황 */}
          <div className="stat-card">
            <div className="stat-title">
              {monthLabel} · 유아별 누리과정 영역 현황
              <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--hint)', marginLeft: 8 }}>
                {completedKids.length}/{kids.length}명 기록완료
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {kids.map(k => {
                const covered = coveredDomains(k, month);
                const count = covered.size;
                const done = count === TOTAL_DOMAINS;
                const empty = count === 0;
                return (
                  <div key={k} style={{
                    border: `1px solid ${done ? 'var(--t3)' : empty ? 'var(--a3)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px 12px',
                    background: done ? 'var(--t2)' : empty ? '#FAEEDA' : 'var(--bg)',
                    textAlign: 'center',
                  }}>
                    {/* 이름 */}
                    <div style={{ fontSize: 13, fontWeight: 700, color: done ? 'var(--t4)' : empty ? 'var(--a4)' : 'var(--text)', marginBottom: 5 }}>
                      {k}
                    </div>
                    {/* 상태 배지 */}
                    <div style={{ marginBottom: 10 }}>
                      {done ? (
                        <span style={{ fontSize: 10, background: 'var(--t1)', color: '#fff', borderRadius: 999, padding: '2px 8px', fontWeight: 700 }}>기록완료</span>
                      ) : empty ? (
                        <span style={{ fontSize: 10, background: 'var(--a1)', color: '#fff', borderRadius: 999, padding: '2px 8px', fontWeight: 600 }}>미기록</span>
                      ) : (
                        <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>{count}/{TOTAL_DOMAINS} 영역</span>
                      )}
                    </div>
                    {/* 누리과정 영역 뱃지 */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                      {DOMAINS.map(d => {
                        const has = covered.has(d.k);
                        return (
                          <span key={d.k} style={{
                            fontSize: 10, padding: '2px 7px', borderRadius: 999, fontWeight: 600,
                            background: has ? d.bg : 'var(--card)',
                            color: has ? d.co : 'var(--hint)',
                            border: `1px solid ${has ? d.br : 'var(--border)'}`,
                          }}>
                            {d.em} {d.k}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 최근 4개월 테이블 */}
          <div className="stat-card">
            <div className="stat-title">최근 4개월 · 유아별 영역 달성 현황</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '6px 10px', color: 'var(--hint)', fontWeight: 600, borderBottom: '1px solid var(--border)', minWidth: 60 }}>유아</th>
                    {months.map(m => (
                      <th key={m} style={{
                        textAlign: 'center', padding: '6px 12px',
                        color: m === month ? 'var(--p3)' : 'var(--hint)',
                        fontWeight: m === month ? 700 : 600,
                        borderBottom: '1px solid var(--border)',
                        background: m === month ? 'var(--p1)' : 'transparent',
                      }}>
                        {moLabel(m)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {kids.map((k, ki) => (
                    <tr key={k} style={{ background: ki % 2 === 0 ? 'transparent' : 'var(--bg)' }}>
                      <td style={{ padding: '7px 10px', fontWeight: 600, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>{k}</td>
                      {months.map(m => {
                        const cnt = coveredDomains(k, m).size;
                        const done = cnt === TOTAL_DOMAINS;
                        const isCur = m === month;
                        return (
                          <td key={m} style={{ textAlign: 'center', padding: '7px 12px', borderBottom: '1px solid var(--border)', background: isCur ? 'rgba(83,74,183,.04)' : 'transparent' }}>
                            {cnt === 0 ? (
                              <span style={{ color: 'var(--hint)' }}>–</span>
                            ) : done ? (
                              <span style={{ fontSize: 10, background: 'var(--t1)', color: '#fff', borderRadius: 999, padding: '2px 7px', fontWeight: 700 }}>완료</span>
                            ) : (
                              <span style={{ fontWeight: 700, color: 'var(--muted)' }}>{cnt}/{TOTAL_DOMAINS}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 바로가기 */}
          <div className="stat-card">
            <div className="stat-title" style={{ marginBottom: 10 }}>바로가기</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="sbtn" onClick={() => onNav('notify')}>📮 알림장 작성</button>
              <button className="sbtn" onClick={() => onNav('observe')}>🔍 관찰기록 작성</button>
              <button className="sbtn" onClick={() => onNav('archive')}>🗂️ 기록함</button>
              <button className="sbtn" onClick={() => onNav('stats')}>📊 누적 현황</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
