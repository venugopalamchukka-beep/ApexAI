const pipelineData = [
  {n:'STEP 01', title:'Collect the signals', body:'Log the time and GPS position during each session. If the logger also records speed and GPS accuracy, keep those fields too. Mount the phone securely and do not interact with it while the kart is moving.', tech:'Phone + GPS logger'},
  {n:'STEP 02', title:'Turn raw samples into usable laps', body:'Inspect timestamps and units, remove invalid records, flag GPS jumps, detect start/finish crossings, and verify lap durations. Keep the original CSV so every cleaning decision can be reviewed.', tech:'Python · Pandas · NumPy'},
  {n:'STEP 03', title:'Compare matching track positions', body:'Define a reference lap, estimate distance around the circuit, align laps on a common distance grid, and calculate the elapsed-time delta. Mark corners consistently so time loss can be localised.', tech:'Track map · interpolation'},
  {n:'STEP 04', title:'Train a model only after the baseline works', body:'Create one row per lap and segment. Use legitimate pre-segment features to predict the actual time through that segment. Compare the model against a simple median-time baseline on held-out sessions.', tech:'Scikit-learn · CPU first'},
  {n:'STEP 05', title:'Explain results to the team', body:'Present measured speed differences, the time-delta curve, corner summaries, data-quality warnings, and model error. Clearly label simulated values and observations versus possible explanations.', tech:'HTML · CSS · JavaScript'},
];
document.querySelectorAll('[data-pipeline]').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('[data-pipeline]').forEach(b => b.classList.toggle('active', b === btn));
  const d = pipelineData[Number(btn.dataset.pipeline)];
  document.querySelector('#pipelineDetail').innerHTML = `<div class="detail-number">${d.n}</div><div><h3>${d.title}</h3><p>${d.body}</p></div><div class="tech-pill">${d.tech}</div>`;
}));

// Selectable hardware cards: reveal a plain-language explanation for each sensor.
const sensorDetails = {
  gps: {
    title: 'GPS / GNSS receiver',
    text: 'This is the core position source: it supplies timestamped coordinates for track mapping, lap detection and aligning laps. Start with a phone logger before purchasing dedicated hardware.',
    badge: 'START HERE · LOWEST COST'
  },
  imu: {
    title: 'IMU: accelerometer + gyroscope',
    text: 'An IMU measures acceleration and rotation of the mounted unit. It can add motion context through a corner, but mounting orientation and vibration must be handled carefully.',
    badge: 'OPTIONAL · MOTION CONTEXT'
  },
  logger: {
    title: 'Microcontroller / data logger',
    text: 'A logger timestamps and stores readings from connected sensors. It is most useful when a dedicated GPS or IMU has been selected and the team needs repeatable data capture.',
    badge: 'UPGRADE · CONSISTENT LOGGING'
  },
  vehicle: {
    title: 'Optional vehicle sensors',
    text: 'Wheel speed, brake pressure, throttle position or steering sensors can provide signals the phone cannot measure. Add only sensors that can be mounted safely and calibrated correctly.',
    badge: 'ADVANCED · VEHICLE SIGNALS'
  }
};
document.querySelectorAll('[data-sensor]').forEach(card => {
  const selectSensor = () => {
    document.querySelectorAll('[data-sensor]').forEach(item => {
      const selected = item === card;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    const detail = sensorDetails[card.dataset.sensor];
    if (!detail) return;
    document.querySelector('#sensorDetailTitle').textContent = detail.title;
    document.querySelector('#sensorDetailText').textContent = detail.text;
    document.querySelector('#sensorDetailBadge').textContent = detail.badge;
  };
  card.addEventListener('click', selectSensor);
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectSensor();
    }
  });
});

// Offline-friendly interactive canvas charts. Values are illustrative—not kart measurements.
const chartConfigs = new WeakMap();
const chartStates = new WeakMap();
const chartMargins = { l: 42, r: 14, t: 17, b: 31 };

function updateChartReadout(canvas, cfg, index) {
  const output = document.getElementById(`${canvas.id}Readout`);
  if (!output) return;
  if (index === null || index === undefined) {
    output.textContent = canvas.id === 'speedChart'
      ? 'Move over the chart or focus it and use the arrow keys to inspect a distance.'
      : 'Move over the chart or focus it and use the arrow keys to inspect the time delta.';
    return;
  }
  const d = cfg.series[0].data[index][0];
  if (canvas.id === 'speedChart') {
    const ref = cfg.series[0].data[index][1];
    const cur = cfg.series[1].data[index][1];
    output.textContent = `At ${Math.round(d)} m: Reference ${ref.toFixed(1)} km/h · Current lap ${cur.toFixed(1)} km/h · Difference ${(cur-ref >= 0 ? '+' : '')}${(cur-ref).toFixed(1)} km/h`;
  } else {
    const delta = cfg.series[0].data[index][1];
    const state = delta > 0 ? 'behind reference' : delta < 0 ? 'ahead of reference' : 'level with reference';
    output.textContent = `At ${Math.round(d)} m: ${delta > 0 ? '+' : ''}${delta.toFixed(2)} s · ${state}`;
  }
}

function drawChart(canvas, cfg) {
  if (!canvas) return;
  chartConfigs.set(canvas, cfg);
  if (!chartStates.has(canvas)) chartStates.set(canvas, { index: null });
  const state = chartStates.get(canvas);
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || Number(canvas.getAttribute('width')) || 560;
  const intrinsicRatio = Number(canvas.getAttribute('data-ratio')) || Number(canvas.getAttribute('height')) / Number(canvas.getAttribute('width')) || 0.5;
  const cssHeight = Math.max(180, cssWidth * intrinsicRatio);
  canvas.style.height = `${cssHeight}px`;
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const w = cssWidth, h = cssHeight;
  const m = chartMargins;
  const pw = w - m.l - m.r, ph = h - m.t - m.b;
  const x = v => m.l + (v - cfg.xMin) / (cfg.xMax - cfg.xMin) * pw;
  const y = v => m.t + ph - (v - cfg.yMin) / (cfg.yMax - cfg.yMin) * ph;
  ctx.clearRect(0, 0, w, h);
  ctx.font = '10px "DM Mono", monospace';
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = '#dfe7e2';
  ctx.fillStyle = '#7f9188';
  for (let i = 0; i <= 4; i++) {
    const val = cfg.yMin + (cfg.yMax - cfg.yMin) * i / 4;
    ctx.beginPath(); ctx.moveTo(m.l, y(val)); ctx.lineTo(w - m.r, y(val)); ctx.stroke();
    ctx.fillText(cfg.yFormat ? cfg.yFormat(val) : String(Math.round(val * 10) / 10), 3, y(val) + 3);
  }
  for (let i = 0; i <= 5; i++) {
    const val = cfg.xMin + (cfg.xMax - cfg.xMin) * i / 5;
    ctx.beginPath(); ctx.moveTo(x(val), m.t); ctx.lineTo(x(val), h - m.b); ctx.stroke();
    ctx.fillText(String(Math.round(val)), x(val) - 7, h - 10);
  }
  if (cfg.zero !== undefined) {
    ctx.strokeStyle = '#aab8af'; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(m.l, y(cfg.zero)); ctx.lineTo(w - m.r, y(cfg.zero)); ctx.stroke();
    ctx.setLineDash([]);
  }
  cfg.series.forEach(series => {
    ctx.beginPath(); ctx.lineWidth = 2.4; ctx.strokeStyle = series.color;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    series.data.forEach((point, i) => {
      if (i === 0) ctx.moveTo(x(point[0]), y(point[1]));
      else ctx.lineTo(x(point[0]), y(point[1]));
    });
    ctx.stroke();
  });
  // Crosshair and point markers show that both graphs can be inspected interactively.
  if (Number.isInteger(state.index) && cfg.series[0].data[state.index]) {
    const i = state.index;
    const px = x(cfg.series[0].data[i][0]);
    ctx.save(); ctx.strokeStyle = '#65756d'; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(px, m.t); ctx.lineTo(px, h - m.b); ctx.stroke(); ctx.setLineDash([]);
    cfg.series.forEach(series => {
      const point = series.data[i];
      ctx.beginPath(); ctx.arc(x(point[0]), y(point[1]), 4, 0, Math.PI * 2);
      ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = series.color; ctx.stroke();
    });
    ctx.restore();
  }
  ctx.fillStyle = '#7f9188'; ctx.font = '9px "DM Mono", monospace';
  ctx.fillText(cfg.xLabel || 'Distance (m)', m.l, h - 1);
  updateChartReadout(canvas, cfg, state.index);
}

function bindChartInteraction(canvas) {
  if (!canvas || canvas.dataset.interactionReady === 'true') return;
  canvas.dataset.interactionReady = 'true';
  canvas.style.touchAction = 'pan-y';
  const pickIndex = clientX => {
    const cfg = chartConfigs.get(canvas);
    if (!cfg) return null;
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const plotW = rect.width - chartMargins.l - chartMargins.r;
    if (px < chartMargins.l || px > chartMargins.l + plotW || plotW <= 0) return null;
    const ratio = (px - chartMargins.l) / plotW;
    return Math.max(0, Math.min(cfg.series[0].data.length - 1, Math.round(ratio * (cfg.series[0].data.length - 1))));
  };
  const choose = index => {
    if (index === null) return;
    const cfg = chartConfigs.get(canvas);
    if (!cfg) return;
    chartStates.set(canvas, { index });
    drawChart(canvas, cfg);
  };
  canvas.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    const index = pickIndex(event.clientX);
    if (index !== null) choose(index);
  });
  canvas.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse') return;
    chartStates.set(canvas, { index: null });
    const cfg = chartConfigs.get(canvas);
    if (cfg) drawChart(canvas, cfg);
  });
  canvas.addEventListener('pointerdown', event => {
    const index = pickIndex(event.clientX);
    if (index !== null) choose(index);
  });
  canvas.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const cfg = chartConfigs.get(canvas);
    if (!cfg) return;
    const state = chartStates.get(canvas) || { index: null };
    const max = cfg.series[0].data.length - 1;
    let next = state.index === null ? 0 : state.index;
    if (event.key === 'ArrowLeft') next = Math.max(0, next - 1);
    if (event.key === 'ArrowRight') next = Math.min(max, next + 1);
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = max;
    choose(next);
  });
}

const distances = Array.from({ length: 31 }, (_, i) => i * 50);
const reference = distances.map((d, i) => [d, 38 + 14 * Math.sin(i * .57) + 7 * Math.sin(i * .21) - ((i % 9 === 3 || i % 9 === 4) ? 10 : 0)]);
const current = distances.map((d, i) => [d, 36 + 13 * Math.sin(i * .57 + .08) + 7 * Math.sin(i * .21) - ((i % 9 === 3 || i % 9 === 4) ? 12 : 0) - ((i > 11 && i < 16) ? 4 : 0)]);
const deltaData = distances.map((d, i) => {
  let value = -.03 + i * .009;
  if (i > 10) value += (i - 10) * .013;
  if (i > 15) value += (i - 15) * .018;
  if (i > 22) value -= (i - 22) * .026;
  return [d, Number(value.toFixed(2))];
});
function renderCharts() {
  const speedCanvas = document.querySelector('#speedChart');
  if (speedCanvas) {
    bindChartInteraction(speedCanvas);
    drawChart(speedCanvas, {
      xMin: 0, xMax: 1500, yMin: 0, yMax: 70, xLabel: 'Distance (m)',
      series: [{ name: 'Reference', data: reference, color: '#7ca743' }, { name: 'Current lap', data: current, color: '#e45b55' }]
    });
  }
  const deltaCanvas = document.querySelector('#deltaChart');
  if (deltaCanvas) {
    bindChartInteraction(deltaCanvas);
    drawChart(deltaCanvas, {
      xMin: 0, xMax: 1500, yMin: -.2, yMax: 1.2, zero: 0, xLabel: 'Distance (m)', yFormat: value => value.toFixed(1),
      series: [{ name: 'Time delta', data: deltaData, color: '#e45b55' }]
    });
  }
}
let resizeTimer;
window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(renderCharts, 120); });
renderCharts();

// Roadmap progress persists only in this browser; no data is uploaded.
const roadmapChecks = [...document.querySelectorAll('#roadmapList input[type="checkbox"]')];
const progressBar=document.querySelector('#roadmapProgress'); const progressText=document.querySelector('#progressText');
const saved = JSON.parse(localStorage.getItem('apexai-roadmap') || '[]');
roadmapChecks.forEach((box,i)=>{box.checked=Boolean(saved[i]);box.addEventListener('change',updateProgress)});
function updateProgress(){const vals=roadmapChecks.map(b=>b.checked);localStorage.setItem('apexai-roadmap',JSON.stringify(vals));const count=vals.filter(Boolean).length;progressBar.style.width=`${100*count/vals.length}%`;progressText.textContent=`${count} of ${vals.length} milestones complete`;}
updateProgress();
document.querySelector('#resetProgress').addEventListener('click',()=>{roadmapChecks.forEach(b=>b.checked=false);updateProgress()});

const menuToggle = document.querySelector('#menuToggle'); const mainNav = document.querySelector('#mainNav');
menuToggle.addEventListener('click',()=>{const open=mainNav.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(open));menuToggle.textContent=open?'×':'☰';});
mainNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mainNav.classList.remove('open');menuToggle.setAttribute('aria-expanded','false');menuToggle.textContent='☰';}));
