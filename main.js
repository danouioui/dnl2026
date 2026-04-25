const DEFAULT_LOCATION = {
  name: '서울',
  latitude: 37.5665,
  longitude: 126.978
};

const DEFAULT_ALARM_TIME = '07:30';

const weatherEl = document.querySelector('#weatherCard');
const outfitListEl = document.querySelector('#outfitList');
const itemBadgesEl = document.querySelector('#itemBadges');
const detailPanelEl = document.querySelector('#detailPanel');
const refreshBtn = document.querySelector('#refreshBtn');
const briefBtn = document.querySelector('#briefBtn');
const enableNotifBtn = document.querySelector('#enableNotifBtn');
const iosNoticeEl = document.querySelector('#iosNotice');
const alarmTimeInput = document.querySelector('#alarmTime');
const saveAlarmBtn = document.querySelector('#saveAlarmBtn');
const alarmSummaryEl = document.querySelector('#alarmSummary');

const popup = document.querySelector('#morningPopup');
const popupSummaryEl = document.querySelector('#popupSummary');
const speakBtn = document.querySelector('#speakBtn');
const closePopupBtn = document.querySelector('#closePopup');

let latestBrief = null;
let swRegistration = null;
let alarmCheckTimer = null;

const weatherCodeMap = {
  0: '맑음',
  1: '대체로 맑음',
  2: '부분적으로 흐림',
  3: '흐림',
  45: '안개',
  48: '서리 안개',
  51: '이슬비',
  53: '약한 비',
  55: '비',
  61: '약한 비',
  63: '비',
  65: '강한 비',
  71: '약한 눈',
  73: '눈',
  75: '강한 눈',
  80: '소나기',
  81: '강한 소나기',
  82: '폭우성 소나기',
  95: '뇌우'
};

function isIOS() {
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua) || (ua.includes('mac') && 'ontouchend' in document);
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function getStoredAlarmTime() {
  return localStorage.getItem('alarm-time') || DEFAULT_ALARM_TIME;
}

function getTodayKey(alarmTime) {
  return `alarm-fired-${new Date().toISOString().slice(0, 10)}-${alarmTime}`;
}

function formatKoreanTime(timeValue) {
  const [hourText, minuteText] = timeValue.split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const ampm = hour >= 12 ? '오후' : '오전';
  const displayHour = hour % 12 || 12;
  return `${ampm} ${displayHour}시 ${minute.toString().padStart(2, '0')}분`;
}

function updateAlarmSummary() {
  const alarmTime = getStoredAlarmTime();
  const message =
    Notification.permission === 'granted'
      ? `${formatKoreanTime(alarmTime)}에 알림이 울리도록 설정되었어요. (앱 실행 중/홈 화면 실행 상태에서 동작)`
      : `${formatKoreanTime(alarmTime)}에 알림 예정입니다. 먼저 '아침 알림 켜기'로 권한을 허용해주세요.`;

  alarmSummaryEl.textContent = message;
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    swRegistration = await navigator.serviceWorker.register('/sw.js');
  } catch (error) {
    console.warn('서비스워커 등록 실패', error);
  }
}

async function showTestNotification() {
  const title = '오늘의 출퇴근 코디';
  const options = {
    body: '아침 알림이 켜졌어요. 설정한 시간에 코디 브리핑을 확인해보세요.',
    icon: 'assets/favicon.svg',
    badge: 'assets/favicon.svg'
  };

  if (swRegistration) {
    await swRegistration.showNotification(title, options);
    return;
  }

  if ('Notification' in window) {
    new Notification(title, options);
  }
}

async function showScheduledNotification() {
  const title = '오늘의 출퇴근 코디';
  const options = {
    body: latestBrief || '오늘 아침 코디 브리핑을 확인해보세요.',
    icon: 'assets/favicon.svg',
    badge: 'assets/favicon.svg'
  };

  if (swRegistration) {
    await swRegistration.showNotification(title, options);
  } else if ('Notification' in window) {
    new Notification(title, options);
  }
}

function checkAndTriggerAlarm() {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const alarmTime = getStoredAlarmTime();
  const [alarmHour, alarmMinute] = alarmTime.split(':').map(Number);
  const now = new Date();

  if (now.getHours() !== alarmHour || now.getMinutes() !== alarmMinute) {
    return;
  }

  const firedKey = getTodayKey(alarmTime);
  if (localStorage.getItem(firedKey)) {
    return;
  }

  localStorage.setItem(firedKey, '1');
  showScheduledNotification();
}

function startAlarmScheduler() {
  if (alarmCheckTimer) {
    clearInterval(alarmCheckTimer);
  }

  checkAndTriggerAlarm();
  alarmCheckTimer = setInterval(checkAndTriggerAlarm, 30 * 1000);
}

function saveAlarmTime() {
  const value = alarmTimeInput.value || DEFAULT_ALARM_TIME;
  localStorage.setItem('alarm-time', value);
  updateAlarmSummary();
  startAlarmScheduler();
  alert(`아침 알림 시간이 ${formatKoreanTime(value)}으로 저장되었어요.`);
}

async function requestMorningNotification() {
  if (!('Notification' in window)) {
    alert('이 브라우저는 알림 기능을 지원하지 않아요.');
    return;
  }

  if (isIOS() && !isStandalone()) {
    iosNoticeEl.hidden = false;
  }

  const permission = await Notification.requestPermission();

  if (permission === 'granted') {
    await showTestNotification();
    updateAlarmSummary();
    alert('아침 알림 권한이 허용되었고 테스트 알림을 보냈어요.');
    return;
  }

  updateAlarmSummary();
  alert('알림 권한이 허용되지 않았어요. 브라우저 설정에서 알림을 허용해주세요.');
}

function getCommuteContext(date = new Date()) {
  const day = date.getDay();
  if (day >= 1 && day <= 5) {
    return '평일 출퇴근(왕복 2시간) 기준으로, 사무실 냉난방과 이동 구간 온도 차를 함께 고려했어요.';
  }

  if (day === 6) {
    return '토요일은 집에서 쉬는 일정에 맞춰 편안한 실내복 + 짧은 외출 대비 위주로 추천해요.';
  }

  return '일요일은 왕복 2시간 교회 이동을 고려해 단정하고 활동성 있는 코디를 추천해요.';
}

function getOutfitByFeelsLike(feelsLike) {
  if (feelsLike >= 28) {
    return ['통기성 좋은 반팔/얇은 블라우스', '린넨 또는 가벼운 슬랙스', '땀 흡수 이너 + 가벼운 가디건(실내용)'];
  }

  if (feelsLike >= 23) {
    return ['반팔 니트/블라우스', '얇은 슬랙스 또는 롱스커트', '출퇴근용 얇은 셔츠 아우터'];
  }

  if (feelsLike >= 17) {
    return ['긴팔 셔츠/블라우스', '슬랙스 또는 미디 스커트', '얇은 자켓이나 가디건'];
  }

  if (feelsLike >= 10) {
    return ['니트 + 셔츠 레이어드', '두께감 있는 팬츠/스커트', '트렌치코트 또는 가벼운 울 자켓'];
  }

  if (feelsLike >= 4) {
    return ['기모 이너 + 니트', '보온 팬츠', '코트 + 머플러'];
  }

  return ['히트텍/기능성 이너', '두꺼운 니트 + 보온 하의', '롱패딩 + 장갑 + 머플러'];
}

function getDynamicItems(data) {
  const items = [];
  const details = [];

  if (data.precipProb >= 40) {
    items.push('☔ 우산');
    details.push('강수 확률이 높아 우산을 챙기는 것이 좋아요.');
  }

  if (data.precipProb >= 70 || data.precipitation >= 10) {
    items.push('🧥 우비');
    items.push('👢 장화/방수 신발');
    details.push('비가 강하게 예보되어 우비나 방수 신발 준비를 권장해요.');
  }

  if (data.uv >= 6) {
    items.push('🌂 양산');
    items.push('🧴 선크림');
    details.push('자외선 지수가 높아서 양산, 선크림이 유용해요.');
  }

  if (data.aqi >= 101) {
    items.push('😷 마스크');
    details.push('대기질이 나쁨 수준이라 KF 마스크 착용을 추천해요.');
  }

  if (data.wind >= 30) {
    items.push('🧣 바람막이/스카프');
    details.push('바람이 강해 체감 온도가 낮아질 수 있어요.');
  }

  if (!items.length) {
    items.push('👜 기본 출근 가방');
    details.push('특이 기상 위험이 적어 기본 아이템 위주로 준비하면 충분해요.');
  }

  return { items: [...new Set(items)], details };
}

function renderBrief(data, locationName) {
  const nowCondition = weatherCodeMap[data.weatherCode] || '날씨 정보 확인 필요';
  const outfits = getOutfitByFeelsLike(data.feelsLike);
  const dynamic = getDynamicItems(data);
  const commuteContext = getCommuteContext(new Date());

  weatherEl.innerHTML = `
    <h2>현재 날씨 (${locationName})</h2>
    <p><strong>${nowCondition}</strong> · 체감 ${Math.round(data.feelsLike)}°C · 기온 ${Math.round(data.temp)}°C</p>
    <p>강수 확률 ${Math.round(data.precipProb)}% · 예상 강수량 ${data.precipitation.toFixed(1)}mm · 자외선 ${data.uv.toFixed(1)} · AQI ${Math.round(data.aqi)}</p>
  `;

  outfitListEl.innerHTML = outfits.map((item) => `<li>${item}</li>`).join('');
  itemBadgesEl.innerHTML = dynamic.items.map((item) => `<span>${item}</span>`).join('');

  detailPanelEl.innerHTML = `
    <p>${commuteContext}</p>
    <ul class="list">${dynamic.details.map((detail) => `<li>${detail}</li>`).join('')}</ul>
  `;

  const summary = `${locationName} 기준, 오늘은 ${nowCondition}이고 체감 ${Math.round(data.feelsLike)}도입니다. ${dynamic.items.join(', ')} 챙기세요.`;
  popupSummaryEl.textContent = summary;
  latestBrief = summary;
}

function speakBrief() {
  if (!latestBrief || !('speechSynthesis' in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(latestBrief);
  utterance.lang = 'ko-KR';
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}

function openPopup() {
  popup.classList.remove('hidden');
}

function closePopup() {
  popup.classList.add('hidden');
}

function maybeShowMorningPopup() {
  const now = new Date();
  const key = `brief-shown-${now.toISOString().slice(0, 10)}`;
  const hour = now.getHours();

  if (hour >= 6 && hour <= 9 && !localStorage.getItem(key)) {
    localStorage.setItem(key, '1');
    openPopup();
    speakBrief();
  }
}

async function getLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(DEFAULT_LOCATION);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          name: '내 위치',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      () => resolve(DEFAULT_LOCATION),
      { timeout: 5000 }
    );
  });
}

async function fetchWeather() {
  weatherEl.innerHTML = '<h2>현재 날씨</h2><p class="loading">날씨 정보를 가져오는 중...</p>';

  const location = await getLocation();
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,apparent_temperature,weather_code,precipitation,wind_speed_10m&hourly=precipitation_probability,uv_index&timezone=auto`;
  const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.latitude}&longitude=${location.longitude}&current=us_aqi&timezone=auto`;

  try {
    const [weatherRes, airRes] = await Promise.all([fetch(weatherUrl), fetch(airUrl)]);
    const weatherJson = await weatherRes.json();
    const airJson = await airRes.json();

    const currentTime = weatherJson.current.time;
    const hourIndex = weatherJson.hourly.time.indexOf(currentTime);

    renderBrief(
      {
        temp: weatherJson.current.temperature_2m,
        feelsLike: weatherJson.current.apparent_temperature,
        weatherCode: weatherJson.current.weather_code,
        precipitation: weatherJson.current.precipitation || 0,
        wind: weatherJson.current.wind_speed_10m || 0,
        precipProb: weatherJson.hourly.precipitation_probability[hourIndex] || 0,
        uv: weatherJson.hourly.uv_index[hourIndex] || 0,
        aqi: airJson.current?.us_aqi || 0
      },
      location.name
    );

    maybeShowMorningPopup();
  } catch (error) {
    weatherEl.innerHTML = '<h2>현재 날씨</h2><p>날씨 정보를 가져오지 못했어요. 잠시 후 다시 시도해주세요.</p>';
  }
}

refreshBtn.addEventListener('click', fetchWeather);
briefBtn.addEventListener('click', openPopup);
enableNotifBtn.addEventListener('click', requestMorningNotification);
saveAlarmBtn.addEventListener('click', saveAlarmTime);
speakBtn.addEventListener('click', speakBrief);
closePopupBtn.addEventListener('click', closePopup);
popup.addEventListener('click', (event) => {
  if (event.target === popup) {
    closePopup();
  }
});

if (isIOS()) {
  iosNoticeEl.hidden = false;
}

alarmTimeInput.value = getStoredAlarmTime();
updateAlarmSummary();
startAlarmScheduler();
registerServiceWorker();
fetchWeather();
