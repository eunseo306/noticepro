import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Week, AppRecord } from './types';

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

  useEffect(() => { try { localStorage.setItem('v4_class', className); } catch {} }, [className]);
  useEffect(() => { try { localStorage.setItem('v4_kids', JSON.stringify(kids)); } catch {} }, [kids]);
  useEffect(() => { try { localStorage.setItem('v4_weeks', JSON.stringify(weeks)); } catch {} }, [weeks]);
  useEffect(() => { try { localStorage.setItem('v4_records', JSON.stringify(records)); } catch {} }, [records]);

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
