import { Card } from '../components/Card';
import { AppData } from '../types';

export function TrackerPage({ data, setData }: { data: AppData; setData: (d: AppData) => void }) {
  const today = new Date().toISOString().slice(0,10);
  const rec = data.trackerRecords.find((r)=>r.date===today) ?? { date: today, checks: {} };
  const checkedCount = Object.values(rec.checks).filter(Boolean).length;
  const weekly = data.trackerRecords.slice(-7);
  const weeklyRate = weekly.length ? Math.round((weekly.reduce((sum,r)=>sum+Object.values(r.checks).filter(Boolean).length,0)/(weekly.length*data.trackerItems.length))*100) : 0;
  return <div className='space-y-3'>
    <Card><p>오늘 체크: {checkedCount}/{data.trackerItems.length}</p><p>주간 달성률: {weeklyRate}%</p></Card>
    <Card>{data.trackerItems.map((item)=>{
      const checked = !!rec.checks[item.id];
      return <label key={item.id} className='flex justify-between py-1'><span>{item.name}</span><input type='checkbox' checked={checked} onChange={(e)=>{
        const next = { ...rec, checks: { ...rec.checks, [item.id]: e.target.checked } };
        const others = data.trackerRecords.filter((r)=>r.date!==today);
        setData({ ...data, trackerRecords: [...others, next] });
      }} /></label>;
    })}</Card>
  </div>;
}
