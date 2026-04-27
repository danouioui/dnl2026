import { AppData, Project, TrackerItem, UserSettings } from '../types';

const STORAGE_KEY = 'evening-dashboard-v1';

const defaultProjects: Project[] = [
  '영어공부','이직준비','바이오마케팅','개인브랜드','앱개발','운동','독서','신앙','정리','기타',
].map((name, idx) => ({ id: `p-${idx + 1}`, name, color: '#dbeafe', nextAction: '', archived: false }));

const defaultTrackerItems: TrackerItem[] = [
  '영어 공부','운동/스트레칭','독서','기도/묵상','회고 작성','23:30 침대 눕기','소비 기록','콘텐츠/공부 기록',
].map((name, idx) => ({ id: `t-${idx + 1}`, name }));

const defaultSettings: UserSettings = {
  weekdayAvailability: {
    Monday: { start: '19:30', end: '23:30', enabled: true },
    Tuesday: { start: '19:30', end: '23:30', enabled: true },
    Wednesday: { start: '19:00', end: '23:30', enabled: true },
    Thursday: { start: '19:00', end: '23:30', enabled: true },
    Friday: { start: '18:00', end: '23:30', enabled: true },
    Saturday: { start: '10:00', end: '23:30', enabled: false },
    Sunday: { start: '10:00', end: '23:30', enabled: false },
  },
  bedtimePrepTime: '23:00',
  bedTargetTime: '23:30',
  sleepTargetTime: '24:00',
  sheetsWebAppUrl: '',
  sheetsApiKey: '',
};

const today = new Date().toISOString().slice(0, 10);

const defaultData: AppData = {
  dailyLogs: [{
    id: `d-${today}`,
    date: today,
    mode: '집중 모드',
    mood: '차분함',
    energy: '보통',
    topGoals: ['핵심 과제 1', '영어 25분'],
    plan: '퇴근 후 2개 핵심 작업',
    actual: '', reflection: '', gratitude: '', prayer: '', learned: '', carryOver: '', quickMode: false,
    projectTags: ['p-1', 'p-5'],
  }],
  timeBlocks: [],
  focusSessions: [],
  projects: defaultProjects,
  goals: [],
  trackerItems: defaultTrackerItems,
  trackerRecords: [],
  nextActions: [],
  settings: defaultSettings,
};

export const storageService = {
  load(): AppData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultData;
      const parsed = JSON.parse(raw) as Partial<AppData>;
      return {
        ...defaultData,
        ...parsed,
        projects: parsed.projects?.length ? parsed.projects : defaultProjects,
        trackerItems: parsed.trackerItems?.length ? parsed.trackerItems : defaultTrackerItems,
        settings: { ...defaultSettings, ...parsed.settings, weekdayAvailability: { ...defaultSettings.weekdayAvailability, ...parsed.settings?.weekdayAvailability } },
      };
    } catch {
      return defaultData;
    }
  },
  save(data: AppData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  reset() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
  },
  exportJson(data: AppData) {
    return JSON.stringify(data, null, 2);
  },
};
