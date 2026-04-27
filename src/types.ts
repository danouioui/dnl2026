export type EnergyLevel = '낮음' | '보통' | '좋음' | '매우 좋음';
export type TodayMode = '회복 모드' | '집중 모드' | '정리 모드' | '성장 모드';
export type GoalStatus = '예정' | '진행중' | '완료' | '보류';

export interface TimeBlock {
  id: string;
  date: string;
  projectId: string;
  title: string;
  startTime: string;
  endTime: string;
  completed: boolean;
  notes: string;
}

export interface DailyLog {
  id: string;
  date: string;
  mode: TodayMode;
  mood: string;
  energy: EnergyLevel;
  topGoals: string[];
  plan: string;
  actual: string;
  reflection: string;
  gratitude: string;
  prayer: string;
  learned: string;
  carryOver: string;
  quickMode: boolean;
  projectTags: string[];
}

export interface FocusSession {
  id: string;
  date: string;
  projectId: string;
  note: string;
  minutes: number;
  startedAt: string;
  endedAt: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  nextAction: string;
  archived: boolean;
}

export interface Goal {
  id: string;
  title: string;
  level: '연간' | '분기' | '월간' | '주간';
  status: GoalStatus;
  progress: number;
  projectId: string;
}

export interface TrackerItem {
  id: string;
  name: string;
}

export interface TrackerRecord {
  date: string;
  checks: Record<string, boolean>;
}

export interface NextAction {
  id: string;
  originalDate: string;
  projectId: string;
  title: string;
  reason: string;
  nextDate: string;
  estimatedMinutes: number;
  priority: '낮음' | '중간' | '높음';
}

export interface UserSettings {
  weekdayAvailability: Record<string, { start: string; end: string; enabled: boolean }>;
  bedtimePrepTime: string;
  bedTargetTime: string;
  sleepTargetTime: string;
  sheetsWebAppUrl: string;
  sheetsApiKey: string;
}

export interface AppData {
  dailyLogs: DailyLog[];
  timeBlocks: TimeBlock[];
  focusSessions: FocusSession[];
  projects: Project[];
  goals: Goal[];
  trackerItems: TrackerItem[];
  trackerRecords: TrackerRecord[];
  nextActions: NextAction[];
  settings: UserSettings;
}
