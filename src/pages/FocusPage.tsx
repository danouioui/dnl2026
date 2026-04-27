import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { AppData } from '../types';

export function FocusPage({ data, addSession }: { data: AppData; addSession: (s: { projectId: string; note: string; minutes: number }) => void }) {
  const [minutes, setMinutes] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => { setRemaining(minutes * 60); }, [minutes]);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setRemaining((r) => (r > 0 ? r - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [running]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  return <div className="space-y-4">
    <Card className="text-center">
      <h3 className="font-semibold">집중 세션</h3>
      <p className="text-4xl font-bold my-4">{mm}:{ss}</p>
      <div className="flex gap-2 justify-center mb-3">
        {[25,50].map((m)=> <button key={m} onClick={()=>setMinutes(m)} className="px-3 py-1 rounded-xl bg-slate-100">{m}분</button>)}
        <input type="number" className="w-20 rounded-xl border p-1" value={minutes} onChange={(e)=>setMinutes(Math.max(1, Number(e.target.value) || 1))} />
      </div>
      <div className="flex gap-2 justify-center">
        <button className="px-3 py-2 rounded-xl bg-pastelBlue" onClick={()=>setRunning(true)}>시작</button>
        <button className="px-3 py-2 rounded-xl bg-slate-100" onClick={()=>setRunning(false)}>일시정지</button>
        <button className="px-3 py-2 rounded-xl bg-lavender" onClick={()=>{setRunning(false);setRemaining(minutes*60);}}>종료</button>
      </div>
    </Card>
    <Card>
      <h4 className="font-semibold mb-2">세션 저장</h4>
      <select className="w-full border rounded-xl p-2 mb-2" value={projectId} onChange={(e)=>setProjectId(e.target.value)}>
        <option value="">프로젝트 태그 선택(필수)</option>
        {data.projects.map((p)=><option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <input className="w-full border rounded-xl p-2 mb-2" placeholder="실행 내용" value={note} onChange={(e)=>setNote(e.target.value)} />
      <button className="w-full rounded-xl bg-indigo-500 text-white p-2" onClick={()=>{
        const done = Math.max(1, Math.floor((minutes*60-remaining)/60));
        if (!projectId) return alert('이 기록을 어떤 프로젝트에 연결할까요?');
        addSession({ projectId, note, minutes: done });
        setNote('');
      }}>저장</button>
      <p className="text-xs text-slate-500 mt-2">iOS 단축어로 집중모드 켜기 안내 링크를 이곳에 추가하세요.</p>
    </Card>
  </div>;
}
