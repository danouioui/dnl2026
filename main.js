const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

const subscribeForm = document.querySelector('.subscribe-form');
if (subscribeForm) {
  subscribeForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = subscribeForm.querySelector('button');
    if (button) {
      button.textContent = '신청 완료';
      button.disabled = true;
    }
  });
}

const useCursorOrb =
  window.matchMedia('(pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (useCursorOrb) {
  const orb = document.createElement('div');
  orb.className = 'cursor-orb';
  document.body.appendChild(orb);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let orbX = mouseX;
  let orbY = mouseY;

  window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    orb.classList.add('is-visible');
  });

  window.addEventListener('mouseleave', () => {
    orb.classList.remove('is-visible');
  });

  const animate = () => {
    orbX += (mouseX - orbX) * 0.18;
    orbY += (mouseY - orbY) * 0.18;
    orb.style.transform = `translate(${orbX}px, ${orbY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
}

const dashboardForm = document.querySelector('#dashboardForm');

if (dashboardForm) {
  const archiveList = document.querySelector('#archiveList');
  const todayFocus = document.querySelector('#todayFocus');
  const logCountBadge = document.querySelector('#logCountBadge');
  const studyBadge = document.querySelector('#studyBadge');
  const habitBadge = document.querySelector('#habitBadge');
  const saveHint = document.querySelector('#saveHint');

  const STORAGE_KEY = 'personalDashboardLogs';
  const dashboardConfig = window.DASHBOARD_CONFIG || {};
  const apiUrl = dashboardConfig.apiUrl || '';

  const getLocalLogs = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      return [];
    }
  };

  const saveLocalLogs = (logs) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  };

  const renderSummary = (logs) => {
    const latest = logs[0];
    const totalStudy = logs.reduce((acc, item) => acc + (Number(item.study) || 0), 0);
    const routineDone = logs.filter((item) => item.routine && item.routine.trim().length > 0).length;

    if (latest) {
      todayFocus.textContent = latest.focus;
    }

    logCountBadge.textContent = `기록 ${logs.length}건`;
    studyBadge.textContent = `학습 ${totalStudy}분`;
    habitBadge.textContent = `루틴 완료 ${routineDone}회`;
  };

  const renderArchive = (logs) => {
    if (!archiveList) {
      return;
    }

    if (!logs.length) {
      archiveList.innerHTML = '<li>아직 저장된 기록이 없습니다.</li>';
      return;
    }

    archiveList.innerHTML = logs
      .map(
        (item) => `
          <li>
            <time>${item.date}</time>
            <p><strong>목표:</strong> ${item.focus}</p>
            <p><strong>루틴:</strong> ${item.routine || '-'}</p>
            <p><strong>취미:</strong> ${item.hobby || '-'}</p>
            <p><strong>학습:</strong> ${item.study || 0}분</p>
          </li>
        `,
      )
      .join('');
  };

  const syncWithGoogleSheets = async (payload) => {
    if (!apiUrl) {
      return { ok: false, reason: 'missing-api' };
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return { ok: false, reason: 'forbidden' };
        }
        return { ok: false, reason: 'request-failed' };
      }

      return { ok: true };
    } catch (error) {
      return { ok: false, reason: 'network-error' };
    }
  };

  const hydrateLogs = async () => {
    const logs = getLocalLogs();
    renderSummary(logs);
    renderArchive(logs);

    if (!apiUrl) {
      if (saveHint) {
        saveHint.textContent = '현재 로컬 저장소 모드입니다. API URL을 넣으면 Google Sheets 연동이 활성화됩니다.';
      }
      return;
    }

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        if (saveHint && (response.status === 401 || response.status === 403)) {
          saveHint.textContent = '웹 앱 접근 권한을 확인해주세요(현재 권한으로는 브라우저에서 읽을 수 없음).';
        }
        return;
      }

      const rows = await response.json();
      const normalizedRows = Array.isArray(rows)
        ? rows
        : Array.isArray(rows?.data)
          ? rows.data
          : Array.isArray(rows?.rows)
            ? rows.rows
            : [];

      if (normalizedRows.length) {
        const normalized = normalizedRows
          .map((row) => ({
            date: row.date || new Date().toISOString().slice(0, 10),
            focus: row.focus || '',
            routine: row.routine || '',
            hobby: row.hobby || '',
            study: row.study || 0,
            reflection: row.reflection || '',
          }))
          .reverse();

        saveLocalLogs(normalized);
        renderSummary(normalized);
        renderArchive(normalized);
      } else if (saveHint) {
        saveHint.textContent = 'API 연결은 되었지만 표시할 기록이 아직 없습니다.';
      }
    } catch (error) {
      if (saveHint) {
        saveHint.textContent = 'API 연결을 확인해주세요. 현재는 로컬 저장소로만 동작합니다.';
      }
    }
  };

  hydrateLogs();

  dashboardForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(dashboardForm);
    const payload = {
      date: new Date().toISOString().slice(0, 10),
      focus: String(formData.get('focus') || ''),
      routine: String(formData.get('routine') || ''),
      hobby: String(formData.get('hobby') || ''),
      study: Number(formData.get('study') || 0),
      reflection: String(formData.get('reflection') || ''),
    };

    const logs = [payload, ...getLocalLogs()];
    saveLocalLogs(logs);
    renderSummary(logs);
    renderArchive(logs);

    const syncResult = await syncWithGoogleSheets(payload);
    if (saveHint) {
      if (syncResult.ok) {
        saveHint.textContent = 'Google Sheets와 동기화 완료 ✅';
      } else if (syncResult.reason === 'forbidden') {
        saveHint.textContent = '권한 오류(401/403): 웹 앱 접근 권한을 테스트 가능한 수준으로 다시 배포해주세요.';
      } else {
        saveHint.textContent = '로컬 저장 완료. API 연결 후 자동으로 Google Sheets에 기록됩니다.';
      }
    }

    dashboardForm.reset();
  });
}
