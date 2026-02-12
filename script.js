const STORAGE_KEY = "mandalart-newyear-v1";
const overviewGrid = document.getElementById("overview-grid");
const detailGrid = document.getElementById("detail-grid");
const cellTemplate = document.getElementById("cell-template");
const activeGoalLabel = document.getElementById("active-goal-label");
const statusText = document.getElementById("status");
const copyBtn = document.getElementById("copy-btn");
const exportBtn = document.getElementById("export-btn");

const overviewPositions = [
  [0, 0],
  [0, 1],
  [0, 2],
  [1, 0],
  [1, 1],
  [1, 2],
  [2, 0],
  [2, 1],
  [2, 2],
];
const outerPositions = overviewPositions.filter(([r, c]) => !(r === 1 && c === 1));

const state = {
  title: "",
  goals: Array.from({ length: 8 }, () => ""),
  details: Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => "")),
  activeGoal: 0,
};

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    state.title = parsed.title || "";
    state.goals = Array.isArray(parsed.goals) ? parsed.goals.slice(0, 8) : state.goals;
    state.details = Array.isArray(parsed.details)
      ? parsed.details.slice(0, 8).map((row) => (Array.isArray(row) ? row.slice(0, 8) : Array(8).fill("")))
      : state.details;
    state.activeGoal = Number.isInteger(parsed.activeGoal) ? Math.min(7, Math.max(0, parsed.activeGoal)) : 0;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createCell(value, options = {}) {
  const node = cellTemplate.content.firstElementChild.cloneNode(true);
  const textarea = node.querySelector("textarea");
  textarea.value = value || "";
  if (options.placeholder) textarea.placeholder = options.placeholder;
  if (options.center) node.classList.add("center");
  return { node, textarea };
}

function renderOverview() {
  overviewGrid.innerHTML = "";

  overviewPositions.forEach(([r, c], index) => {
    const isCenter = r === 1 && c === 1;
    const goalIndex = isCenter ? -1 : outerPositions.findIndex(([or, oc]) => or === r && oc === c);
    const value = isCenter ? state.title : state.goals[goalIndex];
    const { node, textarea } = createCell(value, {
      center: isCenter,
      placeholder: isCenter ? "예: 2026 나의 성장 프로젝트" : `핵심 계획 ${goalIndex + 1}`,
    });

    if (!isCenter && goalIndex === state.activeGoal) {
      node.classList.add("active-goal");
    }

    textarea.addEventListener("input", () => {
      if (isCenter) {
        state.title = textarea.value.trimStart();
      } else {
        state.goals[goalIndex] = textarea.value.trimStart();
      }
      saveState();
      if (goalIndex === state.activeGoal) {
        updateDetailHeader();
      }
    });

    if (!isCenter) {
      node.addEventListener("click", () => {
        state.activeGoal = goalIndex;
        saveState();
        renderOverview();
        renderDetail();
      });
    }

    overviewGrid.appendChild(node);
    if (index === 3 || index === 6) {
      // visual breathing only through CSS gap
    }
  });
}

function updateDetailHeader() {
  const goal = state.goals[state.activeGoal] || `핵심 계획 ${state.activeGoal + 1}`;
  activeGoalLabel.textContent = `현재 확장 중: ${goal}`;
}

function renderDetail() {
  detailGrid.innerHTML = "";
  const activeGoalText = state.goals[state.activeGoal] || "핵심 계획";
  const detailPositions = overviewPositions;

  detailPositions.forEach(([r, c]) => {
    const isCenter = r === 1 && c === 1;
    const detailIndex = isCenter ? -1 : outerPositions.findIndex(([or, oc]) => or === r && oc === c);
    const value = isCenter ? activeGoalText : state.details[state.activeGoal][detailIndex];

    const { node, textarea } = createCell(value, {
      center: isCenter,
      placeholder: isCenter ? "중심 핵심 계획" : `세부 실행 ${detailIndex + 1}`,
    });

    if (isCenter) {
      textarea.readOnly = true;
    } else {
      textarea.addEventListener("input", () => {
        state.details[state.activeGoal][detailIndex] = textarea.value.trimStart();
        saveState();
      });
    }

    detailGrid.appendChild(node);
  });

  updateDetailHeader();
}

function buildReminderText() {
  const lines = [];
  lines.push(`📌 ${state.title || "새해 목표"}`);
  lines.push("");

  state.goals.forEach((goal, i) => {
    const goalTitle = goal || `핵심 계획 ${i + 1}`;
    lines.push(`${i + 1}. ${goalTitle}`);
    const filledDetails = state.details[i].filter((item) => item.trim());
    if (filledDetails.length === 0) {
      lines.push("   - (세부 계획 미입력)");
    } else {
      filledDetails.forEach((item) => lines.push(`   - ${item}`));
    }
    lines.push("");
  });

  return lines.join("\n");
}

async function copyPlans() {
  const text = buildReminderText();
  await navigator.clipboard.writeText(text);
  statusText.textContent = "복사 완료! 미리알림 앱에 붙여넣어 사용하세요.";
}

function drawGrid(ctx, startX, startY, size, centerText, outerTexts, title) {
  const cell = size / 3;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(startX, startY, size, size);

  ctx.fillStyle = "#26374a";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText(title, startX, startY - 14);

  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      const x = startX + c * cell;
      const y = startY + r * cell;
      const isCenter = r === 1 && c === 1;
      ctx.fillStyle = isCenter ? "#eef6ff" : "#ffffff";
      ctx.strokeStyle = "#b4d5f7";
      ctx.lineWidth = 2;
      roundRect(ctx, x + 6, y + 6, cell - 12, cell - 12, 12, true, true);

      const text = isCenter
        ? centerText
        : outerTexts[outerPositions.findIndex(([or, oc]) => or === r && oc === c)] || "";
      drawMultilineText(ctx, text, x + 16, y + 20, cell - 32, 20, isCenter ? "600 17px sans-serif" : "15px sans-serif");
    }
  }
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function drawMultilineText(ctx, text, x, y, maxWidth, lineHeight, font) {
  ctx.font = font;
  ctx.fillStyle = "#26374a";
  const words = (text || "").split(" ");
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);

  const limited = lines.slice(0, 4);
  limited.forEach((entry, i) => {
    ctx.fillText(entry, x, y + i * lineHeight);
  });
}

function exportImage() {
  const width = 2100;
  const height = 2800;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#fef7ff");
  gradient.addColorStop(1, "#f0f9ff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#213547";
  ctx.font = "bold 54px sans-serif";
  ctx.fillText(`새해 만다라트: ${state.title || "나의 목표"}`, 80, 95);

  drawGrid(ctx, 80, 180, 900, state.title || "올해 목표", state.goals, "기본 만다라트");

  const startX = 1040;
  const startY = 180;
  const gap = 36;
  const subSize = 320;

  state.goals.forEach((goal, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const x = startX + col * (subSize + gap);
    const y = startY + row * (subSize + 70);
    drawGrid(ctx, x, y, subSize, goal || `핵심 계획 ${i + 1}`, state.details[i], `${i + 1}번 확장`);
  });

  const link = document.createElement("a");
  link.download = "mandalart-newyear.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
  statusText.textContent = "이미지 저장 완료! 갤러리/파일에서 확인하세요.";
}

copyBtn.addEventListener("click", () => {
  copyPlans().catch(() => {
    statusText.textContent = "복사에 실패했습니다. 브라우저 권한을 확인해주세요.";
  });
});

exportBtn.addEventListener("click", exportImage);

loadState();
renderOverview();
renderDetail();
