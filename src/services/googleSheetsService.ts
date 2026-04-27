import { AppData, UserSettings } from '../types';

export const googleSheetsService = {
  async syncToWebApp(data: AppData, settings: UserSettings): Promise<{ ok: boolean; message: string }> {
    if (!settings.sheetsWebAppUrl) {
      return { ok: false, message: 'Web App URL이 설정되지 않았습니다.' };
    }
    try {
      const res = await fetch(settings.sheetsWebAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sync', payload: data }),
      });
      return { ok: res.ok, message: res.ok ? '동기화 성공' : `동기화 실패 (${res.status})` };
    } catch (e) {
      return { ok: false, message: `연결 실패: ${String(e)}` };
    }
  },
};
