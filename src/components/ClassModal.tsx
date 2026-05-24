import { useState } from 'react';
import { useStore } from '../store';

export default function ClassModal({ onClose }: { onClose: () => void }) {
  const { className, setClassName } = useStore();
  const [value, setValue] = useState(className);

  function save() {
    setClassName(value.trim() || '우리반');
    onClose();
  }

  return (
    <div className="modal-overlay show">
      <div className="modal">
        <div className="modal-title">⚙️ 반 설정</div>
        <div className="sec">
          <label>반 이름</label>
          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="예: 햇살반, 사랑반"
            onKeyDown={e => e.key === 'Enter' && save()}
            autoFocus
          />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="sbtn" onClick={onClose}>취소</button>
          <button className="pbtn" onClick={save}>저장</button>
        </div>
      </div>
    </div>
  );
}
