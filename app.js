const YSQ_SCHEMAS = [
  "Емоційна депривація (ED)", "Покинутість / Нестабільність (AB)", "Недовіра / Очікування зловживань (MA)",
  "Соціальна ізоляція / Відчуженість (SI)", "Дефективність / Сором (DS)", "Неуспішність (FA)",
  "Залежність / Некомпетентність (DI)", "Вразливість до шкоди та хвороб (VH)", "Злиття / Нерозвинена ідентичність (EM)",
  "Підкорення (SB)", "Самопожертва (SS)", "Пошук схвалення (AS)",
  "Негативізм / Песимізм (NP)", "Емоційне пригнічення (EI)", "Жорсткі стандарти / Гіперкритичність (US)",
  "Привілейованість / Грандіозність (ET)", "Недостатній самоконтроль (IS)", "Пунітивність (Покарання) (PU)"
];

window.addEventListener('DOMContentLoaded', () => {
  renderTestCatalog();
  renderSoothingCatalog();
  renderReflectCatalog();
  renderTestHistoryCard();
  renderReflectHistoryCard();
});

function changeTheme(val) {
  const themes = ['sunset', 'night', 'dawn'];
  document.documentElement.setAttribute('data-theme', themes[val]);
  document.querySelectorAll('.theme-btn').forEach((btn, idx) => {
    btn.classList.toggle('active', idx === parseInt(val));
  });
}
document.documentElement.setAttribute('data-theme', 'sunset');

function showSection(sectionId) {
  document.querySelectorAll('.site-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
  const navLink = document.getElementById('nav-' + sectionId);
  if (navLink) navLink.classList.add('active');
  
  if (sectionId === 'tests') {
    showExploreDashboard();
  } else {
    closeTest();
    closeReflect();
  }

  if (sectionId !== 'soothing') {
    if (isBreathing) toggleBreathing();
    if (isPMR) stopPMR();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showExploreDashboard() {
  document.getElementById('explore-dashboard').style.display = 'block';
  document.getElementById('test-catalog-view').style.display = 'none';
  document.getElementById('reflect-catalog-view').style.display = 'none';
  document.getElementById('active-test-container').style.display = 'none';
  document.getElementById('active-reflect-container').style.display = 'none';
  renderTestHistoryCard();
  renderReflectHistoryCard();
}

function openTestCatalog() {
  document.getElementById('explore-dashboard').style.display = 'none';
  document.getElementById('test-catalog-view').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openReflectCatalog() {
  document.getElementById('explore-dashboard').style.display = 'none';
  document.getElementById('reflect-catalog-view').style.display = 'block';
  renderReflectHistoryCard();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderTestCatalog() {
  const container = document.getElementById('test-catalog-container');
  container.innerHTML = '';
  if (typeof TESTS_DATABASE === 'undefined') return;

  const testCategories = [
    { id: 'emotional', title: 'Емоційний стан', tests: ['phq_9', 'gad_7'] },
    { id: 'personality', title: 'Схеми та режими', tests: ['ysq_s3', 'smq'] },
    { id: 'trauma', title: 'Травма та стрес', tests: ['pcl_5', 'aaq_2'] }
  ];

  let usedIds = new Set();

  testCategories.forEach(cat => {
    let hasTests = false;
    let html = `<h3 style="color:var(--accent-glow); font-family: 'Merriweather', serif; font-size: 22px; margin: 32px 0 16px; text-align: left;">${cat.title}</h3><div class="catalog-grid">`;
    
    cat.tests.forEach(testId => {
      if (TESTS_DATABASE[testId]) {
        const t = TESTS_DATABASE[testId];
        usedIds.add(testId);
        hasTests = true;
        html += `
          <div class="card clickable-card" onclick="openTest('${testId}')">
            <div class="card-inner-glow"></div>
            <div class="card-header-test" style="margin-bottom: 8px; padding-bottom: 0; border: none;">
              <div class="card-badge">${t.badge}</div>
              <div>
                <div class="card-title">${t.title}</div>
                <div class="card-sub">${t.instruction.substring(0, 95)}...</div>
              </div>
            </div>
          </div>`;
      }
    });
    html += `</div>`;
    if (hasTests) container.innerHTML += html;
  });

  let otherHtml = `<h3 style="color:var(--accent-glow); font-family: 'Merriweather', serif; font-size: 22px; margin: 32px 0 16px; text-align: left;">Інші методики</h3><div class="catalog-grid">`;
  let hasOther = false;
  for (let id in TESTS_DATABASE) {
    if (!usedIds.has(id)) {
      const t = TESTS_DATABASE[id];
      hasOther = true;
      otherHtml += `
          <div class="card clickable-card" onclick="openTest('${id}')">
            <div class="card-inner-glow"></div>
            <div class="card-header-test" style="margin-bottom: 8px; padding-bottom: 0; border: none;">
              <div class="card-badge">${t.badge}</div>
              <div>
                <div class="card-title">${t.title}</div>
                <div class="card-sub">${t.instruction.substring(0, 95)}...</div>
              </div>
            </div>
          </div>`;
    }
  }
  otherHtml += `</div>`;
  if (hasOther) container.innerHTML += otherHtml;
}

function renderSoothingCatalog() {
  const container = document.getElementById('soothing-catalog-container');
  container.innerHTML = '';
  if (typeof SOOTHING_DATABASE === 'undefined') return;

  for (let cat in SOOTHING_DATABASE) {
    const c = SOOTHING_DATABASE[cat];
    let html = `<h3 style="color:var(--accent-glow); font-family: 'Merriweather', serif; font-size: 22px; margin: 32px 0 16px; text-align: left;">${c.categoryTitle}</h3><div class="catalog-grid">`;
    c.items.forEach(item => {
      html += `
        <div class="card clickable-card" onclick="openSoothing('${cat}', '${item.id}')">
          <div class="card-inner-glow"></div>
          <div class="card-title" style="margin-bottom:8px; font-size: 18px;">${item.title}</div>
          <div class="card-sub">${item.sub}</div>
        </div>`;
    });
    html += `</div>`;
    container.innerHTML += html;
  }
}

let currentCatId = null;
let currentActiveSoothingId = null;
let currentSoothingItem = null;

function openSoothing(catId, itemId) {
  document.getElementById('soothing-catalog').style.display = 'none';
  document.getElementById('active-soothing-container').style.display = 'block';
  
  document.getElementById('soothing-breathing').style.display = 'none';
  document.getElementById('soothing-wizard').style.display = 'none';
  document.getElementById('soothing-pmr').style.display = 'none';
  document.getElementById('soothing-feedback').style.display = 'none';
  
  currentCatId = catId;
  currentActiveSoothingId = itemId;
  currentSoothingItem = SOOTHING_DATABASE[catId].items.find(x => x.id === itemId);
  
  if (currentSoothingItem.type === 'breathing') {
    document.getElementById('soothing-breathing').style.display = 'block';
    targetCycles = currentSoothingItem.cyclesTarget || 6;
    currentCycle = 1;
    document.getElementById('breatheCounter').innerText = `Цикл 1 з ${targetCycles}`;
  } else if (currentSoothingItem.type === 'wizard') {
    document.getElementById('soothing-wizard').style.display = 'block';
    currentWizardSteps = currentSoothingItem.steps;
    currentWizardStepIdx = 0;
    wizardAnswers = [];
    renderWizardStep();
  } else if (currentSoothingItem.type === 'pmr') {
    document.getElementById('soothing-pmr').style.display = 'block';
    document.getElementById('pmrOnboarding').style.display = 'block';
    document.getElementById('pmrMainInterface').style.display = 'none';
    pmrSteps = currentSoothingItem.steps;
    currentPmrStep = 0;
  }
}

function closeSoothing() {
  if (isBreathing) toggleBreathing();
  if (isPMR) stopPMR();
  document.getElementById('active-soothing-container').style.display = 'none';
  document.getElementById('soothing-catalog').style.display = 'block';
}

function showSoothingFeedback() {
  if (isBreathing) toggleBreathing();
  if (isPMR) stopPMR();
  
  document.getElementById('soothing-breathing').style.display = 'none';
  document.getElementById('soothing-wizard').style.display = 'none';
  document.getElementById('soothing-pmr').style.display = 'none';
  document.getElementById('soothing-feedback').style.display = 'block';

  const resContainer = document.getElementById('feedbackResultContainer');
  if (currentActiveSoothingId === 'safe_place') {
    resContainer.style.display = 'block';
    document.getElementById('feedbackTextarea').value = 
      `🌿 Моє безпечне місце:\n\n👁️ Я бачу: ${wizardAnswers[0] || '-'}\n🎧 Я чую: ${wizardAnswers[1] || '-'}\n🤚 Я відчуваю: ${wizardAnswers[2] || '-'}\n\n✨ Мій емоційний стан тут: ${wizardAnswers[3] || '-'}`;
  } else if (currentActiveSoothingId === 'values_card') {
    resContainer.style.display = 'block';
    document.getElementById('feedbackTextarea').value = 
      `🧭 Моя картка цінностей:\n\nУ стосунках я хочу būti: ${wizardAnswers[0] || '-'}\nУ діяльності для мене важливо: ${wizardAnswers[1] || '-'}\nМоє ставлення до себе: ${wizardAnswers[2] || '-'}\nМій життєвий вектор: ${wizardAnswers[3] || '-'}`;
  } else {
    resContainer.style.display = 'none';
  }
  
  const btnCopy = document.getElementById('btnCopyFeedback');
  if(btnCopy) btnCopy.innerHTML = '📋 Скопіювати текст';
}

function repeatCurrentSoothing() {
  openSoothing(currentCatId, currentActiveSoothingId);
}

let isBreathing = false;
let breathInterval = null;
let currentPhase = 0;
let currentCycle = 1;
let targetCycles = 6;

const breathPhases = [
  { text: "Вдих...", class: "phase-inhale" },
  { text: "Затримка...", class: "phase-hold1" },
  { text: "Видих...", class: "phase-exhale" },
  { text: "Затримка...", class: "phase-hold2" }
];

function toggleBreathing() {
  const bCircle = document.getElementById('breatheCircle');
  const bText = document.getElementById('breatheText');
  const bBtn = document.getElementById('btnBreatheToggle');
  const bCounter = document.getElementById('breatheCounter');

  if (isBreathing) {
    isBreathing = false;
    clearInterval(breathInterval);
    bCircle.className = 'breathe-circle';
    bText.innerText = "Готові?";
    bBtn.innerText = "Почати вправу";
    bBtn.classList.remove('btn-ghost');
    bCounter.innerText = `Цикл 1 з ${targetCycles}`;
  } else {
    isBreathing = true;
    currentPhase = 0;
    currentCycle = 1;
    bBtn.innerText = "Зупинити";
    bBtn.classList.add('btn-ghost');
    bCounter.innerText = `Цикл ${currentCycle} з ${targetCycles}`;
    runBreathPhase();
    breathInterval = setInterval(runBreathPhase, 4000);
  }
}

function runBreathPhase() {
  const bCircle = document.getElementById('breatheCircle');
  const bText = document.getElementById('breatheText');
  const bCounter = document.getElementById('breatheCounter');

  if (currentPhase === 0) {
    if (currentCycle > targetCycles) {
      toggleBreathing();
      showSoothingFeedback();
      return;
    }
    bCounter.innerText = `Цикл ${currentCycle} з ${targetCycles}`;
    currentCycle++;
  }

  const phase = breathPhases[currentPhase];
  bCircle.className = `breathe-circle ${phase.class}`;
  bText.style.opacity = 0;
  setTimeout(() => { bText.innerText = phase.text; bText.style.opacity = 1; }, 200);
  currentPhase = (currentPhase + 1) % 4;
}

let isPMR = false;
let pmrInterval = null;
let pmrSteps = [];
let currentPmrStep = 0;
let pmrTimeLeft = 0;
let isTension = true;

function togglePMR() {
  if (isPMR) {
    stopPMR();
    document.getElementById('pmrOnboarding').style.display = 'block';
    document.getElementById('pmrMainInterface').style.display = 'none';
  } else {
    document.getElementById('pmrOnboarding').style.display = 'none';
    document.getElementById('pmrMainInterface').style.display = 'block';
    isPMR = true;
    currentPmrStep = 0;
    isTension = true;
    startPmrPhase();
  }
}

function stopPMR() {
  isPMR = false;
  clearInterval(pmrInterval);
  document.getElementById('pmrTimer').innerText = "00";
  document.getElementById('pmrTimer').style.color = "var(--accent-glow)";
}

function startPmrPhase() {
  if (currentPmrStep >= pmrSteps.length) {
    stopPMR();
    showSoothingFeedback();
    return;
  }
  
  const stepData = pmrSteps[currentPmrStep];
  document.getElementById('pmrGroupLabel').innerText = stepData.label;
  
  if (isTension) {
    document.getElementById('pmrInstruction').innerText = `НАПРУЖИТИ: ${stepData.text}`;
    document.getElementById('pmrTimer').style.color = "#E63946";
    pmrTimeLeft = currentSoothingItem.tensionDuration || 5;
  } else {
    document.getElementById('pmrInstruction').innerText = "РОЗСЛАБИТИ: Зроби глибокий видих і відпусти усю напругу.";
    document.getElementById('pmrTimer').style.color = "var(--accent-glow)";
    pmrTimeLeft = currentSoothingItem.relaxationDuration || 10;
  }
  
  document.getElementById('pmrTimer').innerText = pmrTimeLeft.toString().padStart(2, '0');
  
  clearInterval(pmrInterval);
  pmrInterval = setInterval(() => {
    pmrTimeLeft--;
    document.getElementById('pmrTimer').innerText = pmrTimeLeft.toString().padStart(2, '0');
    if (pmrTimeLeft <= 0) {
      clearInterval(pmrInterval);
      if (isTension) {
        isTension = false;
      } else {
        isTension = true;
        currentPmrStep++;
      }
      startPmrPhase();
    }
  }, 1000);
}

let currentWizardSteps = [];
let currentWizardStepIdx = 0;
let wizardAnswers = [];

function renderWizardStep() {
  const s = currentWizardSteps[currentWizardStepIdx];
  document.getElementById('wizardTitle').innerText = s.title;
  document.getElementById('wizardText').innerText = s.text;
  const btn = document.getElementById('btnWizardNext');
  const inputsContainer = document.getElementById('wizardInputs');
  
  btn.innerText = (currentWizardStepIdx === currentWizardSteps.length - 1) ? "Завершити" : "Далі";
  inputsContainer.innerHTML = '';
  btn.disabled = false;

  if (s.inputType === 'text') {
    btn.disabled = true;
    const tarea = document.createElement('textarea');
    tarea.placeholder = s.placeholder || 'Ваша відповідь...';
    tarea.rows = 3;
    tarea.value = wizardAnswers[currentWizardStepIdx] || '';
    tarea.oninput = () => {
      wizardAnswers[currentWizardStepIdx] = tarea.value;
      btn.disabled = tarea.value.trim().length === 0;
    };
    inputsContainer.appendChild(tarea);
    if(wizardAnswers[currentWizardStepIdx] && wizardAnswers[currentWizardStepIdx].trim().length > 0) btn.disabled = false;
  } else if (currentActiveSoothingId === 'grounding_54321') {
    const inputCount = 5 - currentWizardStepIdx;
    if (inputCount > 0 && inputCount <= 5) {
      btn.disabled = true;
      if (!Array.isArray(wizardAnswers[currentWizardStepIdx])) {
          wizardAnswers[currentWizardStepIdx] = [];
      }
      for (let i = 0; i < inputCount; i++) {
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.placeholder = `Запишіть пункт ${i + 1}`;
        inp.value = wizardAnswers[currentWizardStepIdx][i] || '';
        inp.oninput = (e) => {
            wizardAnswers[currentWizardStepIdx][i] = e.target.value;
            validateWizardInputs();
        };
        inputsContainer.appendChild(inp);
      }
      validateWizardInputs();
    }
  }
}

function validateWizardInputs() {
  const inputs = document.querySelectorAll('#wizardInputs input');
  let allFilled = true;
  inputs.forEach(inp => { if (inp.value.trim().length === 0) allFilled = false; });
  document.getElementById('btnWizardNext').disabled = !allFilled;
}

function nextWizardStep() {
  if (currentWizardStepIdx < currentWizardSteps.length - 1) {
    currentWizardStepIdx++;
    renderWizardStep();
  } else {
    showSoothingFeedback();
  }
}

function copyWizardText() {
  const text = document.getElementById('feedbackTextarea').value;
  const btnCopy = document.getElementById('btnCopyFeedback');
  
  navigator.clipboard.writeText(text).then(() => {
    const originalHTML = btnCopy.innerHTML;
    btnCopy.innerHTML = '✅ Скопіювано!';
    setTimeout(() => { btnCopy.innerHTML = originalHTML; }, 2000);
  }).catch(err => {
    console.error('Не вдалося скопіювати текст: ', err);
  });
}

let activeTestId = null;
let currentTestDef = null;
let activeQuestions = [];
let currentIndex = 0;
let answers = {};
let currentResultRecord = null;
const TEST_HISTORY_KEY = 'vitaliy_psychologist_local_test_history_v1';
const REFLECT_HISTORY_KEY = 'vitaliy_psychologist_local_reflect_history_v1';

function openTest(testId) {
  activeTestId = testId;
  currentTestDef = TESTS_DATABASE[testId];
  activeQuestions = currentTestDef.questions;
  currentResultRecord = null;
  
  document.getElementById('test-catalog-view').style.display = 'none';
  document.getElementById('active-test-container').style.display = 'block';
  document.getElementById('activeTestBadge').innerText = currentTestDef.badge;
  document.getElementById('testInstruction').innerText = currentTestDef.instruction;
  
  resetTest(true);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeTest() {
  activeTestId = null;
  currentTestDef = null;
  document.getElementById('active-test-container').style.display = 'none';
  document.getElementById('test-catalog-view').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress() {
  if (!activeQuestions || activeQuestions.length === 0) return;
  const answeredCount = Object.keys(answers).length;
  document.getElementById('progressInner').style.width = `${Math.round((answeredCount / activeQuestions.length) * 100)}%`;
}

function renderQuestion(index){
  const q = activeQuestions[index];
  const qArea = document.getElementById('questionArea');
  
  if (currentTestDef.type === 'horizontal') {
    const scaleMax = currentTestDef.scaleMax;
    const hints = currentTestDef.hints;
    qArea.innerHTML = `
      <div aria-live="polite">
        <div class="question-num">Твердження ${index+1} із ${activeQuestions.length}</div>
        <div class="question-text">${q.text}</div>
        <div class="scale-row">
          ${Array.from({length: scaleMax}, (_, i) => i + 1).map(v => {
            const checked = (answers[q.id] === v) ? 'checked' : '';
            return `
              <div class="scale-item">
                <input type="radio" id="q${q.id}_v${v}" name="q${q.id}" value="${v}" ${checked} onchange="handleAnswer(${q.id},${v})">
                <label for="q${q.id}_v${v}">${v}</label>
              </div>`;
          }).join('')}
        </div>
        <div class="scale-hint-row">
          <div class="scale-hint">${hints[0]}</div>
          <div class="scale-hint">${hints[1]}</div>
        </div>
      </div>`;
  } else if (currentTestDef.type === 'vertical') {
    const optionsHTML = q.options.map(opt => {
      const checked = (answers[q.id] === opt.v) ? 'checked' : '';
      return `
        <input type="radio" id="q${q.id}_v${opt.v}" name="q${q.id}" value="${opt.v}" ${checked} onchange="handleAnswer(${q.id}, ${opt.v})">
        <label for="q${q.id}_v${opt.v}">
          <div style="flex:1;">${opt.t}</div>
        </label>`;
    }).join('');

    const titlePrefix = q.title ? 'Група' : 'Питання';
    const titleText = q.title ? q.title : '';
    const extraText = q.text ? `<div class="question-text" style="margin-bottom:16px; min-height:auto;">${q.text}</div>` : '';

    qArea.innerHTML = `
      <div aria-live="polite">
        <div class="question-num">${titlePrefix} ${index+1} із ${activeQuestions.length} ${titleText ? ': '+titleText : ''}</div>
        ${extraText}
        <div class="v-scale">${optionsHTML}</div>
      </div>`;
  }

  document.getElementById('qCounter').textContent = `Питання ${index+1} / ${activeQuestions.length}`;
  updateProgress();
  document.getElementById('btnPrev').disabled = (index === 0);
  
  if (index === activeQuestions.length - 1) {
    document.getElementById('btnNext').style.display = 'none';
    document.getElementById('btnFinish').style.display = 'inline-block';
  } else {
    document.getElementById('btnNext').style.display = 'inline-block';
    document.getElementById('btnFinish').style.display = 'none';
  }
}

function handleAnswer(qid, val){
  answers[qid] = val;
  updateProgress();
  if (currentIndex < activeQuestions.length - 1) {
    setTimeout(() => { currentIndex++; renderQuestion(currentIndex); }, 200);
  }
}

function prevQ(){ if(currentIndex > 0){ currentIndex--; renderQuestion(currentIndex); } }
function nextQ(){ if(currentIndex < activeQuestions.length - 1){ currentIndex++; renderQuestion(currentIndex); } }

function calculateYSQ(){
  const schemaMap = currentTestDef?.scoring?.schemaMap || {};
  const results = [];

  Object.entries(schemaMap).forEach(([schema, ids]) => {
    const values = ids.map(id => answers[id]).filter(v => typeof v === 'number');
    if (!values.length) return;
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    let level = 'Низька вираженість';
    if (mean >= 4) level = "<span style='color:var(--accent-glow); font-weight:700;'>Висока вираженість</span>";
    else if (mean >= 3) level = 'Помірна вираженість';
    else if (mean >= 2) level = 'Легка вираженість';
    results.push({ schema, sum: mean.toFixed(1), rawSum: sum, items: values.length, htmlLevel: level });
  });

  return results.sort((a, b) => Number(b.sum) - Number(a.sum));
}

function calculatePCL5(){
  let total = 0, b = 0, c = 0, d = 0, e = 0;
  for (let id in answers) {
    let v = answers[id];
    let numId = parseInt(id, 10);
    total += v;
    if (numId <= 5) b += v;
    else if (numId <= 7) c += v;
    else if (numId <= 14) d += v;
    else e += v;
  }
  let level = total >= 31 ? "<span style='color:var(--accent-glow); font-weight:700;'>Вище рекомендованого скринінгового порогу</span>" : "Нижче рекомендованого скринінгового порогу";
  return [
    { schema: "Загальний бал", sum: total, htmlLevel: level },
    { schema: "Кластер B — вторгнення", sum: b, htmlLevel: "" },
    { schema: "Кластер C — уникнення", sum: c, htmlLevel: "" },
    { schema: "Кластер D — негативні зміни в думках і настрої", sum: d, htmlLevel: "" },
    { schema: "Кластер E — збудження та реактивність", sum: e, htmlLevel: "" }
  ];
}

function calculateSMQ(){
  const rows = [];
  let riskTotal = 0;
  let resourceTotal = 0;
  let activeRisk = 0;
  let activeResource = 0;

  activeQuestions.forEach(q => {
    const v = answers[q.id] || 0;
    const isResource = q.modeType === 'resource';
    if (isResource) {
      resourceTotal += v;
      if (v >= 4) activeResource++;
    } else {
      riskTotal += v;
      if (v >= 4) activeRisk++;
    }
    rows.push({
      schema: q.mode || `Пункт ${q.id}`,
      sum: v,
      htmlLevel: isResource ? 'Ресурсний режим' : (v >= 4 ? "<span style='color:var(--accent-glow); font-weight:700;'>Виражений режим</span>" : 'Не домінує')
    });
  });

  return [
    { schema: "Сумарний бал проблемних режимів", sum: riskTotal, htmlLevel: activeRisk ? `Виражених режимів: ${activeRisk}` : 'Без вираженого домінування' },
    { schema: "Сумарний бал ресурсних режимів", sum: resourceTotal, htmlLevel: activeResource ? `Ресурсних режимів: ${activeResource}` : 'Ресурсні режими не виражені' },
    ...rows
  ];
}

function calculateGenericScore(thresholds){
  let score = 0;
  for (let qid in answers) score += answers[qid];
  let levelStr = thresholds.find(t => score >= t.min && score <= t.max)?.text || 'Орієнтовний сумарний бал';
  return [
    { schema: "Загальний бал", sum: score, htmlLevel: levelStr }
  ];
}

function calculateAAQ2(){
  let score = 0;
  for (let qid in answers) score += answers[qid];
  let level = 'Нижчий рівень психологічної негнучкості';
  if (score >= 25) level = "<span style='color:var(--accent-glow); font-weight:700;'>Підвищений рівень психологічної негнучкості / уникання</span>";
  else if (score >= 19) level = 'Помірний рівень психологічної негнучкості / уникання';
  return [{ schema: "Загальний бал", sum: score, htmlLevel: level }];
}

function calculatePHQ9(){
  let score = 0;
  for (let qid in answers) score += answers[qid];
  const suicideItem = answers[9] || 0;
  let level = 'Мінімальний рівень депресивних симптомів';
  if (score >= 20) level = "<span style='color:var(--accent-glow); font-weight:700;'>Високий рівень депресивних симптомів</span>";
  else if (score >= 15) level = 'Помірно високий рівень депресивних симптомів';
  else if (score >= 10) level = 'Помірний рівень депресивних симптомів';
  else if (score >= 5) level = 'Легкий рівень депресивних симптомів';
  const rows = [{ schema: "Загальний бал", sum: score, htmlLevel: level }];
  if (suicideItem > 0) {
    rows.push({
      schema: "Пункт про самоушкодження",
      sum: suicideItem,
      htmlLevel: "<span style='color:var(--accent-glow); font-weight:700;'>Потребує окремої уваги та розмови з фахівцем</span>"
    });
  }
  return rows;
}

function getPlainText(value) {
  const div = document.createElement('div');
  div.innerHTML = value || '';
  return div.textContent || div.innerText || '';
}

function getTestHistory() {
  try {
    return JSON.parse(localStorage.getItem(TEST_HISTORY_KEY) || '[]');
  } catch (_) {
    return [];
  }
}

function setTestHistory(history) {
  localStorage.setItem(TEST_HISTORY_KEY, JSON.stringify(history));
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
}

function buildTestResultText(record) {
  const date = new Date(record.timestamp).toLocaleString('uk-UA');
  let text = `Результат опитувальника

`;
  text += `Тест: ${record.testTitle}
`;
  text += `Дата: ${date}
`;
  text += `
Показники:
`;
  record.results.forEach(r => {
    text += `• ${r.schema}: ${r.sum}`;
    if (r.level) text += ` — ${r.level}`;
    text += `
`;
  });
  text += `
Примітка: результат не є діагнозом і має орієнтовний інформаційний характер.`;
  return text;
}

function getResultFilters(history) {
  const map = new Map();
  history.forEach(record => {
    if (!record.testId) return;
    const label = record.badge || TESTS_DATABASE?.[record.testId]?.badge || record.testId.toUpperCase();
    map.set(record.testId, label);
  });
  return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], 'uk'));
}

function getActiveHistoryFilter() {
  return document.getElementById('testHistoryContent')?.dataset.filter || 'all';
}

function setHistoryFilter(filter) {
  const content = document.getElementById('testHistoryContent');
  if (content) content.dataset.filter = filter;
  renderTestHistoryCard();
}

function getScalePercent(value, maxValue) {
  const number = Number(value);
  if (!Number.isFinite(number) || maxValue <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((number / maxValue) * 100)));
}

function renderResultScaleBars(record) {
  const numericValues = record.results.map(r => Number(r.sum)).filter(Number.isFinite);
  const maxValue = Number(record.scaleMax) || Math.max(...numericValues, 1);
  return `
    <div class="scale-bars">
      ${record.results.map(r => {
        const score = Number(r.sum);
        const rowMax = Number(r.max) || maxValue;
        const percent = getScalePercent(score, rowMax);
        return `
          <div class="scale-bar-row">
            <div class="scale-bar-name">${escapeHTML(r.schema)}</div>
            <div class="scale-bar-score">${escapeHTML(r.sum)}</div>
            <div class="scale-bar-level">${escapeHTML(r.level || '-')}</div>
            <div class="scale-bar-track"><div class="scale-bar-fill" style="width:${percent}%"></div></div>
          </div>`;
      }).join('')}
    </div>`;
}

function toggleHistoryDetails(id) {
  const item = document.querySelector(`[data-history-id="${CSS.escape(id)}"]`);
  if (!item) return;
  item.classList.toggle('open');
  const btn = item.querySelector('.history-details-toggle');
  if (btn) btn.textContent = item.classList.contains('open') ? 'Сховати' : 'Деталі';
}

function renderTestHistoryCard() {
  const content = document.getElementById('testHistoryContent');
  const controls = document.getElementById('testHistoryControls');
  if (!content || !controls) return;

  const history = getTestHistory().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const activeFilter = getActiveHistoryFilter();

  if (!history.length) {
    content.className = 'history-panel-empty';
    content.innerHTML = 'Збережених результатів поки немає. Після проходження тесту можна зберегти результат на цьому пристрої й бачити власну динаміку.';
    controls.style.display = 'none';
    return;
  }

  controls.style.display = 'flex';
  const filters = getResultFilters(history);
  const filteredHistory = activeFilter === 'all' ? history : history.filter(record => record.testId === activeFilter);
  content.className = '';
  content.innerHTML = `
    <div class="history-filter-row">
      <button type="button" class="history-filter-btn ${activeFilter === 'all' ? 'active' : ''}" onclick="setHistoryFilter('all')">Усі</button>
      ${filters.map(([id, label]) => `<button type="button" class="history-filter-btn ${activeFilter === id ? 'active' : ''}" onclick="setHistoryFilter('${escapeHTML(id)}')">${escapeHTML(label)}</button>`).join('')}
    </div>
    <div class="history-list">
      ${filteredHistory.map(record => {
        const main = record.results[0] || {};
        const date = new Date(record.timestamp).toLocaleDateString('uk-UA');
        const badge = record.badge || TESTS_DATABASE?.[record.testId]?.badge || 'TEST';
        return `
          <div class="history-item" data-history-id="${escapeHTML(record.id)}">
            <div class="history-item-main">
              <div>
                <div class="history-meta-label">Дата</div>
                <div class="history-meta-value">${escapeHTML(date)}</div>
              </div>
              <div>
                <div class="history-meta-label">Тест</div>
                <div class="history-meta-value">${escapeHTML(record.testTitle || badge)}</div>
              </div>
              <div>
                <div class="history-meta-label">Бал</div>
                <div class="history-meta-value">${escapeHTML(main.sum ?? '-')}</div>
              </div>
              <div>
                <div class="history-meta-label">Рівень</div>
                <div class="history-meta-value">${escapeHTML(main.level || '-')}</div>
              </div>
              <button type="button" class="btn-ghost history-details-toggle" onclick="toggleHistoryDetails('${escapeHTML(record.id)}')">Деталі</button>
            </div>
            <div class="history-details">${renderResultScaleBars(record)}</div>
          </div>`;
      }).join('')}
    </div>`;
}

function saveCurrentTestResult() {
  const status = document.getElementById('testSaveStatus');
  if (!currentResultRecord) {
    if (status) status.textContent = 'Немає результату для збереження.';
    return;
  }

  const history = getTestHistory();
  const exists = history.some(item => item.id === currentResultRecord.id);
  if (!exists) history.push(currentResultRecord);
  setTestHistory(history);
  renderTestHistoryCard();

  if (status) {
    status.textContent = exists ? 'Цей результат уже збережений на цьому пристрої.' : 'Результат збережено на цьому пристрої.';
  }
}

function clearTestHistory() {
  if (!confirm('Очистити локальну історію результатів на цьому пристрої?')) return;
  localStorage.removeItem(TEST_HISTORY_KEY);
  renderTestHistoryCard();
  const status = document.getElementById('testSaveStatus');
  if (status) status.textContent = 'Локальну історію очищено.';
}

function exportTestHistory() {
  const history = getTestHistory();
  if (!history.length) return;
  const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `test-history-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importTestHistory(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) throw new Error('Invalid history format');
      const current = getTestHistory();
      const byId = new Map(current.map(item => [item.id, item]));
      imported.forEach(item => {
        if (item && item.id && item.timestamp && Array.isArray(item.results)) byId.set(item.id, item);
      });
      setTestHistory([...byId.values()].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      renderTestHistoryCard();
    } catch (_) {
      alert('Не вдалося імпортувати історію. Перевір файл JSON.');
    }
  };
  reader.readAsText(file);
}

function copyTestResult() {
  const area = document.getElementById('testResultText');
  const btn = document.getElementById('btnCopyTestResult');
  if (!area || !area.value) return;

  navigator.clipboard.writeText(area.value).then(() => {
    const original = btn.innerHTML;
    btn.innerHTML = '✅ Скопійовано!';
    setTimeout(() => { btn.innerHTML = original; }, 1800);
  }).catch(() => {
    area.select();
    document.execCommand('copy');
  });
}

function showResults(){
  const tbody = document.querySelector('#resultTable tbody');
  tbody.innerHTML = '';
  const descBlock = document.getElementById('schemaDescriptions');
  const renderedRows = [];

  const addRow = (schema, sum, levelHtml = '') => {
    const levelText = getPlainText(levelHtml).trim();
    tbody.innerHTML += `<tr><td>${schema}</td><td>${sum}</td><td>${levelHtml}</td></tr>`;
    renderedRows.push({ schema, sum, level: levelText });
  };

  if (activeTestId === 'ysq_s3') {
    const results = calculateYSQ();
    results.forEach(r => {
      if(Number(r.sum) > 0) addRow(r.schema, r.sum, r.htmlLevel);
    });
    descBlock.innerHTML = 'Це схема-орієнтована карта саморефлексії, а не офіційний YSQ-S3 і не діагноз. Бал показує середню вираженість теми за шкалою 1–6.';
  } else if (activeTestId === 'pcl_5') {
    calculatePCL5().forEach(r => addRow(r.schema, r.sum, r.htmlLevel));
    descBlock.innerHTML = 'PCL-5 є скринінговим інструментом. Показник вище порогу не є діагнозом і потребує клінічної оцінки з урахуванням конкретної стресової події.';
  } else if (activeTestId === 'smq') {
    calculateSMQ().forEach(r => addRow(r.schema, r.sum, r.htmlLevel));
    descBlock.innerHTML = 'Це коротка карта схема-режимів для саморефлексії, а не стандартизований Schema Mode Inventory і не діагноз. Ресурсні режими рахуються окремо від проблемних.';
  } else {
    let results = [];
    if (activeTestId === 'phq_9') results = calculatePHQ9();
    if (activeTestId === 'gad_7') results = calculateGenericScore([{min:0,max:4,text:"Мінімальний рівень тривожних симптомів"},{min:5,max:9,text:"Легкий рівень тривожних симптомів"},{min:10,max:14,text:"Помірний рівень тривожних симптомів"},{min:15,max:999,text:"<span style='color:var(--accent-glow); font-weight:700;'>Високий рівень тривожних симптомів</span>"}]);
    if (activeTestId === 'aaq_2') results = calculateAAQ2();
    if (!results.length) results = calculateGenericScore([{min:0,max:999,text:"Орієнтовний сумарний бал"}]);
    results.forEach(r => addRow(r.schema, r.sum, r.htmlLevel));
    if (activeTestId === 'phq_9') descBlock.innerHTML = 'PHQ-9 є скринінговим опитувальником. Результат не є діагнозом. Будь-яка відповідь вище 0 у пункті про самоушкодження потребує окремої уваги та звернення по підтримку.';
    else if (activeTestId === 'gad_7') descBlock.innerHTML = 'GAD-7 є скринінговим опитувальником тривожних симптомів. Результат не є діагнозом і має обговорюватися з фахівцем у контексті життя людини.';
    else if (activeTestId === 'aaq_2') descBlock.innerHTML = 'AAQ-II відображає рівень психологічної негнучкості та уникання досвіду. Це не діагноз, а орієнтир для саморефлексії.';
    else descBlock.innerHTML = 'Результати призначені виключно для саморефлексії та ознайомлення. Вони не є діагнозом.';
  }

  currentResultRecord = {
    id: `${activeTestId}-${Date.now()}`,
    testId: activeTestId,
    testTitle: currentTestDef?.title || activeTestId,
    badge: currentTestDef?.badge || 'TEST',
    timestamp: new Date().toISOString(),
    results: renderedRows
  };

  const resultText = buildTestResultText(currentResultRecord);
  const resultTextArea = document.getElementById('testResultText');
  const resultActions = document.getElementById('testResultActions');
  const status = document.getElementById('testSaveStatus');
  if (resultTextArea) resultTextArea.value = resultText;
  if (resultActions) resultActions.style.display = 'block';
  if (status) status.textContent = '';

  document.getElementById('resultBox').style.display = 'block';
  document.getElementById('progressInner').style.width = '100%';
  const btnFinish = document.getElementById('btnFinish');
  btnFinish.innerText = 'Готово';
  btnFinish.disabled = true;
  btnFinish.style.color = 'var(--accent-glow)';
  btnFinish.style.borderColor = 'var(--accent-amber)';
}

function finish() {
  const missing = activeQuestions.find(q => answers[q.id] === undefined);
  if (missing) {
    currentIndex = activeQuestions.findIndex(q => q.id === missing.id);
    renderQuestion(currentIndex);
    const qNum = document.querySelector('.question-num');
    if (qNum) qNum.innerHTML += ` <span style="color:var(--accent-amber);">* Оберіть відповідь</span>`;
    return;
  }

  showResults();
  document.getElementById('resultBox').scrollIntoView({behavior:'smooth'});
}

let resetConfirmation = false;
function resetTest(force = false) {
  const btn = document.getElementById('btnReset');
  if (!force && !resetConfirmation) {
    resetConfirmation = true;
    btn.innerText = "Точно видалити?";
    btn.style.color = "#ff6b6b";
    setTimeout(() => { resetConfirmation = false; btn.innerText = "Скинути"; btn.style.color = ""; }, 3000);
    return;
  }
  answers = {}; currentIndex = 0;
  document.getElementById('resultBox').style.display = 'none';
  document.getElementById('testResultActions').style.display = 'none';
  document.getElementById('testResultText').value = '';
  document.getElementById('testSaveStatus').textContent = '';
  currentResultRecord = null;
  document.getElementById('progressInner').style.width = '0%';
  document.getElementById('btnFinish').innerText = "Завершити";
  document.getElementById('btnFinish').disabled = false;
  document.getElementById('btnFinish').style = "";
  renderQuestion(0);
  resetConfirmation = false;
  btn.innerText = "Скинути";
  btn.style.color = "";
}

function openLightbox(src) {
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  lbImg.src = src;
  lb.style.display = 'flex';
  setTimeout(() => lb.classList.add('active'), 10);
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  lb.classList.remove('active');
  setTimeout(() => lb.style.display = 'none', 300);
}

// --- REFLECT LOGIC ---
let currentReflectCatId = null;
let currentReflectItemId = null;
let currentReflectItem = null;
let currentReflectSteps = [];
let currentReflectStepIdx = 0;
let reflectAnswers = [];
let currentReflectResultRecord = null;

window.updateSlider = function(sliderId, value) {
  const valDisplay = document.getElementById(`val-${sliderId}`);
  if (valDisplay) valDisplay.innerText = value;
  
  const s = currentReflectSteps[currentReflectStepIdx];
  if (s && s.inputType === 'sliders') {
    if (!reflectAnswers[currentReflectStepIdx]) reflectAnswers[currentReflectStepIdx] = {};
    reflectAnswers[currentReflectStepIdx][sliderId] = parseInt(value, 10);
    
    if (s.visualType === 'triangle') {
      updateSDTTriangle();
    }
  }
}


function getReflectHistory() {
  try {
    return JSON.parse(localStorage.getItem(REFLECT_HISTORY_KEY) || '[]');
  } catch (_) {
    return [];
  }
}

function setReflectHistory(history) {
  localStorage.setItem(REFLECT_HISTORY_KEY, JSON.stringify(history));
}

function getReflectFilters(history) {
  const map = new Map();
  history.forEach(record => {
    if (record.reflectId) map.set(record.reflectId, record.shortTitle || record.reflectTitle || record.reflectId);
  });
  return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], 'uk'));
}

function getActiveReflectHistoryFilter() {
  return document.getElementById('reflectHistoryContent')?.dataset.filter || 'all';
}

function setReflectHistoryFilter(filter) {
  const content = document.getElementById('reflectHistoryContent');
  if (content) content.dataset.filter = filter;
  renderReflectHistoryCard();
}

function getScoreLevel(value) {
  const v = Number(value);
  if (!Number.isFinite(v)) return '-';
  if (v <= 3) return 'Низький показник';
  if (v <= 6) return 'Середній показник';
  return 'Високий показник';
}

function getReflectResultRows() {
  const rows = [];
  currentReflectSteps.forEach((step, i) => {
    if (step.inputType !== 'sliders' || !reflectAnswers[i]) return;
    step.sliders.forEach(sl => {
      const value = Number(reflectAnswers[i][sl.id]);
      if (!Number.isFinite(value)) return;
      rows.push({
        schema: sl.label,
        sum: value,
        level: getScoreLevel(value),
        htmlLevel: getScoreLevel(value),
        max: sl.max || 10
      });
    });
  });
  const average = rows.length ? Number((rows.reduce((acc, row) => acc + Number(row.sum), 0) / rows.length).toFixed(1)) : 0;
  const mainLabel = currentReflectItemId === 'cocoon_civilian'
    ? 'Середній показник психоемоційного стану'
    : currentReflectItemId === 'self_determination'
      ? 'Середній рівень задоволеності базових потреб'
      : 'Середній показник';
  return [
    { schema: mainLabel, sum: average, level: getScoreLevel(average), htmlLevel: getScoreLevel(average), max: 10 },
    ...rows
  ];
}

function buildReflectResultRecord(text) {
  const results = getReflectResultRows();
  return {
    id: `reflect-${currentReflectItemId}-${Date.now()}`,
    type: 'reflect',
    timestamp: new Date().toISOString(),
    reflectId: currentReflectItemId,
    reflectTitle: currentReflectItem.title,
    shortTitle: currentReflectItemId === 'cocoon_civilian' ? 'Кокун' : currentReflectItemId === 'self_determination' ? 'Потреби' : currentReflectItem.title,
    badge: currentReflectItemId === 'cocoon_civilian' ? 'Кокун' : 'Потреби',
    scaleMax: 10,
    results,
    text
  };
}

function renderReflectHistoryCard() {
  const content = document.getElementById('reflectHistoryContent');
  const controls = document.getElementById('reflectHistoryControls');
  if (!content || !controls) return;

  const history = getReflectHistory().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const activeFilter = getActiveReflectHistoryFilter();

  if (!history.length) {
    content.className = 'history-panel-empty';
    content.innerHTML = 'Збережених результатів поки немає. Після проходження картки можна зберегти результат і бачити власну динаміку стану або базових потреб.';
    controls.style.display = 'none';
    return;
  }

  controls.style.display = 'flex';
  const filters = getReflectFilters(history);
  const filteredHistory = activeFilter === 'all' ? history : history.filter(record => record.reflectId === activeFilter);
  content.className = '';
  content.innerHTML = `
    <div class="history-filter-row">
      <button type="button" class="history-filter-btn ${activeFilter === 'all' ? 'active' : ''}" onclick="setReflectHistoryFilter('all')">Усі</button>
      ${filters.map(([id, label]) => `<button type="button" class="history-filter-btn ${activeFilter === id ? 'active' : ''}" onclick="setReflectHistoryFilter('${escapeHTML(id)}')">${escapeHTML(label)}</button>`).join('')}
    </div>
    <div class="history-list">
      ${filteredHistory.map(record => {
        const main = record.results[0] || {};
        const date = new Date(record.timestamp).toLocaleDateString('uk-UA');
        return `
          <div class="history-item" data-history-id="${escapeHTML(record.id)}">
            <div class="history-item-main">
              <div>
                <div class="history-meta-label">Дата</div>
                <div class="history-meta-value">${escapeHTML(date)}</div>
              </div>
              <div>
                <div class="history-meta-label">Картка</div>
                <div class="history-meta-value">${escapeHTML(record.reflectTitle || record.shortTitle || '-')}</div>
              </div>
              <div>
                <div class="history-meta-label">Бал</div>
                <div class="history-meta-value">${escapeHTML(main.sum ?? '-')} / 10</div>
              </div>
              <div>
                <div class="history-meta-label">Рівень</div>
                <div class="history-meta-value">${escapeHTML(main.level || '-')}</div>
              </div>
              <button type="button" class="btn-ghost history-details-toggle" onclick="toggleHistoryDetails('${escapeHTML(record.id)}')">Деталі</button>
            </div>
            <div class="history-details">${renderResultScaleBars(record)}</div>
          </div>`;
      }).join('')}
    </div>`;
}

function saveCurrentReflectResult() {
  const status = document.getElementById('reflectSaveStatus');
  if (!currentReflectResultRecord) {
    if (status) status.textContent = 'Немає результату для збереження.';
    return;
  }
  const history = getReflectHistory();
  const exists = history.some(item => item.id === currentReflectResultRecord.id);
  if (!exists) history.push(currentReflectResultRecord);
  setReflectHistory(history);
  renderReflectHistoryCard();
  if (status) status.textContent = exists ? 'Цей результат уже збережений на цьому пристрої.' : 'Результат збережено на цьому пристрої.';
}

function clearReflectHistory() {
  if (!confirm('Очистити локальну історію рефлексії на цьому пристрої?')) return;
  localStorage.removeItem(REFLECT_HISTORY_KEY);
  renderReflectHistoryCard();
  const status = document.getElementById('reflectSaveStatus');
  if (status) status.textContent = 'Локальну історію рефлексії очищено.';
}

function exportReflectHistory() {
  const history = getReflectHistory();
  if (!history.length) return;
  const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reflect-history-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importReflectHistory(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) throw new Error('Invalid history format');
      const current = getReflectHistory();
      const byId = new Map(current.map(item => [item.id, item]));
      imported.forEach(item => {
        if (item && item.id && item.timestamp && Array.isArray(item.results)) byId.set(item.id, item);
      });
      setReflectHistory([...byId.values()].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      renderReflectHistoryCard();
    } catch (_) {
      alert('Не вдалося імпортувати історію. Перевір файл JSON.');
    }
  };
  reader.readAsText(file);
}

function renderReflectCatalog() {
  const container = document.getElementById('reflect-catalog-container');
  container.innerHTML = '';
  if (typeof REFLECT_DATABASE === 'undefined') return;

  for (let cat in REFLECT_DATABASE) {
    const c = REFLECT_DATABASE[cat];
    let html = `<h3 style="color:var(--accent-glow); font-family:'Merriweather',serif; font-size:22px; margin:32px 0 16px; text-align:left;">${c.categoryTitle}</h3><div class="catalog-grid">`;
    c.items.forEach(item => {
      html += `
        <div class="card clickable-card" onclick="openReflect('${cat}','${item.id}')">
          <div class="card-inner-glow"></div>
          <div class="card-title" style="margin-bottom:8px; font-size:18px;">${item.title}</div>
          <div class="card-sub">${item.sub}</div>
        </div>`;
    });
    html += `</div>`;
    container.innerHTML += html;
  }
}

function openReflect(catId, itemId) {
  document.getElementById('reflect-catalog-view').style.display = 'none';
  document.getElementById('active-reflect-container').style.display = 'block';
  document.getElementById('reflect-wizard').style.display = 'none';
  document.getElementById('reflect-feedback').style.display = 'none';

  currentReflectCatId = catId;
  currentReflectItemId = itemId;
  currentReflectItem = REFLECT_DATABASE[catId].items.find(x => x.id === itemId);
  currentReflectSteps = currentReflectItem.steps;
  currentReflectStepIdx = 0;
  reflectAnswers = [];

  document.getElementById('reflect-wizard').style.display = 'block';
  renderReflectStep();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeReflect() {
  document.getElementById('active-reflect-container').style.display = 'none';
  document.getElementById('reflect-catalog-view').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderReflectStep() {
  const s = currentReflectSteps[currentReflectStepIdx];
  document.getElementById('r-wizardTitle').innerText = s.title;
  document.getElementById('r-wizardText').innerText = s.text;
  const btn = document.getElementById('r-btnNext');
  const container = document.getElementById('r-wizardInputs');
  const visualWrapper = document.getElementById('r-visual-wrapper');

  btn.innerText = (currentReflectStepIdx === currentReflectSteps.length - 1) ? "Завершити" : "Далі";
  container.innerHTML = '';
  visualWrapper.innerHTML = '';
  visualWrapper.style.display = 'none';
  btn.disabled = false;

  if (s.inputType === 'text') {
    btn.disabled = true;
    const tarea = document.createElement('textarea');
    tarea.placeholder = s.placeholder || 'Твоя відповідь...';
    tarea.rows = 3;
    tarea.value = reflectAnswers[currentReflectStepIdx] || '';
    tarea.oninput = () => {
      reflectAnswers[currentReflectStepIdx] = tarea.value;
      btn.disabled = tarea.value.trim().length === 0;
    };
    container.appendChild(tarea);
    if (tarea.value && tarea.value.trim().length > 0) btn.disabled = false;
  } else if (s.inputType === 'sliders') {
    if (!reflectAnswers[currentReflectStepIdx]) {
      reflectAnswers[currentReflectStepIdx] = {};
      s.sliders.forEach(sl => reflectAnswers[currentReflectStepIdx][sl.id] = 5);
    }
    
    s.sliders.forEach(sl => {
      const group = document.createElement('div');
      group.className = 'slider-group';
      const val = reflectAnswers[currentReflectStepIdx][sl.id];
      const maxVal = sl.max || 10;
      
      group.innerHTML = `
        <label>${sl.label} <span class="slider-value"><span id="val-${sl.id}">${val}</span> / ${maxVal}</span></label>
        <input type="range" min="${sl.min || 0}" max="${maxVal}" value="${val}" oninput="updateSlider('${sl.id}', this.value)">
      `;
      container.appendChild(group);
    });

    if (s.visualType === 'triangle') {
      visualWrapper.style.display = 'flex';
      updateSDTTriangle();
    }
  }
}

function updateSDTTriangle() {
  const visualWrapper = document.getElementById('r-visual-wrapper');
  if (!visualWrapper) return;

  const currentAns = reflectAnswers[currentReflectStepIdx] || {};
  const autonomy = currentAns['sdt_autonomy'] !== undefined ? currentAns['sdt_autonomy'] : 5;
  const competence = currentAns['sdt_competence'] !== undefined ? currentAns['sdt_competence'] : 5;
  const relatedness = currentAns['sdt_relatedness'] !== undefined ? currentAns['sdt_relatedness'] : 5;

  const cx = 100;
  const cy = 110;
  const rMax = 75;

  const getCoords = (val, angleDeg) => {
    const angleRad = (angleDeg - 90) * Math.PI / 180;
    const r = (val / 10) * rMax;
    return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
  };

  const pAuth = getCoords(autonomy, 0);
  const pComp = getCoords(competence, 120);
  const pRel = getCoords(relatedness, 240);
  
  const pAuthMax = getCoords(10, 0);
  const pCompMax = getCoords(10, 120);
  const pRelMax = getCoords(10, 240);

  visualWrapper.innerHTML = `
    <svg width="200" height="220" viewBox="0 0 200 220" style="overflow: visible;">
      <polygon points="${pAuthMax.x},${pAuthMax.y} ${pCompMax.x},${pCompMax.y} ${pRelMax.x},${pRelMax.y}" fill="none" stroke="var(--border-soft)" stroke-width="1" stroke-dasharray="4"/>
      <line x1="${cx}" y1="${cy}" x2="${pAuthMax.x}" y2="${pAuthMax.y}" stroke="var(--border-soft)" stroke-width="0.5" />
      <line x1="${cx}" y1="${cy}" x2="${pCompMax.x}" y2="${pCompMax.y}" stroke="var(--border-soft)" stroke-width="0.5" />
      <line x1="${cx}" y1="${cy}" x2="${pRelMax.x}" y2="${pRelMax.y}" stroke="var(--border-soft)" stroke-width="0.5" />
      <polygon points="${pAuth.x},${pAuth.y} ${pComp.x},${pComp.y} ${pRel.x},${pRel.y}" fill="rgba(184, 122, 53, 0.2)" stroke="var(--accent-glow)" stroke-width="2" style="transition: points 0.2s ease;"/>
      <text x="${pAuthMax.x}" y="${pAuthMax.y - 12}" text-anchor="middle" font-size="12" font-weight="500" fill="var(--text-main)">Автономія</text>
      <text x="${pCompMax.x + 10}" y="${pCompMax.y + 8}" text-anchor="start" font-size="12" font-weight="500" fill="var(--text-main)">Компетентність</text>
      <text x="${pRelMax.x - 10}" y="${pRelMax.y + 8}" text-anchor="end" font-size="12" font-weight="500" fill="var(--text-main)">Причетність</text>
    </svg>
  `;
}

function nextReflectStep() {
  if (currentReflectStepIdx < currentReflectSteps.length - 1) {
    currentReflectStepIdx++;
    renderReflectStep();
  } else {
    showReflectFeedback();
  }
}

function showReflectFeedback() {
  document.getElementById('reflect-wizard').style.display = 'none';
  document.getElementById('reflect-feedback').style.display = 'block';

  let text = `📋 ${currentReflectItem.title}\n\n`;
  currentReflectSteps.forEach((step, i) => {
    if (step.inputType === 'text' && reflectAnswers[i]) {
      text += `${step.title}:\n${reflectAnswers[i]}\n\n`;
    } else if (step.inputType === 'sliders' && reflectAnswers[i]) {
      text += `${step.title}:\n`;
      step.sliders.forEach(sl => {
        const val = reflectAnswers[i][sl.id];
        text += `• ${sl.label}: ${val} / ${sl.max || 10}\n`;
      });
      text += `\n`;
    }
  });

  const resultText = text.trim();
  currentReflectResultRecord = buildReflectResultRecord(resultText);

  document.getElementById('r-feedbackResultContainer').style.display = 'block';
  document.getElementById('r-feedbackTextarea').value = resultText;
  document.getElementById('r-btnCopy').innerHTML = '📋 Скопіювати текст';
  const reflectStatus = document.getElementById('reflectSaveStatus');
  if (reflectStatus) reflectStatus.textContent = '';
}

function copyReflectText() {
  const text = document.getElementById('r-feedbackTextarea').value;
  const btn = document.getElementById('r-btnCopy');
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = '✅ Скопіювано!';
    setTimeout(() => { btn.innerHTML = orig; }, 2000);
  }).catch(() => {});
}

function repeatReflect() {
  openReflect(currentReflectCatId, currentReflectItemId);
}

document.getElementById('btnPrev').addEventListener('click', prevQ);
document.getElementById('btnNext').addEventListener('click', nextQ);
document.getElementById('btnFinish').addEventListener('click', finish);
document.getElementById('btnReset').addEventListener('click', () => resetTest(false));
