import { useState } from 'react';
import { useStore } from '../store';
import { callAnthropic } from '../api';
import { ACTIVITY_CATEGORIES } from '../constants';
import { toArchiveRecord } from '../utils/toArchiveRecord';

const MOODS = [
  { v: '매우 활발하고 즐거웠어요', em: '🤩', label: '매우 활발' },
  { v: '밝고 안정적이었어요', em: '😊', label: '밝고 안정' },
  { v: '평소보다 차분했어요', em: '😌', label: '차분함' },
  { v: '조금 피곤해 보였어요', em: '😴', label: '피곤해 보임' },
  { v: '컨디션이 좋지 않았어요', em: '🤒', label: '컨디션 저조' },
];
const MEALS = [
  { v: '잘 먹었어요', em: '😋', label: '잘 먹음' },
  { v: '보통으로 먹었어요', em: '🙂', label: '보통' },
  { v: '조금 적게 먹었어요', em: '😐', label: '조금 적게' },
  { v: '거의 먹지 않았어요', em: '😶', label: '거의 안 먹음' },
];
const TONES = ['따뜻하고 친근하게', '정중하고 공식적으로', '간결하게'];

export default function NotifyPage() {
  const { className, kids, weeks, records, setRecords, selWeekIdx, setSelWeekIdx } = useStore();
  const [selKid, setSelKid] = useState<number | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [weekSel, setWeekSel] = useState(() => selWeekIdx !== null ? String(selWeekIdx) : '');
  const [mood, setMood] = useState('');
  const [meal, setMeal] = useState('');
  const [selActs, setSelActs] = useState<Set<string>>(new Set());
  const [memo, setMemo] = useState('');
  const [notice, setNotice] = useState('');
  const [tone, setTone] = useState('따뜻하고 친근하게');
  const [resultText, setResultText] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const activeWeekIdx = weekSel === '' ? null : parseInt(weekSel);
  const activeWeek = activeWeekIdx !== null ? weeks[activeWeekIdx] : null;

  function handleWeekChange(val: string) {
    setWeekSel(val);
    setSelActs(new Set());
    setSelWeekIdx(val === '' ? null : parseInt(val));
  }

  function toggleAct(act: string) {
    setSelActs(prev => { const n = new Set(prev); n.has(act) ? n.delete(act) : n.add(act); return n; });
  }

  async function genNotify() {
    const kidName = selKid !== null ? kids[selKid] : '';
    const firstName = kidName.length > 1 ? kidName.slice(1) : kidName;
    const hasBatchim = (s: string) => { const c = s.charCodeAt(s.length - 1); return c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 !== 0; };
    const parentLabel = firstName ? (hasBatchim(firstName) ? `${firstName}이 학부모님` : `${firstName} 학부모님`) : '○○ 학부모님';
    const wk = activeWeek;
    const acts = [...selActs].map(s => s.includes(':') ? s.split(':').slice(1).join(':') : s).join(', ');
    const dateObj = date ? new Date(date + 'T00:00:00') : null;
    const ds = dateObj ? dateObj.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }) : '';
    const dow = dateObj ? dateObj.getDay() : -1; // 0=일,1=월,...,5=금,6=토
    const dayContext = dow === 1
      ? '오늘은 월요일로 한 주의 시작이므로, 인삿말에 새로운 한 주의 시작을 반기는 따뜻한 멘트를 자연스럽게 포함할 것'
      : dow === 5
      ? '오늘은 금요일로 한 주의 마지막이므로, 인삿말에 한 주 마무리를 격려하고 주말을 응원하는 멘트를 자연스럽게 포함할 것'
      : '주 시작·마무리 관련 멘트(월요일, 금요일, 한 주의 시작/마지막 등)는 절대 넣지 말 것';

    const prompt = `유치원 교사로서 학부모에게 보내는 알림장을 작성해주세요.

[정보]
- 말투: ${tone}
- 반: ${className || '우리반'}
- 유아 이름: ${firstName || '(이름 미선택)'} (성 없이 이름만 사용)
- 날짜: ${ds}
- 주차: ${wk?.name || ''} / 대주제: ${wk?.mainTheme || ''} / 소주제: ${wk?.subTheme || ''}
- 컨디션: ${mood || '정보없음'}
- 식사: ${meal || '정보없음'}
- 오늘 활동: ${acts || memo || '자유놀이'}
- 활동 메모: ${memo || '없음'}
- 전달사항: ${notice || '없음'}

[반드시 지켜야 할 규칙]
1. 반드시 "안녕하세요, ${parentLabel}💌" 으로 시작할 것
2. ${dayContext}
3. 반드시 아래 ①~⑤ 순서대로, 각 항목이 절대 섞이지 않게 작성할 것:
   ① 인사 — 날씨·계절감을 담은 따뜻한 한 문장
   ② 식사 — 오늘 식사량·식욕만 따로 한 문장 (컨디션 언급 금지)
   ③ 컨디션 — 오늘 기분·컨디션만 따로 한 문장 (식사 언급 금지)
   ④ 놀이 내용 — 활동명을 단순 나열하지 말고, 그 놀이 안에서 아이가 구체적으로 어떤 행동·상호작용을 했을지 장면을 상상해 생생하게 서술할 것. 단, 반드시 입력된 활동 주제 안에서만 묘사하고 주제에 없는 내용(특히 식사·음식 관련)은 절대 추가하지 말 것. 예: '국기 꾸미기'→색칠·문양 탐색·나라별 색깔 비교 장면으로만 서술. '프랑스로 여행하는 놀이'→"비행기 표를 들고 탑승구에 줄을 서고, 에펠탑을 블록으로 쌓으며 파리 거리를 흉내 냈어요"처럼 그 놀이 안의 장면으로만 표현
   ⑤ 마무리 인사
4. 전달사항이 있으면 ⑤ 직전에 포함할 것
5. 전체 260~340자
6. 이모지 2~3개 자연스럽게 포함
7. 알림장 내용만 출력, 다른 설명 없이`;

    setLoading(true);
    setShowResult(true);
    setResultText('');
    try {
      await callAnthropic([{ role: 'user', content: prompt }], {
        maxTokens: 1000, stream: true,
        onChunk: text => setResultText(prev => prev + text),
      });
    } catch { setResultText('오류가 발생했습니다.'); }
    setLoading(false);
  }

  async function saveToArchive() {
    if (!resultText.trim() || saving) return;
    const kidName = selKid !== null ? kids[selKid] : '미지정';
    setSaving(true);
    try {
      const { body, domains } = await toArchiveRecord(kidName, resultText.trim());
      setRecords([...records, {
        type: 'notify', kidName, date,
        theme: activeWeek ? [activeWeek.mainTheme, activeWeek.subTheme].filter(Boolean).join(' / ') : '',
        body, domains, eval: '', ts: Date.now(),
      }]);
      alert('기록함에 저장되었습니다!');
    } catch {
      alert('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
    setSaving(false);
  }

  return (
    <div>
      <div className="pg-header">
        <div className="pg-title">알림장</div>
        <div className="pg-sub">유아 정보를 입력하면 MoaRok!이 알림장을 작성해요.</div>
      </div>

      <div className="card">
        <div className="sec">
          <label>유아 선택</label>
          <div className="tag-row">
            {kids.length === 0
              ? <p className="hint" style={{ display: 'block' }}>유아관리 탭에서 먼저 유아를 등록해주세요</p>
              : kids.map((k, i) => (
                <span key={i} className={`tag${selKid === i ? ' on' : ''}`} onClick={() => setSelKid(i)}>{k}</span>
              ))
            }
          </div>
        </div>
        <div className="g2">
          <div className="sec"><label>날짜</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div className="sec">
            <label>이번 주</label>
            <select value={weekSel} onChange={e => handleWeekChange(e.target.value)}>
              <option value="">주차 선택</option>
              {weeks.map((w, i) => <option key={i} value={i}>{w.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="sec">
          <label>😊 오늘 기분·컨디션</label>
          <div className="mood-grid">
            {MOODS.map(m => (
              <div key={m.v} className={`mood-btn${mood === m.v ? ' on' : ''}`} onClick={() => setMood(m.v)}>
                <span className="em">{m.em}</span>{m.label}
              </div>
            ))}
          </div>
        </div>
        <div className="sec">
          <label>🍱 식사</label>
          <div className="meal-grid">
            {MEALS.map(m => (
              <div key={m.v} className={`meal-btn${meal === m.v ? ' on' : ''}`} onClick={() => setMeal(m.v)}>
                <span className="em">{m.em}</span>{m.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="sec">
          <label>오늘 활동 선택</label>
          {!activeWeek
            ? <p className="hint" style={{ display: 'block' }}>이번 주를 선택하면 활동 목록이 나타나요</p>
            : ACTIVITY_CATEGORIES.map(cat => {
              const items = activeWeek.activities?.[cat] || [];
              if (items.length === 0) return null;
              return (
                <div key={cat} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--hint)', width: 82, flexShrink: 0, paddingTop: 5 }}>{cat}</span>
                  <div className="tag-row" style={{ margin: 0, flex: 1 }}>
                    {items.map((a, j) => (
                      <span key={j} className={`tag${selActs.has(`${cat}:${a}`) ? ' on' : ''}`} onClick={() => toggleAct(`${cat}:${a}`)}>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          }
        </div>
        <div className="sec">
          <label>활동 메모</label>
          <textarea value={memo} onChange={e => setMemo(e.target.value)} rows={3} placeholder="오늘 특별히 있었던 일이나 활동 내용을 메모해주세요" />
        </div>
        <div className="sec">
          <label>전달사항</label>
          <textarea value={notice} onChange={e => setNotice(e.target.value)} rows={2} placeholder="준비물, 행사 안내, 부탁사항 등" />
        </div>
        <div className="sec">
          <label>말투 스타일</label>
          <div className="tag-row">
            {TONES.map(t => <span key={t} className={`tag${tone === t ? ' on' : ''}`} onClick={() => setTone(t)}>{t}</span>)}
          </div>
        </div>
        <button className="pbtn" id="n-btn" disabled={loading} onClick={genNotify}>
          {loading ? <><span className="spin" />작성 중...</> : '✦ 알림장 작성하기'}
        </button>
      </div>

      {showResult && (
        <div className="result-box" style={{ display: 'block' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--p3)' }}>완성된 알림장</span>
          </div>
          <div className="result-text">{resultText}</div>
          <div className="result-actions">
            <button className="sbtn" onClick={() => navigator.clipboard.writeText(resultText)}>📋 복사</button>
            <button className="gbtn" onClick={genNotify}>↺ 다시 생성</button>
            <button className="pbtn" style={{ flex: 1, maxWidth: 200 }} disabled={saving} onClick={saveToArchive}>
              {saving ? <><span className="spin" />변환 중...</> : '기록함에 저장'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
