import { Card } from '../components/Card';
import { AppData } from '../types';

export function ProjectsPage({ data, setData }: { data: AppData; setData: (d: AppData) => void }) {
  const minutesByProject = data.focusSessions.reduce<Record<string, number>>((acc, s) => {
    acc[s.projectId] = (acc[s.projectId] ?? 0) + s.minutes;
    return acc;
  }, {});

  return <div className="space-y-3">
    {data.projects.map((p) => (
      <Card key={p.id}>
        <p className="font-semibold">{p.name}</p>
        <p className="text-sm">누적 집중: {minutesByProject[p.id] ?? 0}분</p>
        <input className="w-full border rounded-xl p-2 mt-2" value={p.nextAction} placeholder="다음 액션" onChange={(e)=>setData({ ...data, projects: data.projects.map((x)=>x.id===p.id?{...x,nextAction:e.target.value}:x) })} />
      </Card>
    ))}
  </div>;
}
