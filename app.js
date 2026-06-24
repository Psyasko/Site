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

function scrollToElementCenter(target) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  requestAnimationFrame(() => {
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  });
}

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
  renderTestCatalog();
  scrollToElementCenter('#test-catalog-view');
}


function openReflectCatalog() {
  document.getElementById('explore-dashboard').style.display = 'none';
  document.getElementById('reflect-catalog-view').style.display = 'block';
  renderReflectHistoryCard();
  scrollToElementCenter('#reflect-catalog-view');
}

function getTestCatalogMeta(testId) {
  const test = TESTS_DATABASE?.[testId];
  const count = test?.questions?.length || 0;
  const minutesMap = { phq_9: 3, gad_7: 3, pcl_5: 6, aaq_2: 3, ysq_s3: 15 };
  const descMap = {
    phq_9: 'Короткий скринінг депресивних симптомів за останні два тижні.',
    gad_7: 'Короткий скринінг тривожних симптомів за останні два тижні.',
    pcl_5: 'Орієнтовна оцінка реакцій на важку або стресову подію за останній місяць.',
    aaq_2: 'Оцінка психологічної негнучкості та уникання внутрішнього досвіду.',
    ysq_s3: 'Авторська схема-орієнтована карта для дослідження стійких життєвих патернів.'
  };
  return {
    count,
    minutes: minutesMap[testId] || Math.max(2, Math.ceil(count / 6)),
    desc: descMap[testId] || 'Короткий опитувальник для самоспостереження.'
  };
}

function renderTestMiniCard(testId) {
  const t = TESTS_DATABASE[testId];
  if (!t) return '';
  const meta = getTestCatalogMeta(testId);
  return `
    <div class="test-mini-card">
      <div class="card-badge">${escapeHTML(t.badge)}</div>
      <div>
        <div class="test-mini-title">${escapeHTML(t.title)}</div>
        <div class="test-mini-desc">${escapeHTML(meta.desc)}</div>
        <div class="test-mini-meta">
          <span class="test-mini-pill">${meta.count} питань</span>
          <span class="test-mini-pill">≈ ${meta.minutes} хв</span>
          <span class="test-mini-pill">локально</span>
        </div>
      </div>
      <button type="button" onclick="openTest('${escapeHTML(testId)}', 'test')">Почати</button>
    </div>`;
}

function renderTestCatalog() {
  const container = document.getElementById('test-catalog-container');
  container.innerHTML = '';
  if (typeof TESTS_DATABASE === 'undefined') return;

  const testGroups = [
    { id: 'anxiety', title: 'Для оцінки тривоги', sub: 'Короткі скринінги тривожного напруження, занепокоєння та внутрішньої напруги.', tests: ['gad_7'] },
    { id: 'mood', title: 'Для оцінки настрою', sub: 'Орієнтовна оцінка пригніченості, втрати інтересу та депресивних симптомів.', tests: ['phq_9'] },
    { id: 'stress', title: 'Для реакцій на стрес', sub: 'Самоспостереження за симптомами після важких або стресових подій.', tests: ['pcl_5'] },
    { id: 'flexibility', title: 'Для психологічної гнучкості', sub: 'Оцінка уникання емоцій, думок і болісного внутрішнього досвіду.', tests: ['aaq_2'] },
    { id: 'schemas', title: 'Для глибинних життєвих схем', sub: 'Дослідження повторюваних переконань, емоційних тем і життєвих патернів.', tests: ['ysq_s3'] }
  ];

  container.innerHTML = `<div class="test-group-grid">
    ${testGroups.map((group, idx) => {
      const cards = group.tests.map(renderTestMiniCard).filter(Boolean).join('');
      if (!cards) return '';
      return `
        <details class="card test-group-card" ${idx === 0 ? 'open' : ''}>
          <summary>
            <div>
              <div class="test-group-title">${escapeHTML(group.title)}</div>
              <div class="test-group-sub">${escapeHTML(group.sub)}</div>
            </div>
            <div class="test-group-chevron">›</div>
          </summary>
          <div class="test-group-content">${cards}</div>
        </details>`;
    }).join('')}
  </div>`;
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
let activeTestSource = 'test';

const DIARY_CARDS = {
  daily: {
    title: 'Як я сьогодні?',
    sub: 'Короткий щоденний запис: що вплинуло на стан, що виснажило і що підтримало.',
    shortTitle: 'День',
    mainLabel: 'Стан дня',
    scaleMax: 10,
    fields: [
      { id: 'mood', label: 'Загальний стан', type: 'range', min: 0, max: 10, value: 5, left: 'важко', right: 'добре' },
      { id: 'energy', label: 'Енергія', type: 'range', min: 0, max: 10, value: 5, left: 'немає сил', right: 'достатньо сил' },
      { id: 'tension', label: 'Напруга', type: 'range', min: 0, max: 10, value: 5, left: 'спокійно', right: 'дуже напружено' },
      { id: 'influenced', label: 'Що сьогодні найбільше вплинуло на мій стан?', type: 'textarea' },
      { id: 'drained', label: 'Що мене виснажило?', type: 'textarea' },
      { id: 'supported', label: 'Що мене підтримало?', type: 'textarea' },
      { id: 'selfCare', label: 'Що я зробив(ла) для себе?', type: 'textarea' }
    ],
    resultRows: [
      { field: 'mood', label: 'Загальний стан', invert: false },
      { field: 'energy', label: 'Енергія', invert: false },
      { field: 'tension', label: 'Напруга', invert: true }
    ]
  },
  emotion: {
    title: 'Що я зараз відчуваю?',
    sub: 'Допомагає назвати емоцію, її силу, тілесне відчуття, думку і імпульс до дії.',
    shortTitle: 'Емоція',
    mainLabel: 'Інтенсивність емоції',
    scaleMax: 10,
    fields: [
      { id: 'emotion', label: 'Найближча емоція', type: 'select', options: ['тривога', 'злість', 'сум', 'сором', 'провина', 'порожнеча', 'розгубленість', 'спокій', 'радість'] },
      { id: 'intensity', label: 'Наскільки сильно я це відчуваю?', type: 'range', min: 0, max: 10, value: 5, left: 'ледь помітно', right: 'дуже сильно' },
      { id: 'body', label: 'Де і як це відчувається в тілі?', type: 'textarea' },
      { id: 'thought', label: 'Яка думка крутиться поруч із цією емоцією?', type: 'textarea' },
      { id: 'impulse', label: 'Що хочеться зробити під впливом цієї емоції?', type: 'textarea' }
    ],
    resultRows: [
      { field: 'intensity', label: 'Інтенсивність емоції', invert: true }
    ]
  },
  need: {
    title: 'Чого мені зараз не вистачає?',
    sub: 'Проста карта потреб: спокій, підтримка, свобода, близькість, ясність, відпочинок.',
    shortTitle: 'Потреба',
    mainLabel: 'Сила незакритої потреби',
    scaleMax: 10,
    fields: [
      { id: 'need', label: 'Що зараз найбільше потрібно?', type: 'select', options: ['спокою', 'підтримки', 'свободи вибору', 'близькості', 'ясності', 'відпочинку', 'визнання', 'контролю', 'безпеки'] },
      { id: 'intensity', label: 'Наскільки сильно цього бракує?', type: 'range', min: 0, max: 10, value: 5, left: 'трохи', right: 'дуже сильно' },
      { id: 'context', label: 'У якій ситуації це стало помітно?', type: 'textarea' },
      { id: 'smallAction', label: 'Яка маленька дія може трохи наблизити мене до цієї потреби?', type: 'textarea' }
    ],
    resultRows: [
      { field: 'intensity', label: 'Сила потреби', invert: true }
    ]
  },
  avoidance: {
    title: 'Що я зараз уникаю?',
    sub: 'Коротка ACT-картка: що я відкладаю, що не хочу відчувати і який малий крок можливий.',
    shortTitle: 'Уникання',
    mainLabel: 'Сила уникання',
    scaleMax: 10,
    fields: [
      { id: 'avoid', label: 'Що я відкладаю або обходжу стороною?', type: 'textarea' },
      { id: 'feeling', label: 'Яку емоцію або відчуття я не хочу зустрічати?', type: 'textarea' },
      { id: 'cost', label: 'Чого мені коштує це уникання?', type: 'textarea' },
      { id: 'difficulty', label: 'Наскільки важко зробити крок у цей бік?', type: 'range', min: 0, max: 10, value: 5, left: 'можливо', right: 'дуже важко' },
      { id: 'step', label: 'Який найменший крок на 5 хвилин я можу зробити?', type: 'textarea' }
    ],
    resultRows: [
      { field: 'difficulty', label: 'Складність кроку', invert: true }
    ]
  },
  thought: {
    title: 'Думка, яка мене зачепила',
    sub: 'Спрощена КПТ-картка: ситуація, думка, емоція, дія, інший погляд і малий крок.',
    shortTitle: 'Думка',
    mainLabel: 'Сила емоційної реакції',
    scaleMax: 10,
    fields: [
      { id: 'situation', label: 'Що сталося?', type: 'textarea' },
      { id: 'thought', label: 'Яка думка мене зачепила?', type: 'textarea' },
      { id: 'emotion', label: 'Яку емоцію це викликало?', type: 'textarea' },
      { id: 'intensity', label: 'Наскільки сильно це зачепило?', type: 'range', min: 0, max: 10, value: 5, left: 'слабко', right: 'дуже сильно' },
      { id: 'action', label: 'Що я зробив(ла) або хотів(ла) зробити?', type: 'textarea' },
      { id: 'alternative', label: 'Який інший, трохи м’якший погляд можливий?', type: 'textarea' },
      { id: 'step', label: 'Який маленький наступний крок?', type: 'textarea' }
    ],
    resultRows: [
      { field: 'intensity', label: 'Сила реакції', invert: true }
    ]
  }
};

function getDiaryCard(id) {
  return DIARY_CARDS[id] || null;
}

const TEST_HISTORY_KEY = 'vitaliy_psychologist_local_test_history_v1';
const REFLECT_HISTORY_KEY = 'vitaliy_psychologist_local_reflect_history_v1';

let openTestHistoryBlock = null;
let openReflectHistoryBlock = null;
const openHistoryCharts = new Set();

function openTest(testId, source = 'test') {
  activeTestId = testId;
  activeTestSource = source;
  currentTestDef = TESTS_DATABASE[testId];
  activeQuestions = currentTestDef.questions;
  currentResultRecord = null;
  currentReflectResultRecord = null;
  
  document.getElementById('test-catalog-view').style.display = 'none';
  document.getElementById('reflect-catalog-view').style.display = 'none';
  document.getElementById('explore-dashboard').style.display = 'none';
  document.getElementById('active-reflect-container').style.display = 'none';
  document.getElementById('active-test-container').style.display = 'block';
  document.getElementById('activeTestBadge').innerText = currentTestDef.badge;
  document.getElementById('testInstruction').innerText = currentTestDef.instruction;
  
  resetTest(true);
  scrollToElementCenter('#active-test-container');
}


function closeTest() {
  const source = activeTestSource;
  activeTestId = null;
  currentTestDef = null;
  activeTestSource = 'test';
  document.getElementById('active-test-container').style.display = 'none';
  if (source === 'reflect') {
    document.getElementById('reflect-catalog-view').style.display = 'block';
    renderReflectHistoryCard();
  } else {
    document.getElementById('test-catalog-view').style.display = 'block';
    renderTestHistoryCard();
  }
  scrollToElementCenter(source === 'reflect' ? '#reflect-catalog-view' : '#test-catalog-view');
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

function renderRecordNotes(record) {
  if (!record.notes || !record.notes.length) return '';
  return `
    <div class="record-notes">
      ${record.notes.map(note => `
        <div class="record-note-row">
          <div class="record-note-label">${escapeHTML(note.label)}</div>
          <div class="record-note-text">${escapeHTML(note.value || '-')}</div>
        </div>`).join('')}
    </div>`;
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
    </div>
    ${renderRecordNotes(record)}`;
}

function toggleHistoryDetails(id) {
  const item = document.querySelector(`[data-history-id="${CSS.escape(id)}"]`);
  if (!item) return;
  item.classList.toggle('open');
  const btn = item.querySelector('.history-details-toggle');
  if (btn) btn.textContent = item.classList.contains('open') ? 'Сховати' : 'Деталі';
}

function renderHistoryActions(record, type) {
  const safeId = escapeHTML(record.id);
  const detailFn = `toggleHistoryDetails('${safeId}')`;
  const pdfFn = type === 'reflect' ? `exportReflectRecordPdf('${safeId}')` : `exportTestRecordPdf('${safeId}')`;
  const deleteFn = type === 'reflect' ? `deleteReflectHistoryItem('${safeId}')` : `deleteTestHistoryItem('${safeId}')`;
  return `
    <div class="history-item-actions">
      <button type="button" class="btn-ghost history-details-toggle" onclick="${detailFn}">Деталі</button>
      <button type="button" class="btn-ghost" onclick="${pdfFn}">PDF</button>
      <button type="button" class="btn-ghost history-delete-btn" title="Видалити цей результат" onclick="${deleteFn}">×</button>
    </div>`;
}

function getHistoryBlockId(type, groupId) {
  return `${type}-history-block-${String(groupId).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

function getHistoryChartKey(type, groupId) {
  return `${type}:${groupId}`;
}

function summarizeHistoryGroup(records) {
  const sorted = [...records].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const latest = sorted[0];
  const main = latest?.results?.[0] || {};
  const lastDate = latest ? new Date(latest.timestamp).toLocaleDateString('uk-UA') : '-';
  const score = main.sum ?? '-';
  const level = main.level || '-';
  return { latest, lastDate, score, level, count: records.length };
}

function groupHistoryRecords(records, keyName) {
  const map = new Map();
  records.forEach(record => {
    const id = record[keyName] || 'unknown';
    if (!map.has(id)) map.set(id, []);
    map.get(id).push(record);
  });
  return [...map.entries()]
    .map(([id, items]) => {
      const sorted = items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const latest = sorted[0];
      return { id, records: sorted, latest, summary: summarizeHistoryGroup(sorted) };
    })
    .sort((a, b) => new Date(b.latest?.timestamp || 0) - new Date(a.latest?.timestamp || 0));
}

function toggleHistoryBlock(type, groupId) {
  if (type === 'reflect') {
    openReflectHistoryBlock = openReflectHistoryBlock === groupId ? null : groupId;
    renderReflectHistoryCard();
  } else {
    openTestHistoryBlock = openTestHistoryBlock === groupId ? null : groupId;
    renderTestHistoryCard();
  }
  scrollToElementCenter(`#${CSS.escape(getHistoryBlockId(type, groupId))}`);
}

function toggleHistoryChart(type, groupId) {
  const key = getHistoryChartKey(type, groupId);
  if (openHistoryCharts.has(key)) openHistoryCharts.delete(key);
  else openHistoryCharts.add(key);
  if (type === 'reflect') {
    openReflectHistoryBlock = groupId;
    renderReflectHistoryCard();
  } else {
    openTestHistoryBlock = groupId;
    renderTestHistoryCard();
  }
  scrollToElementCenter(`#${CSS.escape(getHistoryBlockId(type, groupId))}`);
}

function renderHistoryRecordRows(records, type) {
  return `
    <div class="history-record-list">
      ${records.map(record => {
        const main = record.results?.[0] || {};
        const date = new Date(record.timestamp).toLocaleDateString('uk-UA');
        const title = type === 'reflect'
          ? (record.reflectTitle || record.shortTitle || '-')
          : (record.testTitle || record.badge || TESTS_DATABASE?.[record.testId]?.badge || '-');
        return `
          <div class="history-record" data-history-id="${escapeHTML(record.id)}">
            <div class="history-record-main">
              <div class="history-record-date">${escapeHTML(date)}</div>
              <div class="history-record-title">${escapeHTML(title)}</div>
              <div class="history-record-score">${escapeHTML(main.sum ?? '-')}</div>
              <div class="history-record-level">${escapeHTML(main.level || '-')}</div>
              ${renderHistoryActions(record, type)}
            </div>
            <div class="history-details">${renderResultScaleBars(record)}</div>
          </div>`;
      }).join('')}
    </div>`;
}

function renderHistoryBlock({ type, groupId, title, records, isOpen }) {
  const summary = summarizeHistoryGroup(records);
  const chartKey = getHistoryChartKey(type, groupId);
  const chartOpen = openHistoryCharts.has(chartKey);
  const sortedAsc = [...records].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const chartGroup = groupRecordsForCharts(sortedAsc)[0];
  const pdfFn = type === 'reflect' ? `exportReflectGroupPdf('${escapeHTML(groupId)}')` : `exportTestGroupPdf('${escapeHTML(groupId)}')`;
  const blockId = getHistoryBlockId(type, groupId);
  return `
    <section class="history-block ${isOpen ? 'open' : ''}" id="${escapeHTML(blockId)}">
      <button type="button" class="history-block-summary" onclick="toggleHistoryBlock('${type}', '${escapeHTML(groupId)}')">
        <span class="history-block-title">${escapeHTML(title)}</span>
        <span class="history-block-meta">${summary.count} ${summary.count === 1 ? 'запис' : 'записи'} · останній: ${escapeHTML(summary.lastDate)} · ${escapeHTML(summary.score)}</span>
        <span class="history-block-chevron">›</span>
      </button>
      <div class="history-block-body">
        <div class="history-block-tools">
          <button type="button" class="btn-ghost" onclick="toggleHistoryChart('${type}', '${escapeHTML(groupId)}')">${chartOpen ? 'Сховати графік' : 'Показати графік'}</button>
          <button type="button" class="btn-ghost" onclick="${pdfFn}">PDF динаміки</button>
        </div>
        <div class="history-chart-drawer ${chartOpen ? 'open' : ''}">
          ${chartOpen && chartGroup ? `<div class="history-view-section">${buildSingleChartCard(chartGroup)}</div>` : ''}
        </div>
        ${renderHistoryRecordRows(records, type)}
      </div>
    </section>`;
}

function renderTestHistoryCard() {
  const content = document.getElementById('testHistoryContent');
  const controls = document.getElementById('testHistoryControls');
  if (!content || !controls) return;

  const history = getTestHistory().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  if (!history.length) {
    content.className = 'history-panel-empty';
    content.innerHTML = 'Збережених результатів поки немає. Після завершення тесту результат автоматично збережеться локально на цьому пристрої.';
    controls.style.display = 'none';
    return;
  }

  controls.style.display = 'flex';
  content.className = '';
  const groups = groupHistoryRecords(history, 'testId');
  content.innerHTML = `
    <div class="history-block-list">
      ${groups.map(group => {
        const title = group.latest?.testTitle || group.latest?.badge || TESTS_DATABASE?.[group.id]?.badge || group.id;
        return renderHistoryBlock({
          type: 'test',
          groupId: group.id,
          title,
          records: group.records,
          isOpen: openTestHistoryBlock === group.id
        });
      }).join('')}
    </div>`;
}

function saveCurrentTestResult(silent = false) {
  const status = document.getElementById('testSaveStatus');
  if (!currentResultRecord) {
    if (status && !silent) status.textContent = 'Немає результату для збереження.';
    return;
  }

  if (activeTestSource === 'reflect') {
    currentReflectResultRecord = buildReflectRecordFromTestResult(currentResultRecord);
    const history = getReflectHistory();
    const exists = history.some(item => item.id === currentReflectResultRecord.id);
    if (!exists) history.push(currentReflectResultRecord);
    setReflectHistory(history);
    renderReflectHistoryCard();
    if (status) status.textContent = exists ? 'Цей результат уже збережений локально.' : 'Результат автоматично збережено локально на цьому пристрої.';
    return;
  }

  const history = getTestHistory();
  const exists = history.some(item => item.id === currentResultRecord.id);
  if (!exists) history.push(currentResultRecord);
  setTestHistory(history);
  renderTestHistoryCard();

  if (status) status.textContent = exists ? 'Цей результат уже збережений локально.' : 'Результат автоматично збережено локально на цьому пристрої.';
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


function deleteTestHistoryItem(id) {
  if (!confirm('Видалити цей результат із локальної історії?')) return;
  setTestHistory(getTestHistory().filter(item => item.id !== id));
  renderTestHistoryCard();
}

function deleteReflectHistoryItem(id) {
  if (!confirm('Видалити цей результат із локальної історії?')) return;
  setReflectHistory(getReflectHistory().filter(item => item.id !== id));
  renderReflectHistoryCard();
}

function getTestScaleMax(testId) {
  const map = { phq_9: 27, gad_7: 21, pcl_5: 80, aaq_2: 49, ysq_s3: 6, smq: 6 };
  return map[testId] || TESTS_DATABASE?.[testId]?.scaleMax || 10;
}

function openRelevantDynamics() {
  if (activeTestSource === 'reflect') openReflectCatalog();
  else showExploreDashboard();
}

function buildReflectRecordFromTestResult(record) {
  return {
    id: `reflect-${record.testId}-${Date.now()}`,
    type: 'reflect',
    timestamp: record.timestamp,
    reflectId: record.testId,
    reflectTitle: record.testTitle,
    shortTitle: record.testId === 'smq' ? 'Режими' : (record.testTitle || 'Рефлексія'),
    badge: record.badge || 'MODES',
    scaleMax: record.scaleMax || getTestScaleMax(record.testId),
    results: record.results,
    text: buildTestResultText(record)
  };
}

function getRecordTitle(record) {
  return record.testTitle || record.reflectTitle || record.shortTitle || 'Результат';
}

function getRecordKindLabel(record) {
  return record.type === 'reflect' ? 'Особиста рефлексія' : 'Скринінговий опитувальник';
}

function getRecordChartGroupId(record) {
  return record.testId || record.reflectId || 'other';
}

function getRecordChartGroupLabel(record) {
  return record.badge || record.shortTitle || record.testTitle || record.reflectTitle || getRecordTitle(record);
}

function getRecordMainScore(record) {
  const value = Number(record?.results?.[0]?.sum);
  return Number.isFinite(value) ? value : null;
}

function getRecordScaleMax(record) {
  const explicit = Number(record.scaleMax);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;
  const id = record.testId || record.reflectId;
  const mapped = Number(getTestScaleMax(id));
  return Number.isFinite(mapped) && mapped > 0 ? mapped : 10;
}

function formatShortDate(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
}

function groupRecordsForCharts(records) {
  const map = new Map();
  records.forEach(record => {
    const score = getRecordMainScore(record);
    if (score === null) return;
    const id = getRecordChartGroupId(record);
    if (!map.has(id)) {
      map.set(id, {
        id,
        label: getRecordChartGroupLabel(record),
        title: getRecordTitle(record),
        max: getRecordScaleMax(record),
        records: []
      });
    }
    map.get(id).records.push(record);
  });
  return [...map.values()].map(group => ({
    ...group,
    records: group.records.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  }));
}

function buildSparklineSvg(group) {
  const records = group.records || [];
  if (records.length < 2) {
    return `<div class="chart-empty">Для графіка потрібно щонайменше два проходження.</div>`;
  }

  const width = 620;
  const height = 122;
  const padX = 34;
  const padTop = 14;
  const padBottom = 28;
  const plotW = width - padX * 2;
  const plotH = height - padTop - padBottom;
  const max = Math.max(Number(group.max) || 10, ...records.map(r => getRecordMainScore(r) || 0), 1);
  const min = 0;

  const points = records.map((record, idx) => {
    const score = getRecordMainScore(record) || 0;
    const x = records.length === 1 ? padX + plotW / 2 : padX + (idx / (records.length - 1)) * plotW;
    const y = padTop + plotH - ((score - min) / (max - min || 1)) * plotH;
    return { x, y, score, label: formatShortDate(record.timestamp) };
  });

  const polyline = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const last = points[points.length - 1];
  const first = points[0];
  const yMid = padTop + plotH / 2;
  const xLabels = points.length <= 6 ? points : points.filter((_, i) => i === 0 || i === points.length - 1 || i % Math.ceil(points.length / 5) === 0);

  return `
    <svg class="mini-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Динаміка ${escapeHTML(group.title)}">
      <line x1="${padX}" y1="${padTop}" x2="${padX}" y2="${padTop + plotH}" class="axis" />
      <line x1="${padX}" y1="${padTop + plotH}" x2="${padX + plotW}" y2="${padTop + plotH}" class="axis" />
      <line x1="${padX}" y1="${yMid}" x2="${padX + plotW}" y2="${yMid}" class="grid" />
      <text x="4" y="${padTop + 4}" class="axis-label">${escapeHTML(max)}</text>
      <text x="10" y="${padTop + plotH + 4}" class="axis-label">0</text>
      <polyline points="${polyline}" class="trend-line" />
      ${points.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.2" class="trend-dot" /><text x="${p.x.toFixed(1)}" y="${Math.max(10, p.y - 7).toFixed(1)}" class="score-label">${escapeHTML(p.score)}</text>`).join('')}
      ${xLabels.map(p => `<text x="${p.x.toFixed(1)}" y="${height - 7}" class="date-label" text-anchor="middle">${escapeHTML(p.label)}</text>`).join('')}
      <text x="${padX + plotW}" y="${padTop + 10}" text-anchor="end" class="chart-range">${escapeHTML(first.score)} → ${escapeHTML(last.score)}</text>
    </svg>`;
}

function buildSingleChartCard(group) {
  return `
    <div class="chart-card">
      <div class="chart-head">
        <strong>${escapeHTML(group.title)}</strong>
        <span>${escapeHTML(group.records.length)} ${group.records.length === 1 ? 'замір' : 'заміри'}</span>
      </div>
      ${buildSparklineSvg(group)}
    </div>`;
}

function buildCompactCharts(records) {
  const groups = groupRecordsForCharts(records);
  if (!groups.length) return '';
  return `
    <section class="charts-section">
      <h2>Графіки динаміки</h2>
      ${groups.map(buildSingleChartCard).join('')}
    </section>`;
}

function buildSummaryTable(records) {
  const rows = records.map(record => {
    const date = new Date(record.timestamp).toLocaleString('uk-UA');
    const main = record.results?.[0] || {};
    return `
      <tr>
        <td>${escapeHTML(date)}</td>
        <td>${escapeHTML(getRecordKindLabel(record))}</td>
        <td>${escapeHTML(getRecordTitle(record))}</td>
        <td class="num">${escapeHTML(main.sum ?? '-')}</td>
        <td>${escapeHTML(main.level || '-')}</td>
      </tr>`;
  }).join('');
  return `
    <section class="summary-section">
      <h2>Коротка таблиця</h2>
      <table class="compact-table">
        <thead><tr><th>Дата</th><th>Тип</th><th>Назва</th><th>Бал</th><th>Рівень</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </section>`;
}

function buildSingleRecordDetails(record) {
  const date = new Date(record.timestamp).toLocaleString('uk-UA');
  const main = record.results?.[0] || {};
  const numericValues = (record.results || []).map(r => Number(r.sum)).filter(Number.isFinite);
  const defaultMax = Number(record.scaleMax) || Math.max(...numericValues, 1);
  const rows = (record.results || []).map(r => {
    const score = Number(r.sum);
    const rowMax = Number(r.max) || defaultMax;
    const percent = getScalePercent(score, rowMax);
    return `
      <tr>
        <td>${escapeHTML(r.schema)}</td>
        <td class="num">${escapeHTML(r.sum ?? '-')}</td>
        <td>${escapeHTML(r.level || '-')}</td>
        <td class="bar-cell"><div class="pdf-bar"><span style="width:${percent}%"></span></div></td>
      </tr>`;
  }).join('');

  return `
    <section class="single-result">
      <div class="record-meta">${escapeHTML(getRecordKindLabel(record))} · ${escapeHTML(date)}</div>
      <h2>${escapeHTML(getRecordTitle(record))}</h2>
      <div class="single-summary">
        <div><span>Основний бал</span><strong>${escapeHTML(main.sum ?? '-')}</strong></div>
        <div><span>Рівень</span><strong>${escapeHTML(main.level || '-')}</strong></div>
      </div>
      <table class="compact-table detail-table">
        <thead><tr><th>Показник</th><th>Бал</th><th>Рівень</th><th>Шкала</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${record.notes && record.notes.length ? `<div class="pdf-notes"><h3>Короткі записи</h3>${record.notes.map(note => `<p><strong>${escapeHTML(note.label)}:</strong> ${escapeHTML(note.value || '-')}</p>`).join('')}</div>` : ''}
    </section>`;
}

function buildPdfDocument(title, records) {
  const safeTitle = escapeHTML(title);
  const now = new Date().toLocaleString('uk-UA');
  const sortedRecords = [...records].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const isSingle = sortedRecords.length === 1;
  const bodyContent = isSingle
    ? buildSingleRecordDetails(sortedRecords[0])
    : `${buildCompactCharts(sortedRecords)}${buildSummaryTable(sortedRecords)}`;

  return `<!doctype html>
<html lang="uk">
<head>
<meta charset="utf-8">
<title>${safeTitle}</title>
<style>
  @page { size: A4; margin: 10mm; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #f7f0e6; color: #3d342b; font-family: Arial, sans-serif; line-height: 1.35; font-size: 10.5px; }
  .report { max-width: 760px; margin: 0 auto; padding: 14px; }
  .brand { color: #b87a35; font-size: 10px; letter-spacing: .16em; text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
  h1 { color: #2f271f; font-family: Georgia, serif; font-size: 20px; margin: 0 0 4px; font-weight: 400; }
  h2 { color: #8a551f; font-family: Georgia, serif; font-size: 13px; margin: 0 0 8px; }
  .created { color: #7f6d58; font-size: 9.5px; margin-bottom: 10px; }
  .top-line { border-top: 2px solid #b87a35; margin: 0 0 10px; opacity: .55; }
  .charts-section, .summary-section, .single-result { margin-top: 10px; }
  .chart-card, .single-result { border: 1px solid rgba(184,122,53,.36); background: #fffaf2; border-radius: 8px; padding: 9px 10px; margin-bottom: 8px; page-break-inside: avoid; }
  .chart-head { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; color: #4a3d31; margin-bottom: 4px; }
  .chart-head strong { font-size: 11px; }
  .chart-head span, .record-meta { color: #8a765f; font-size: 8.5px; text-transform: uppercase; letter-spacing: .06em; font-weight: 700; }
  .mini-chart { width: 100%; height: 100px; display: block; background: #fbf5ec; border: 1px solid rgba(184,122,53,.18); border-radius: 6px; }
  .axis { stroke: rgba(61,52,43,.42); stroke-width: 1; }
  .grid { stroke: rgba(184,122,53,.22); stroke-width: 1; stroke-dasharray: 4 4; }
  .trend-line { fill: none; stroke: #b87a35; stroke-width: 2.2; stroke-linejoin: round; stroke-linecap: round; }
  .trend-dot { fill: #d4a060; stroke: #5e3b18; stroke-width: 1; }
  .axis-label, .date-label, .chart-range, .score-label { fill: #6f5b45; font-size: 9px; font-family: Arial, sans-serif; }
  .score-label { font-size: 8px; font-weight: 700; fill: #3d342b; }
  .chart-empty { border: 1px dashed rgba(184,122,53,.35); border-radius: 6px; padding: 12px; color: #7f6d58; font-size: 10px; background: #fbf5ec; }
  .compact-table { width: 100%; border-collapse: collapse; background: #fffaf2; border: 1px solid rgba(184,122,53,.30); border-radius: 8px; overflow: hidden; }
  .compact-table th, .compact-table td { border-bottom: 1px solid rgba(184,122,53,.20); text-align: left; padding: 5px 6px; vertical-align: top; }
  .compact-table th { color: #8a551f; font-size: 9px; text-transform: uppercase; letter-spacing: .04em; background: rgba(184,122,53,.08); }
  .compact-table td { font-size: 9.5px; }
  .compact-table tr:last-child td { border-bottom: none; }
  .num { text-align: center !important; font-weight: 700; color: #3d342b; white-space: nowrap; }
  .single-summary { display: grid; grid-template-columns: 120px 1fr; gap: 7px; margin: 8px 0; }
  .single-summary div { border: 1px solid rgba(184,122,53,.26); border-radius: 6px; padding: 6px 7px; background: #fbf5ec; }
  .single-summary span { display:block; color:#8a765f; font-size:8px; text-transform:uppercase; letter-spacing:.06em; margin-bottom:2px; }
  .single-summary strong { color:#3d342b; font-size:13px; }
  .bar-cell { width: 110px; }
  .pdf-bar { width: 100%; height: 7px; border-radius: 999px; background: rgba(184,122,53,.15); overflow: hidden; }
  .pdf-bar span { display:block; height: 100%; border-radius: inherit; background: #b87a35; }
  .disclaimer { color:#6f5b45; border-top:1px solid rgba(184,122,53,.30); margin-top:10px; padding-top:7px; font-size:8.7px; }
  @media print { body { background: #f7f0e6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } .report { padding: 0; } .chart-card, .single-result, .compact-table { page-break-inside: avoid; } }
</style>
</head>
<body>
  <main class="report">
    <div class="brand">Віталій Психолог</div>
    <h1>${safeTitle}</h1>
    <div class="created">Створено: ${escapeHTML(now)}</div>
    <div class="top-line"></div>
    ${bodyContent}
    <div class="disclaimer">Цей звіт призначений для самоспостереження. Він не є діагнозом, не замінює консультацію фахівця і має лише орієнтовний інформаційний характер. Дані сформовані локально у браузері користувача.</div>
  </main>
</body>
</html>`;
}

function openPdfReport(title, records) {
  if (!records || !records.length) return;
  const win = window.open('', '_blank');
  if (!win) {
    alert('Браузер заблокував вікно для PDF. Дозволь відкриття спливаючих вікон для цього сайту.');
    return;
  }
  win.document.open();
  win.document.write(buildPdfDocument(title, records));
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 450);
}

function exportCurrentTestResultPdf() {
  if (activeTestSource === 'reflect' && currentReflectResultRecord) {
    openPdfReport('Звіт для самоспостереження', [currentReflectResultRecord]);
    return;
  }
  if (currentResultRecord) openPdfReport('Звіт для самоспостереження', [currentResultRecord]);
}

function exportCurrentReflectResultPdf() {
  if (currentReflectResultRecord) openPdfReport('Звіт для самоспостереження', [currentReflectResultRecord]);
}

function exportTestRecordPdf(id) {
  const record = getTestHistory().find(item => item.id === id);
  if (record) openPdfReport('Звіт окремого результату', [record]);
}

function exportReflectRecordPdf(id) {
  const record = getReflectHistory().find(item => item.id === id);
  if (record) openPdfReport('Звіт окремого результату', [record]);
}

function exportTestGroupPdf(groupId) {
  const records = getTestHistory()
    .filter(record => record.testId === groupId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  if (records.length) openPdfReport(`Динаміка: ${records[0].testTitle || records[0].badge || 'опитувальник'}`, records);
}

function exportReflectGroupPdf(groupId) {
  const records = getReflectHistory()
    .filter(record => record.reflectId === groupId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  if (records.length) openPdfReport(`Динаміка: ${records[0].reflectTitle || records[0].shortTitle || 'самоспостереження'}`, records);
}

function exportTestHistoryPdf() {
  const history = getTestHistory().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  openPdfReport('Динаміка скринінгових опитувальників', history);
}

function exportReflectHistoryPdf() {
  const history = getReflectHistory().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  openPdfReport('Динаміка особистої рефлексії', history);
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
    scaleMax: getTestScaleMax(activeTestId),
    type: activeTestSource === 'reflect' ? 'reflect' : 'test',
    results: renderedRows
  };

  const resultText = buildTestResultText(currentResultRecord);
  const resultTextArea = document.getElementById('testResultText');
  const resultActions = document.getElementById('testResultActions');
  const status = document.getElementById('testSaveStatus');
  if (resultTextArea) resultTextArea.value = resultText;
  if (resultActions) resultActions.style.display = 'block';
  if (status) status.textContent = '';
  saveCurrentTestResult(true);

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
  if (!history.length) {
    content.className = 'history-panel-empty';
    content.innerHTML = 'Збережених результатів поки немає. Після завершення картки або карти режимів результат автоматично збережеться локально на цьому пристрої.';
    controls.style.display = 'none';
    return;
  }

  controls.style.display = 'flex';
  content.className = '';
  const groups = groupHistoryRecords(history, 'reflectId');
  content.innerHTML = `
    <div class="history-block-list">
      ${groups.map(group => {
        const title = group.latest?.reflectTitle || group.latest?.shortTitle || group.id;
        return renderHistoryBlock({
          type: 'reflect',
          groupId: group.id,
          title,
          records: group.records,
          isOpen: openReflectHistoryBlock === group.id
        });
      }).join('')}
    </div>`;
}

function saveCurrentReflectResult(silent = false) {
  const status = document.getElementById('reflectSaveStatus');
  if (!currentReflectResultRecord) {
    if (status && !silent) status.textContent = 'Немає результату для збереження.';
    return;
  }
  const history = getReflectHistory();
  const exists = history.some(item => item.id === currentReflectResultRecord.id);
  if (!exists) history.push(currentReflectResultRecord);
  setReflectHistory(history);
  renderReflectHistoryCard();
  if (status) status.textContent = exists ? 'Цей результат уже збережений локально.' : 'Результат автоматично збережено локально на цьому пристрої.';
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
    let html = `<h3 style="color:var(--accent-glow); font-family:'Merriweather',serif; font-size:22px; margin:32px 0 16px; text-align:left;">${escapeHTML(c.categoryTitle)}</h3><div class="catalog-grid">`;
    c.items.forEach(item => {
      html += `
        <div class="card clickable-card" onclick="openReflect('${escapeHTML(cat)}','${escapeHTML(item.id)}')">
          <div class="card-inner-glow"></div>
          <div class="card-title" style="margin-bottom:8px; font-size:18px;">${escapeHTML(item.title)}</div>
          <div class="card-sub">${escapeHTML(item.sub)}</div>
        </div>`;
    });
    html += `</div>`;
    container.innerHTML += html;
  }


  const diaryItems = Object.entries(DIARY_CARDS);
  container.innerHTML += `
    <h3 style="color:var(--accent-glow); font-family:'Merriweather',serif; font-size:22px; margin:32px 0 16px; text-align:left;">Щоденник</h3>
    <div class="catalog-grid diary-catalog-grid">
      ${diaryItems.map(([id, item]) => `
        <div class="card clickable-card" onclick="openDiary('${escapeHTML(id)}')">
          <div class="card-inner-glow"></div>
          <div class="card-title" style="margin-bottom:8px; font-size:18px;">${escapeHTML(item.title)}</div>
          <div class="card-sub">${escapeHTML(item.sub)}</div>
        </div>`).join('')}
    </div>`;

  if (typeof TESTS_DATABASE !== 'undefined' && TESTS_DATABASE.smq) {
    const smq = TESTS_DATABASE.smq;
    const count = smq.questions?.length || 0;
    container.innerHTML += `
      <h3 style="color:var(--accent-glow); font-family:'Merriweather',serif; font-size:22px; margin:32px 0 16px; text-align:left;">Схема-режими</h3>
      <div class="catalog-grid">
        <div class="card clickable-card" onclick="openTest('smq', 'reflect')">
          <div class="card-inner-glow"></div>
          <div class="card-header-test" style="margin-bottom:8px; padding-bottom:0; border:none;">
            <div class="card-badge">${escapeHTML(smq.badge || 'MODES')}</div>
            <div>
              <div class="card-title" style="font-size:18px;">${escapeHTML(smq.title)}</div>
              <div class="card-sub">Коротка карта для саморефлексії: ${count} тверджень, приблизно 4 хвилини. Результат збережеться у динаміці особистої рефлексії.</div>
            </div>
          </div>
        </div>
      </div>`;
  }
}


let currentDiaryId = null;

function renderDiaryField(card, field) {
  if (field.type === 'range') {
    return `
      <div class="slider-group diary-field" data-field="${escapeHTML(field.id)}">
        <label>${escapeHTML(field.label)} <span class="slider-value" id="diary-val-${escapeHTML(field.id)}">${escapeHTML(field.value ?? 5)}</span></label>
        <input type="range" id="diary-${escapeHTML(field.id)}" min="${escapeHTML(field.min ?? 0)}" max="${escapeHTML(field.max ?? 10)}" value="${escapeHTML(field.value ?? 5)}" oninput="updateDiarySlider('${escapeHTML(field.id)}', this.value)">
        <div class="scale-hint-row"><span class="scale-hint">${escapeHTML(field.left || '')}</span><span class="scale-hint">${escapeHTML(field.right || '')}</span></div>
      </div>`;
  }
  if (field.type === 'select') {
    return `
      <div class="input-group diary-field" data-field="${escapeHTML(field.id)}">
        <label>${escapeHTML(field.label)}</label>
        <select id="diary-${escapeHTML(field.id)}" class="diary-select">
          ${(field.options || []).map(opt => `<option value="${escapeHTML(opt)}">${escapeHTML(opt)}</option>`).join('')}
        </select>
      </div>`;
  }
  return `
    <div class="input-group diary-field" data-field="${escapeHTML(field.id)}">
      <label>${escapeHTML(field.label)}</label>
      <textarea id="diary-${escapeHTML(field.id)}" rows="3" placeholder="Коротко, своїми словами"></textarea>
    </div>`;
}

function updateDiarySlider(id, value) {
  const el = document.getElementById(`diary-val-${id}`);
  if (el) el.textContent = value;
}

function openDiary(id) {
  const card = getDiaryCard(id);
  if (!card) return;
  currentDiaryId = id;
  document.getElementById('reflect-catalog-view').style.display = 'none';
  document.getElementById('active-reflect-container').style.display = 'block';
  document.getElementById('reflect-wizard').style.display = 'none';
  document.getElementById('reflect-feedback').style.display = 'none';
  const diaryContainer = document.getElementById('diary-card-container');
  diaryContainer.style.display = 'block';
  diaryContainer.innerHTML = `
    <div class="card diary-card-active">
      <div class="card-inner-glow"></div>
      <div class="section-label">Щоденник</div>
      <h2 style="font-family:'Merriweather',serif; color:var(--accent-glow); font-size:28px; margin:0 0 10px 0;">${escapeHTML(card.title)}</h2>
      <div class="card-sub" style="margin-bottom:22px;">${escapeHTML(card.sub)} Запис збережеться локально тільки на цьому пристрої.</div>
      <form id="diaryForm" onsubmit="return false;">
        <div class="diary-fields">${card.fields.map(field => renderDiaryField(card, field)).join('')}</div>
        <div class="controls">
          <button type="button" onclick="saveDiaryEntry()">Зберегти запис</button>
          <button type="button" class="btn-ghost" onclick="closeReflect()">Скасувати</button>
        </div>
        <div id="diarySaveStatus" class="status-line"></div>
      </form>
    </div>`;
  scrollToElementCenter('#active-reflect-container');
}

function collectDiaryValues(card) {
  const values = {};
  card.fields.forEach(field => {
    const el = document.getElementById(`diary-${field.id}`);
    if (!el) return;
    values[field.id] = field.type === 'range' ? Number(el.value) : el.value.trim();
  });
  return values;
}

function buildDiaryRecord(card, id, values) {
  const rows = (card.resultRows || []).map(row => {
    const raw = Number(values[row.field]);
    const value = Number.isFinite(raw) ? raw : 0;
    return {
      schema: row.label,
      sum: value,
      level: getScoreLevel(row.invert ? 10 - value : value),
      htmlLevel: getScoreLevel(row.invert ? 10 - value : value),
      max: card.scaleMax || 10
    };
  });
  const main = rows[0] || { schema: card.mainLabel || card.title, sum: 0, level: '-', htmlLevel: '-', max: card.scaleMax || 10 };
  const textFields = card.fields
    .filter(field => field.type !== 'range')
    .map(field => ({ label: field.label, value: values[field.id] || '' }))
    .filter(note => note.value);
  return {
    id: `diary-${id}-${Date.now()}`,
    type: 'diary',
    timestamp: new Date().toISOString(),
    reflectId: `diary_${id}`,
    reflectTitle: card.title,
    shortTitle: card.shortTitle || 'Щоденник',
    badge: 'Щоденник',
    scaleMax: card.scaleMax || 10,
    results: [
      { ...main, schema: card.mainLabel || main.schema },
      ...rows.filter((_, idx) => idx > 0)
    ],
    notes: textFields,
    text: textFields.map(note => `${note.label}:\n${note.value}`).join('\n\n')
  };
}

function saveDiaryEntry() {
  const card = getDiaryCard(currentDiaryId);
  const status = document.getElementById('diarySaveStatus');
  if (!card) return;
  const values = collectDiaryValues(card);
  const hasText = card.fields.some(field => field.type !== 'range' && values[field.id]);
  if (!hasText) {
    if (status) status.textContent = 'Додай хоча б один короткий текстовий запис.';
    return;
  }
  const record = buildDiaryRecord(card, currentDiaryId, values);
  const history = getReflectHistory();
  history.push(record);
  setReflectHistory(history);
  renderReflectHistoryCard();
  if (status) status.textContent = 'Запис збережено локально на цьому пристрої.';
  setTimeout(() => closeReflect(), 650);
}

function openReflect(catId, itemId) {
  const diaryContainer = document.getElementById('diary-card-container');
  if (diaryContainer) {
    diaryContainer.style.display = 'none';
    diaryContainer.innerHTML = '';
  }
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
  scrollToElementCenter('#active-reflect-container');
}

function closeReflect() {
  const diaryContainer = document.getElementById('diary-card-container');
  if (diaryContainer) {
    diaryContainer.style.display = 'none';
    diaryContainer.innerHTML = '';
  }
  document.getElementById('active-reflect-container').style.display = 'none';
  document.getElementById('reflect-catalog-view').style.display = 'block';
  renderReflectHistoryCard();
  scrollToElementCenter('#reflect-catalog-view');
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
  saveCurrentReflectResult(true);
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
