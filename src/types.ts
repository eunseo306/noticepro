export type Page = 'weeks' | 'notify' | 'observe' | 'archive' | 'stats' | 'kids';

export interface Week {
  name: string;
  mainTheme: string;
  subTheme: string;
  activities: string[];
}

export interface AppRecord {
  type: 'notify' | 'observe';
  kidName: string;
  date: string;
  theme: string;
  body: string;
  domains: string[];
  eval: string;
  ts: number;
}
