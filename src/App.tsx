import { useEffect, useMemo, useState } from 'react';
import { BottomNav, Tab } from './components/BottomNav';
import { Card } from './components/Card';
import { DailyLog, FocusSession, NextAction, TimeBlock } from './types';
import { storageService } from './services/storageService';
import { DailyLogPage } from './pages/DailyLogPage';
import { FocusPage } from './pages/FocusPage';
import { GoalsPage } from './pages/GoalsPage';
import { InsightsPage } from './pages/InsightsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TodayPage } from './pages/TodayPage';
import { TrackerPage } from './pages/TrackerPage';

function App() {
  const [tab, setTab] = useState<Tab>('Today');
  const [data, setData] = useState(storageService.load());
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => { storageService.save(data); }, [data]);

  const todayLog: DailyLog = useMemo(() => data.dailyLogs.find((d) => d.date === today) ?? {
    id: `d-${today}`,
    date: today,
    mode: '집중 모드', mood: '', energy: '보통', topGoals: [],
    plan: '', actual: '', reflection: '', gratitude: '', prayer: '', learned: '', carryOver: '', quickMode: false, projectTags: [],
  }, [data.dailyLogs, today]);

  const upsertToday = (patch: Partial<DailyLog>) => {
    const next = { ...todayLog, ...patch };
    const list = data.dailyLogs.filter((d) => d.date !== today);
    setData({ ...data, dailyLogs: [...list, next] });
  };

  const addSession = (input: { projectId: string; note: string; minutes: number }) => {
    const s: FocusSession = { id: crypto.randomUUID(), date: today, projectId: input.projectId, note: input.note, minutes: input.minutes, startedAt: new Date().toISOString(), endedAt: new Date().toISOString() };
    setData({ ...data, focusSessions: [...data.focusSessions, s] });
  };

  const addTimeBlock = () => {
    if (!data.projects[0]?.id) return;
    const block: TimeBlock = { id: crypto.randomUUID(), date: today, projectId: data.projects[0].id, title: '새 시간 블록', startTime: '20:00', endTime: '20:30', completed: false, notes: '' };
    setData({ ...data, timeBlocks: [...data.timeBlocks, block] });
  };

  const carryToNextAction = (b: TimeBlock) => {
    const n: NextAction = { id: crypto.randomUUID(), originalDate: b.date, projectId: b.projectId, title: b.title, reason: '시간 부족', nextDate: today, estimatedMinutes: 30, priority: '중간' };
    setData({ ...data, nextActions: [...data.nextActions, n], timeBlocks: data.timeBlocks.filter((x) => x.id !== b.id) });
  };

  return (
    <main className="max-w-md mx-auto min-h-screen bg-iosBg pb-20 p-4 text-slate-800">
      {tab === 'Today' && <>
        <TodayPage data={data} todayLog={todayLog} updateTodayLog={upsertToday} />
        <Card className='mt-4'>
          <div className='flex justify-between items-center mb-2'><h3 className='font-semibold'>오늘의 시간 블록</h3><button onClick={addTimeBlock} className='rounded-xl bg-slate-100 px-2 py-1'>+ 추가</button></div>
          {data.timeBlocks.filter((b)=>b.date===today).map((b)=> <div key={b.id} className='border rounded-xl p-2 mb-2'>
            <input className='w-full border rounded p-1 mb-1' value={b.title} onChange={(e)=>setData({ ...data, timeBlocks: data.timeBlocks.map((x)=>x.id===b.id?{...x,title:e.target.value}:x) })} />
            <select className='w-full border rounded p-1 mb-1' value={b.projectId} onChange={(e)=>setData({ ...data, timeBlocks: data.timeBlocks.map((x)=>x.id===b.id?{...x,projectId:e.target.value}:x) })}>{data.projects.map((p)=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
            <div className='flex gap-2'><input className='border rounded p-1 w-full' value={b.startTime} onChange={(e)=>setData({ ...data, timeBlocks: data.timeBlocks.map((x)=>x.id===b.id?{...x,startTime:e.target.value}:x) })}/><input className='border rounded p-1 w-full' value={b.endTime} onChange={(e)=>setData({ ...data, timeBlocks: data.timeBlocks.map((x)=>x.id===b.id?{...x,endTime:e.target.value}:x) })}/></div>
            <div className='flex justify-between mt-2 text-sm'><label><input type='checkbox' checked={b.completed} onChange={(e)=>setData({ ...data, timeBlocks: data.timeBlocks.map((x)=>x.id===b.id?{...x,completed:e.target.checked}:x) })}/> 완료</label>
            {!b.completed && <button className='text-indigo-600' onClick={()=>carryToNextAction(b)}>다음 액션으로 넘기기</button>}</div>
          </div>)}
        </Card>
      </>}
      {tab === 'Focus' && <FocusPage data={data} addSession={addSession} />}
      {tab === 'Log' && <DailyLogPage data={data} todayLog={todayLog} updateTodayLog={upsertToday} />}
      {tab === 'Projects' && <ProjectsPage data={data} setData={setData} />}
      {tab === 'Goals' && <GoalsPage data={data} setData={setData} />}
      {tab === 'Tracker' && <TrackerPage data={data} setData={setData} />}
      {tab === 'Insights' && <InsightsPage data={data} />}
      {tab === 'Settings' && <SettingsPage data={data} setData={setData} />}

      <BottomNav tab={tab} setTab={setTab} />
    </main>
  );
}

export default App;
