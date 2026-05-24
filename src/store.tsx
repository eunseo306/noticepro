import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import type { Week, AppRecord } from './types';
import { getDeviceId } from './deviceId';

interface AppState {
  className: string;
  kids: string[];
  weeks: Week[];
  records: AppRecord[];
  selWeekIdx: number | null;
  setClassName: (name: string) => void;
  setKids: (kids: string[]) => void;
  setWeeks: (weeks: Week[]) => void;
  setRecords: (records: AppRecord[]) => void;
  setSelWeekIdx: (idx: number | null) => void;
}

const AppContext = createContext<AppState | null>(null);

function load<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [className, setClassName] = useState<string>(() => localStorage.getItem('v4_class') || '');
  const [kids, setKids] = useState<string[]>(() => load('v4_kids', []));
  const [weeks, setWeeks] = useState<Week[]>(() => load('v4_weeks', []));
  const [records, setRecords] = useState<AppRecord[]>(() => load('v4_records', []));
  const [selWeekIdx, setSelWeekIdx] = useState<number | null>(null);

  const loadedRef = useRef(false);
  const skipSyncRef = useRef(false);

  // localStorage 동기화
  useEffect(() => { try { localStorage.setItem('v4_class', className); } catch {} }, [className]);
  useEffect(() => { try { localStorage.setItem('v4_kids', JSON.stringify(kids)); } catch {} }, [kids]);
  useEffect(() => { try { localStorage.setItem('v4_weeks', JSON.stringify(weeks)); } catch {} }, [weeks]);
  useEffect(() => { try { localStorage.setItem('v4_records', JSON.stringify(records)); } catch {} }, [records]);

  // 앱 로드 시 서버에서 데이터 불러오기
  useEffect(() => {
    const deviceId = getDeviceId();
    fetch('/api/data', { headers: { 'x-device-id': deviceId } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && typeof data === 'object') {
          skipSyncRef.current = true;
          if (typeof data.className === 'string') setClassName(data.className);
          if (Array.isArray(data.kids)) setKids(data.kids);
          if (Array.isArray(data.weeks)) setWeeks(data.weeks);
          if (Array.isArray(data.records)) setRecords(data.records);
        }
      })
      .catch(() => {})
      .finally(() => { loadedRef.current = true; });
  }, []);

  // 데이터 변경 시 서버에 저장 (1.5초 디바운스)
  useEffect(() => {
    if (!loadedRef.current) return;
    if (skipSyncRef.current) { skipSyncRef.current = false; return; }
    const deviceId = getDeviceId();
    const t = setTimeout(() => {
      fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-device-id': deviceId },
        body: JSON.stringify({ className, kids, weeks, records }),
      }).catch(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, [className, kids, weeks, records]);

  return (
    <AppContext.Provider value={{ className, kids, weeks, records, selWeekIdx, setClassName, setKids, setWeeks, setRecords, setSelWeekIdx }}>
      {children}
    </AppContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useStore must be used within AppProvider');
  return ctx;
}
