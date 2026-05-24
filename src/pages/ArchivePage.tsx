import { useState } from 'react';
import { useStore } from '../store';
import { callAnthropic } from '../api';
import { DOMAINS } from '../constants';
import type { AppRecord } from '../types';

export default function ArchivePage() {
  const { kids, records, setRecords } = useStore();
  const [arcEvalKid, setArcEvalKid] = useState<number | null>(null);
  const [period, setPeriod] = useState('all');
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalResult, setEvalResult] = useState<Record<string, { level: string; eval: string }> | null>(null);
  const [cumEditTexts, setCumEditTexts] = useState<Record<string, string>>({});
  const [kidFilter, setKidFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [openForms, setOpenForms] = useState<Record<number, boolean>>({});
  const [evalInputs, setEvalInputs] = useState<Record<number, string>>({});
  const [genLoading, setGenLoading] = useState<Record<number, boolean>>({});

  function getEvalRecs(kidName: string, p: string): AppRecord[] {
    const now = new Date();
    return records.filter(r => {
      if (r.kidName !== kidName || !r.date) return false;
      if (p === 'month') { const d = new Date(r.date); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(); }
      if (p === 'semester1') { const m = new Date(r.date).getMonth() + 1; return m >= 3 && m <= 8; }
      if (p === 'semester2') { const m = new Date(r.date).getMonth() + 1; return m >= 9 || m <= 2; }
      return true;
    });
  }

  async function genCumulativeEval() {
    if (arcEvalKid === null) { alert('유아를 선택해주세요'); return; }
    const kidName = kids[arcEvalKid];
    const recs = getEvalRecs(kidName, period);
    if (!recs.length) { alert('해당 기간에 저장된 기록이 없어요'); return; }

    const periodLabel = { all: '전체 기간', month: '이번 달', semester1: '1학기', semester2: '2학기' }[period] ?? '전체 기간';
    const recsSummary = recs.map((r, i) =>
      `[${i + 1}] ${r.date} · ${r.type === 'notify' ? '알림장' : '관찰'} · 영역:${(r.domains || []).join(',') || '없음'}\n${r.body}`
    ).join('\n\n');

    const prompt = `유아교육 전문가로서 아래 ${kidName} 유아의 ${periodLabel} 누적 기록 ${recs.length}건을 종합 분석하고, 누리과정 5개 영역별 발달 평가문을 작성해주세요.

[누적 기록]
${recsSummary}

[출력 형식 - JSON만 출력, 다른 설명 없이]
{
  "신체운동·건강": {"level":"잘함 또는 보통 또는 노력필요","eval":"${kidName}이(가) ~하는 모습을 보임 형태로 2~3문장 서술형 평가"},
  "의사소통": {"level":"잘함 또는 보통 또는 노력필요","eval":"2~3문장"},
  "사회관계": {"level":"잘함 또는 보통 또는 노력필요","eval":"2~3문장"},
  "예술경험": {"level":"잘함 또는 보통 또는 노력필요","eval":"2~3문장"},
  "자연탐구": {"level":"잘함 또는 보통 또는 노력필요","eval":"2~3문장"}
}
관찰 기록이 부족한 영역은 level을 보통으로, eval에 관찰 기회가 제한적이었음을 자연스럽게 포함할 것.`;

    setEvalLoading(true);
    setEvalResult(null);
    try {
      const raw = await callAnthropic([{ role: 'user', content: prompt }], { maxTokens: 2000 });
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      setEvalResult(parsed);
      const texts: Record<string, string> = {};
      DOMAINS.forEach(d => { if (parsed[d.k]) texts[d.k] = parsed[d.k].eval; });
      setCumEditTexts(texts);
    } catch { alert('오류가 발생했습니다. 다시 시도해주세요.'); }
    setEvalLoading(false);
  }

  function copyAllCumEval() {
    const lines = DOMAINS.map(d => cumEditTexts[d.k] ? `[${d.k}]\n${cumEditTexts[d.k]}` : '').filter(Boolean);
    navigator.clipboard.writeText(lines.join('\n\n'));
  }

  function toggleForm(idx: number) {
    setOpenForms(prev => ({ ...prev, [idx]: !prev[idx] }));
    setEvalInputs(prev => ({ ...prev, [idx]: prev[idx] ?? records[idx]?.eval ?? '' }));
  }

  function saveEval(idx: number) {
    setRecords(records.map((r, i) => i === idx ? { ...r, eval: evalInputs[idx] ?? '' } : r));
    setOpenForms(prev => ({ ...prev, [idx]: false }));
  }

  async function genEvalForRecord(idx: number) {
    const r = records[idx];
    const prompt = `유아교육 전문가로서 아래 기록을 바탕으로 누리과정 관련 평가문을 작성해주세요.
[유아: ${r.kidName} / 날짜: ${r.date} / 영역: ${(r.domains || []).join(', ') || '없음'}]
[기록 내용]
${r.body}
[규칙] 해당 누리과정 영역과 연계한 발달 수준 서술 / "${r.kidName}이(가) ~하는 모습을 보임" 형태 / 2~3문장 / 평가문만 출력`;

    setGenLoading(prev => ({ ...prev, [idx]: true }));
    setEvalInputs(prev => ({ ...prev, [idx]: '생성 중...' }));
    try {
      const text = await callAnthropic([{ role: 'user', content: prompt }], { maxTokens: 400 });
      setEvalInputs(prev => ({ ...prev, [idx]: text.trim() }));
    } catch { setEvalInputs(prev => ({ ...prev, [idx]: '오류가 발생했습니다.' })); }
    setGenLoading(prev => ({ ...prev, [idx]: false }));
  }

  // Build filtered list with original indices
  let filtered = [...records].map((r, idx) => ({ ...r, idx })).reverse();
  if (kidFilter !== 'all') filtered = filtered.filter(r => r.kidName === kidFilter);
  if (typeFilter !== 'all') filtered = filtered.filter(r => r.type === typeFilter);
  if (domainFilter !== 'all') filtered = filtered.filter(r => r.domains?.includes(domainFilter));

  const arcEvalKidName = arcEvalKid !== null ? kids[arcEvalKid] : null;
  const evalRecs = arcEvalKidName ? getEvalRecs(arcEvalKidName, period) : [];
  const periodLabel = { all: '전체 기간', month: '이번 달', semester1: '1학기', semester2: '2학기' }[period] ?? '전체 기간';

  return (
    <div>
      <div className="pg-header">
        <div className="pg-title">기록함</div>
        <div className="pg-sub">유아별 · 영역별로 알림장과 관찰기록이 모여요</div>
      </div>

      {/* Cumulative eval panel */}
      <div className="card" style={{ border: '1.5px solid var(--p2)', background: 'linear-gradient(135deg,var(--p1),#fff)', marginBottom: 18 }}>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--p3)' }}>✦ 누적 기록 기반 누리과정 평가 자동 생성</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>유아를 선택하면 쌓인 모든 기록을 AI가 읽고 5개 영역별 평가문을 생성해요</div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {kids.map((k, i) => (
            <span key={i} className={`chip${arcEvalKid === i ? ' on' : ''}`} onClick={() => setArcEvalKid(i)}>{k}</span>
          ))}
        </div>
        <div className="g2" style={{ marginBottom: 10 }}>
          <div>
            <label>기간</label>
            <select value={period} onChange={e => setPeriod(e.target.value)}>
              <option value="all">전체 기간</option>
              <option value="month">이번 달</option>
              <option value="semester1">1학기 (3~8월)</option>
              <option value="semester2">2학기 (9~2월)</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="pbtn" disabled={evalLoading} onClick={genCumulativeEval}>
              {evalLoading ? <><span className="spin" />누적 기록 분석 중...</> : '✦ 누적 평가 생성'}
            </button>
          </div>
        </div>

        {evalResult && (
          <div style={{ borderTop: '1px solid var(--p2)', paddingTop: 12, marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--p3)' }}>
                {arcEvalKidName} · {periodLabel} 누리과정 종합 평가 ({evalRecs.length}건 기반)
              </div>
              <button className="sbtn" onClick={copyAllCumEval} style={{ fontSize: 11 }}>📋 전체 복사</button>
            </div>
            {DOMAINS.map(dm => {
              const res = evalResult[dm.k];
              if (!res) return null;
              const lvlBg = res.level === '잘함' ? '#EAF3DE' : res.level === '보통' ? '#FAEEDA' : '#FAECE7';
              const lvlCo = res.level === '잘함' ? '#27500A' : res.level === '보통' ? '#633806' : '#712B13';
              return (
                <div key={dm.k} style={{ background: dm.bg, border: `1px solid ${dm.br}`, borderRadius: 'var(--radius-sm)', padding: '10px 12px', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 13 }}>{dm.em}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: dm.co }}>{dm.k}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: lvlBg, color: lvlCo, fontWeight: 600 }}>{res.level}</span>
                  </div>
                  <textarea
                    rows={3}
                    value={cumEditTexts[dm.k] ?? res.eval}
                    onChange={e => setCumEditTexts(prev => ({ ...prev, [dm.k]: e.target.value }))}
                    style={{ width: '100%', fontSize: 12, lineHeight: 1.7, border: `1px solid ${dm.br}`, borderRadius: 'var(--radius-sm)', padding: '7px 9px', background: '#fff', color: dm.co, fontFamily: 'inherit', resize: 'vertical' }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="filter-row">
        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>유아:</span>
        {['all', ...kids].map(k => (
          <span key={k} className={`filter-chip${kidFilter === k ? ' on' : ''}`} onClick={() => setKidFilter(k)}>
            {k === 'all' ? '전체' : k}
          </span>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {(['all', 'notify', 'observe'] as const).map(v => {
            const label = v === 'all' ? '전체' : v === 'notify' ? '📮 알림장' : '🔍 관찰';
            return <span key={v} className={`filter-chip${typeFilter === v ? ' on' : ''}`} onClick={() => setTypeFilter(v)}>{label}</span>;
          })}
        </div>
      </div>
      <div className="tag-row" style={{ marginBottom: 14 }}>
        {[{ k: 'all', label: '전체 영역' }, ...DOMAINS.map(d => ({ k: d.k, label: d.k }))].map(({ k, label }) => (
          <span key={k} className={`tag${domainFilter === k ? ' on' : ''}`} onClick={() => setDomainFilter(k)}>{label}</span>
        ))}
      </div>

      {/* Record list */}
      {filtered.length === 0
        ? <p className="empty-msg">저장된 기록이 없어요.</p>
        : filtered.map(r => {
          const typeLabel = r.type === 'notify' ? '📮 알림장' : '🔍 관찰기록';
          const formOpen = !!openForms[r.idx];
          const evalInput = evalInputs[r.idx] ?? r.eval;
          return (
            <div key={r.idx} className="rec-card">
              <div className="rec-meta">{typeLabel} · {r.date}{r.theme ? ` · ${r.theme}` : ''}</div>
              <div className="rec-child">{r.kidName}</div>
              {(r.domains || []).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                  {(r.domains || []).map(dk => {
                    const d = DOMAINS.find(x => x.k === dk);
                    return d ? <span key={dk} className="domain-badge" style={{ background: d.bg, color: d.co, border: `1px solid ${d.br}` }}>{d.em} {dk}</span> : null;
                  })}
                </div>
              )}
              <div className="rec-body">{r.body}</div>
              {r.eval && (
                <div className="rec-eval show">
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--p3)', marginBottom: 5 }}>📝 평가</div>
                  <div>{r.eval}</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                <button className="sbtn" onClick={() => toggleForm(r.idx)}>📝 평가 {r.eval ? '수정' : '추가'}</button>
                <button className="sbtn" onClick={() => setRecords(records.filter((_, i) => i !== r.idx))}>🗑 삭제</button>
              </div>
              {formOpen && (
                <div style={{ marginTop: 8 }}>
                  <textarea
                    className="eval-input"
                    rows={3}
                    value={evalInput}
                    onChange={e => setEvalInputs(prev => ({ ...prev, [r.idx]: e.target.value }))}
                    placeholder="평가 내용을 입력하거나 아래 AI 생성을 눌러주세요"
                  />
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    <button className="sbtn" style={{ fontSize: 11 }} disabled={genLoading[r.idx]} onClick={() => genEvalForRecord(r.idx)}>
                      {genLoading[r.idx] ? '생성 중...' : '✦ AI 평가 생성'}
                    </button>
                    <button className="gbtn" style={{ fontSize: 11 }} onClick={() => saveEval(r.idx)}>저장</button>
                    <button className="sbtn" style={{ fontSize: 11 }} onClick={() => setOpenForms(prev => ({ ...prev, [r.idx]: false }))}>취소</button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      }
    </div>
  );
}
