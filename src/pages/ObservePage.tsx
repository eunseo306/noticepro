import { useState } from 'react';
import { useStore } from '../store';
import { callAnthropic } from '../api';
import { DOMAINS } from '../constants';

export default function ObservePage() {
  const { kids, records, setRecords } = useStore();
  const [selKid, setSelKid] = useState<number | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [theme, setTheme] = useState('');
  const [selDomains, setSelDomains] = useState<Set<string>>(new Set());
  const [rawObs, setRawObs] = useState('');
  const [resultText, setResultText] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  function toggleDomain(d: string) {
    setSelDomains(prev => { const n = new Set(prev); n.has(d) ? n.delete(d) : n.add(d); return n; });
  }

  async function genObs() {
    if (!rawObs.trim()) return;
    const kidName = selKid !== null ? kids[selKid] : '';
    const doms = [...selDomains].join(', ');

    const prompt = `유아교육 전문가로서 아래 관찰 메모를 공식 교사 관찰기록문으로 변환해주세요.

[정보]
- 유아: ${kidName || '○○'}
- 날짜: ${date}
- 주제: ${theme || '없음'}
- 관련 누리과정 영역: ${doms || '미선택'}

[관찰 메모]
${rawObs}

[작성 규칙]
- "${kidName || '○○'}이(가) ~하는 모습을 보임" 형태의 3인칭 서술
- 구체적 행동, 언어 표현, 친구와의 상호작용 중심
- 교육적으로 의미있는 장면 부각
- 3~5문장의 공식적이고 명확한 문체
- 관찰기록문만 출력`;

    setLoading(true);
    setShowResult(true);
    setResultText('');
    try {
      await callAnthropic([{ role: 'user', content: prompt }], {
        maxTokens: 800, stream: true,
        onChunk: text => setResultText(prev => prev + text),
      });
    } catch { setResultText('오류가 발생했습니다.'); }
    setLoading(false);
  }

  function saveToArchive() {
    if (!resultText.trim()) return;
    const kidName = selKid !== null ? kids[selKid] : '미지정';
    setRecords([...records, {
      type: 'observe', kidName, date, theme,
      body: resultText.trim(), domains: [...selDomains], eval: '', ts: Date.now(),
    }]);
    alert('기록함에 저장되었습니다!');
  }

  return (
    <div>
      <div className="pg-header">
        <div className="pg-title">관찰기록</div>
        <div className="pg-sub">특징적인 놀이 장면을 메모하면 AI가 공식 관찰기록문으로 만들어드려요</div>
      </div>

      <div className="card">
        <div className="sec">
          <label>유아 선택</label>
          <div className="tag-row">
            {kids.map((k, i) => (
              <span key={i} className={`tag${selKid === i ? ' on' : ''}`} onClick={() => setSelKid(i)}>{k}</span>
            ))}
          </div>
        </div>
        <div className="g2">
          <div className="sec"><label>날짜</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div className="sec"><label>주간 주제</label><input value={theme} onChange={e => setTheme(e.target.value)} placeholder="예: 봄과 자연 / 봄꽃과 곤충" /></div>
        </div>
      </div>

      <div className="card">
        <div className="sec">
          <label>관련 누리과정 영역 <span style={{ color: 'var(--hint)', fontWeight: 400 }}>(예상되는 영역 선택)</span></label>
          <div className="tag-row">
            {DOMAINS.map(d => (
              <span key={d.k} className={`tag${selDomains.has(d.k) ? ' on' : ''}`} onClick={() => toggleDomain(d.k)}>
                {d.em} {d.k}
              </span>
            ))}
          </div>
        </div>
        <div className="sec">
          <label>관찰 장면 메모 <span style={{ color: 'var(--hint)', fontWeight: 400 }}>(짧게 키워드나 문장으로 입력)</span></label>
          <textarea
            value={rawObs}
            onChange={e => setRawObs(e.target.value)}
            rows={5}
            placeholder={"예: 블록으로 집 짓다가 무너지자 '다시 해볼게요' 하고 혼자 다시 시작함\n친구에게 블록 나눠주면서 '이거 써도 돼' 라고 말함\n높이 쌓아보고 손으로 재어봄"}
          />
        </div>
        <button className="pbtn" disabled={loading} onClick={genObs}>
          {loading ? <><span className="spin" />생성 중...</> : '✦ 관찰기록문 생성하기'}
        </button>
      </div>

      {showResult && (
        <div className="obs-result" style={{ display: 'block' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t4)', marginBottom: 8 }}>📋 공식 관찰기록문</div>
          <div className="obs-result-text">{resultText}</div>
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="sbtn" onClick={() => navigator.clipboard.writeText(resultText)}>복사</button>
            <button className="sbtn" onClick={genObs}>↺ 다시 생성</button>
            <button className="pbtn" style={{ flex: 1, maxWidth: 200 }} onClick={saveToArchive}>기록함에 저장</button>
          </div>
        </div>
      )}
    </div>
  );
}
