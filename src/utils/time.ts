import { TodayMode, UserSettings } from '../types';

export const dayKey = (date = new Date()) =>
  ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];

export const minutesBetween = (start: string, end: string): number => {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  if ([sh, sm, eh, em].some((v) => Number.isNaN(v))) return 0;
  return eh * 60 + em - (sh * 60 + sm);
};

export const formatMinutes = (minutes: number): string => {
  if (minutes <= 0) return '0분';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
};

export const availableMinutesToday = (settings: UserSettings, now = new Date()) => {
  const key = dayKey(now);
  const row = settings.weekdayAvailability[key];
  if (!row || !row.enabled) return 0;
  return Math.max(0, minutesBetween(row.start, row.end));
};

export const remainingMinutesToday = (settings: UserSettings, now = new Date()) => {
  const key = dayKey(now);
  const row = settings.weekdayAvailability[key];
  if (!row || !row.enabled) return 0;
  const [eh, em] = row.end.split(':').map(Number);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return Math.max(0, eh * 60 + em - nowMin);
};

export const bedCountdownMessage = (settings: UserSettings, now = new Date()) => {
  const [bh, bm] = settings.bedTargetTime.split(':').map(Number);
  const remain = bh * 60 + bm - (now.getHours() * 60 + now.getMinutes());
  if (remain > 60) return `아직 ${formatMinutes(remain)} 남았어요. 오늘의 핵심 1가지만 끝내볼까요?`;
  if (remain > 0) return `이제 ${formatMinutes(remain)} 남았어요. 기록을 정리하고 마무리할 시간이에요.`;
  return '오늘도 수고했어요. 내일을 위해 쉬어도 괜찮아요.';
};

export const modePreset = (mode: TodayMode) => {
  switch (mode) {
    case '회복 모드':
      return { goals: 1, blocks: ['가벼운 정리', '감사/기도', '휴식'] };
    case '집중 모드':
      return { goals: 2, blocks: ['핵심 작업 1', '집중 세션', '짧은 회고'] };
    case '정리 모드':
      return { goals: 2, blocks: ['문서/공간 정리', '미뤄둔 일 처리', '내일 준비'] };
    case '성장 모드':
      return { goals: 3, blocks: ['영어/독서', '커리어 준비', '개인 프로젝트'] };
    default:
      return { goals: 2, blocks: [] };
  }
};
