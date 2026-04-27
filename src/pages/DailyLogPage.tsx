import { Card } from '../components/Card';
import { AppData, DailyLog } from '../types';

export function DailyLogPage({ data, todayLog, updateTodayLog }: { data: AppData; todayLog: DailyLog; updateTodayLog: (patch: Partial<DailyLog>) => void }) {
  return <div className="space-y-4">
    <Card>
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Daily Log</h3>
        <button className="text-sm rounded-xl bg-slate-100 px-2 py-1" onClick={() => updateTodayLog({ quickMode: !todayLog.quickMode })}>{todayLog.quickMode ? '자세히 쓰기' : '1분 기록'}</button>
      </div>
      <select className="w-full border rounded-xl p-2 mt-2" multiple value={todayLog.projectTags} onChange={(e)=>{
        const selected = Array.from(e.target.selectedOptions).map((o)=>o.value);
        updateTodayLog({ projectTags: selected });
      }}>
        {data.projects.map((p)=> <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      {todayLog.projectTags.length === 0 && <p className="text-xs text-rose-500 mt-1">이 기록을 어떤 프로젝트에 연결할까요?</p>}
    </Card>
    <Card>
      <textarea className="w-full border rounded-xl p-2 mb-2" placeholder="오늘의 계획" value={todayLog.plan} onChange={(e)=>updateTodayLog({ plan: e.target.value })} />
      <textarea className="w-full border rounded-xl p-2 mb-2" placeholder="실제 실행" value={todayLog.actual} onChange={(e)=>updateTodayLog({ actual: e.target.value })} />
      {!todayLog.quickMode && <>
        <textarea className="w-full border rounded-xl p-2 mb-2" placeholder="회고" value={todayLog.reflection} onChange={(e)=>updateTodayLog({ reflection: e.target.value })} />
        <textarea className="w-full border rounded-xl p-2 mb-2" placeholder="감사일기" value={todayLog.gratitude} onChange={(e)=>updateTodayLog({ gratitude: e.target.value })} />
        <textarea className="w-full border rounded-xl p-2 mb-2" placeholder="기도제목" value={todayLog.prayer} onChange={(e)=>updateTodayLog({ prayer: e.target.value })} />
        <textarea className="w-full border rounded-xl p-2" placeholder="오늘 배운 것 / 내일로 넘길 일" value={`${todayLog.learned}\n${todayLog.carryOver}`} onChange={(e)=>{
          const [learned='',carryOver=''] = e.target.value.split('\n');
          updateTodayLog({ learned, carryOver });
        }} />
      </>}
    </Card>
  </div>;
}
