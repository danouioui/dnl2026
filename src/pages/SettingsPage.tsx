import { Card } from '../components/Card';
import { AppData } from '../types';
import { googleSheetsService } from '../services/googleSheetsService';

export function SettingsPage({ data, setData }: { data: AppData; setData: (d: AppData) => void }) {
  const days = Object.entries(data.settings.weekdayAvailability);
  return <div className='space-y-3'>
    <Card><h3 className='font-semibold mb-2'>요일별 사용 가능 시간</h3>{days.map(([day,row])=><div key={day} className='grid grid-cols-4 gap-2 mb-2 items-center'>
      <span className='text-sm'>{day}</span><input type='checkbox' checked={row.enabled} onChange={(e)=>setData({ ...data, settings: { ...data.settings, weekdayAvailability: { ...data.settings.weekdayAvailability, [day]: { ...row, enabled: e.target.checked } } } })} />
      <input className='border rounded p-1' value={row.start} onChange={(e)=>setData({ ...data, settings: { ...data.settings, weekdayAvailability: { ...data.settings.weekdayAvailability, [day]: { ...row, start: e.target.value } } } })} />
      <input className='border rounded p-1' value={row.end} onChange={(e)=>setData({ ...data, settings: { ...data.settings, weekdayAvailability: { ...data.settings.weekdayAvailability, [day]: { ...row, end: e.target.value } } } })} />
    </div>)}</Card>
    <Card><input className='w-full border rounded-xl p-2 mb-2' placeholder='Web App URL' value={data.settings.sheetsWebAppUrl} onChange={(e)=>setData({ ...data, settings: { ...data.settings, sheetsWebAppUrl: e.target.value } })} />
    <input className='w-full border rounded-xl p-2 mb-2' placeholder='API Key' value={data.settings.sheetsApiKey} onChange={(e)=>setData({ ...data, settings: { ...data.settings, sheetsApiKey: e.target.value } })} />
    <button className='rounded-xl bg-pastelBlue px-3 py-2 mr-2' onClick={async()=>alert((await googleSheetsService.syncToWebApp(data, data.settings)).message)}>Sheets 동기화 테스트</button>
    <button className='rounded-xl bg-slate-100 px-3 py-2 mr-2' onClick={()=>{
      const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='dashboard-data.json'; a.click(); URL.revokeObjectURL(url);
    }}>JSON 내보내기</button>
    <button className='rounded-xl bg-rose-100 px-3 py-2' onClick={()=>{localStorage.clear();location.reload();}}>데이터 초기화</button></Card>
  </div>;
}
