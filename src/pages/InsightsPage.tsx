import { Card } from '../components/Card';
import { AppData } from '../types';

const words = (text: string) => text.split(/\s+/).map((v)=>v.trim()).filter((v)=>v.length>1);

export function InsightsPage({ data }: { data: AppData }) {
  const weekLogs = data.dailyLogs.slice(-7);
  const weekFocus = data.focusSessions.filter((s)=>weekLogs.some((d)=>d.date===s.date));
  const totalFocus = weekFocus.reduce((a,b)=>a+b.minutes,0);
  const byProject = weekFocus.reduce<Record<string, number>>((a,s)=>((a[s.projectId]=(a[s.projectId]??0)+s.minutes),a),{});
  const topProjectId = Object.entries(byProject).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? '';
  const topProject = data.projects.find((p)=>p.id===topProjectId)?.name ?? '-';
  const gratitudeKeywords = weekLogs.flatMap((d)=>words(d.gratitude)).slice(0,5).join(', ');
  const prayerKeywords = weekLogs.flatMap((d)=>words(d.prayer)).slice(0,5).join(', ');
  return <div className='space-y-3'>
    <Card><p>이번 주 총 집중 시간: {totalFocus}분</p><p>가장 많이 실행한 프로젝트: {topProject}</p></Card>
    <Card><p>회고 작성 일수: {weekLogs.filter((l)=>l.reflection).length}</p><p>감사일기 작성 일수: {weekLogs.filter((l)=>l.gratitude).length}</p></Card>
    <Card><p>감사 키워드: {gratitudeKeywords || '-'}</p><p>기도 키워드: {prayerKeywords || '-'}</p></Card>
    <Card><h3 className='font-semibold'>주간 리뷰 자동 생성</h3><ul className='text-sm list-disc ml-5'>
      <li>가장 자주 미룬 프로젝트: {data.nextActions[0]?.projectId ? (data.projects.find((p)=>p.id===data.nextActions[0].projectId)?.name ?? '-') : '-'}</li>
      <li>완료한 액션(집중세션 수): {weekFocus.length}</li>
      <li>다음 액션으로 이동: {data.nextActions.length}개</li>
      <li>감정/에너지 패턴: {weekLogs.map((d)=>`${d.mood}/${d.energy}`).join(', ') || '-'}</li>
      <li>다음 주 추천 우선순위: {topProject !== '-' ? `${topProject} 우선` : '핵심 1개 우선'}</li>
    </ul></Card>
  </div>;
}
