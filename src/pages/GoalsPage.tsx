import { Card } from '../components/Card';
import { AppData } from '../types';

export function GoalsPage({ data, setData }: { data: AppData; setData: (d: AppData) => void }) {
  return <div className="space-y-3">
    <button className="w-full rounded-xl bg-pastelBlue p-2" onClick={()=>setData({ ...data, goals: [...data.goals, { id: crypto.randomUUID(), title: '새 목표', level: '주간', status: '예정', progress: 0, projectId: data.projects[0]?.id ?? '' }] })}>+ 목표 추가</button>
    {data.goals.map((g)=> <Card key={g.id}>
      <input className="w-full border rounded-xl p-2 mb-2" value={g.title} onChange={(e)=>setData({ ...data, goals: data.goals.map((x)=>x.id===g.id?{...x,title:e.target.value}:x) })} />
      <div className="grid grid-cols-3 gap-2">
        <select className="border rounded-xl p-2" value={g.level} onChange={(e)=>setData({ ...data, goals: data.goals.map((x)=>x.id===g.id?{...x,level:e.target.value as typeof g.level}:x) })}><option>연간</option><option>분기</option><option>월간</option><option>주간</option></select>
        <select className="border rounded-xl p-2" value={g.status} onChange={(e)=>setData({ ...data, goals: data.goals.map((x)=>x.id===g.id?{...x,status:e.target.value as typeof g.status}:x) })}><option>예정</option><option>진행중</option><option>완료</option><option>보류</option></select>
        <input type="number" className="border rounded-xl p-2" value={g.progress} onChange={(e)=>setData({ ...data, goals: data.goals.map((x)=>x.id===g.id?{...x,progress:Math.min(100,Math.max(0,Number(e.target.value)||0))}:x) })} />
      </div>
    </Card>)}
  </div>;
}
