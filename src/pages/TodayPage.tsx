import { Card } from '../components/Card';
import { AppData, DailyLog, TodayMode } from '../types';
import { availableMinutesToday, bedCountdownMessage, formatMinutes, modePreset, remainingMinutesToday } from '../utils/time';

const modes: TodayMode[] = ['회복 모드', '집중 모드', '정리 모드', '성장 모드'];

export function TodayPage({ data, todayLog, updateTodayLog }: { data: AppData; todayLog: DailyLog; updateTodayLog: (patch: Partial<DailyLog>) => void }) {
  const now = new Date();
  const preset = modePreset(todayLog.mode);
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">{now.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}</h2>
        <p className="text-sm text-slate-600">오늘 가능 시간: {formatMinutes(availableMinutesToday(data.settings))}</p>
        <p className="text-sm text-slate-600">남은 시간: {formatMinutes(remainingMinutesToday(data.settings))}</p>
        <p className="mt-2 text-sm text-indigo-600">{bedCountdownMessage(data.settings)}</p>
      </Card>

      <Card>
        <h3 className="font-semibold mb-2">오늘의 모드 선택</h3>
        <div className="grid grid-cols-2 gap-2">
          {modes.map((m) => <button key={m} onClick={() => updateTodayLog({ mode: m })} className={`rounded-xl p-2 text-sm ${todayLog.mode === m ? 'bg-lavender' : 'bg-slate-100'}`}>{m}</button>)}
        </div>
        <p className="text-xs mt-2 text-slate-600">추천 목표 {preset.goals}개 · {preset.blocks.join(' → ')}</p>
      </Card>

      <Card>
        <h3 className="font-semibold mb-2">핵심 목표(1~3)</h3>
        {[0, 1, 2].map((i) => (
          <input key={i} className="w-full mb-2 rounded-xl border p-2" placeholder={`목표 ${i + 1}`} value={todayLog.topGoals[i] ?? ''}
            onChange={(e) => {
              const next = [...todayLog.topGoals]; next[i] = e.target.value; updateTodayLog({ topGoals: next.filter(Boolean) });
            }} />
        ))}
      </Card>
    </div>
  );
}
