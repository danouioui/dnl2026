# 웹 푸시(Web Push) 설정 가이드

현재 앱의 알림은 **로컬 스케줄 테스트 모드**입니다.  
화면이 꺼져 있을 때도 안정적으로 알림을 받으려면, 아래처럼 **웹 푸시 서버**를 붙여야 합니다.

## 1) VAPID 키 생성

```bash
npx web-push generate-vapid-keys
```

생성된 `publicKey`, `privateKey`를 서버 환경변수로 저장합니다.

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` (예: `mailto:you@example.com`)

## 2) 서버 준비 (Node/Express 예시)

```bash
npm i express web-push
```

```js
// server.js
const express = require('express');
const webpush = require('web-push');

const app = express();
app.use(express.json());

const subscriptions = new Map();

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

app.get('/api/push/public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

app.post('/api/push/subscribe', (req, res) => {
  const sub = req.body;
  subscriptions.set(sub.endpoint, sub);
  res.json({ ok: true });
});

app.post('/api/push/send', async (req, res) => {
  const payload = JSON.stringify({
    title: '오늘의 출퇴근 코디',
    body: req.body?.body || '아침 코디 브리핑을 확인해보세요.'
  });

  const results = await Promise.allSettled(
    [...subscriptions.values()].map((sub) => webpush.sendNotification(sub, payload))
  );

  res.json({ ok: true, results });
});

app.listen(3000, () => console.log('push server on :3000'));
```

## 3) 클라이언트 구독 등록

`main.js`에서 서비스워커 등록 뒤 실행:

```js
async function subscribeWebPush() {
  const registration = await navigator.serviceWorker.ready;

  const keyRes = await fetch('/api/push/public-key');
  const { publicKey } = await keyRes.json();

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey)
  });

  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription)
  });
}
```

유틸 함수:

```js
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
```

## 4) 서비스워커 `push` 이벤트 처리

현재 프로젝트의 `sw.js`에 `push` 이벤트 리스너가 이미 있어야 합니다.  
(없다면 아래를 추가)

```js
self.addEventListener('push', (event) => {
  const payload = event.data?.json?.() || {};
  event.waitUntil(
    self.registration.showNotification(payload.title || '오늘의 출퇴근 코디', {
      body: payload.body || '아침 코디 브리핑을 확인해보세요.',
      icon: '/assets/favicon.svg',
      badge: '/assets/favicon.svg'
    })
  );
});
```

## 5) iOS/Safari 체크포인트

- iOS는 **홈 화면에 추가된 PWA**에서 알림 권한 요청/수신이 가능합니다.
- HTTPS 환경(또는 localhost)에서 테스트하세요.
- 사용자 제스처(버튼 클릭)로 권한 요청을 호출해야 합니다.

## 6) 운영 권장사항

- 사용자별 구독 저장(DB)
- 무효 구독 정리(410/404 응답 처리)
- 아침 알림 스케줄러(Cron/Queue) 구축
- 지역/시간대(Asia/Seoul) 기준 발송 시간 관리

---

이 과정을 붙이면, 화면이 꺼져 있는 상태에서도(브라우저 비활성 포함) 웹 푸시 수신이 가능해집니다.
