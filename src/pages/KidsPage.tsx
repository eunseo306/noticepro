import { useState } from 'react';
import { useStore } from '../store';

export default function KidsPage() {
  const { kids, setKids } = useStore();
  const [input, setInput] = useState('');

  function addKid() {
    const name = input.trim();
    if (!name) return;
    setKids([...kids, name]);
    setInput('');
  }

  return (
    <div>
      <div className="pg-header">
        <div className="pg-title">유아 관리</div>
        <div className="pg-sub">반 유아 이름을 등록해요</div>
      </div>
      <div className="card">
        <div className="add-row">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="유아 이름 입력"
            onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && addKid()}
          />
          <button className="add-btn" onClick={addKid}>+ 추가</button>
        </div>
      </div>
      {kids.length === 0
        ? <p className="empty-msg">등록된 유아가 없어요.</p>
        : kids.map((k, i) => (
          <div key={i} className="card-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{k}</span>
            <button className="icon-btn" onClick={() => setKids(kids.filter((_, idx) => idx !== i))}>🗑</button>
          </div>
        ))
      }
    </div>
  );
}
