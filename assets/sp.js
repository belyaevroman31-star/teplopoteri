/* Калькулятор по СП 61.13330.2012 «Тепловая изоляция оборудования и трубопроводов»
   и СП 41-103-2000. Проект BELYAEV_PROJECT. */

const form = document.getElementById("spForm");
const resetBtn = document.getElementById("spResetBtn");
const resultsDiv = document.getElementById("spResults");

const pipeMatSelect = document.getElementById("spPipeMat");
const dnSelect = document.getElementById("spDnSelect");
const dnInput = document.getElementById("spDn");
const wallInput = document.getElementById("spWall");
const materialSelect = document.getElementById("spMaterial");
const placementSelect = document.getElementById("spPlacement");
const normCaseSelect = document.getElementById("spNormCase");
const thicknessInput = document.getElementById("spThickness");

/* ---- Материалы труб: λтр, Вт/(м·°С); размеры (наружный Ø × стенка, мм) ---- */
const PIPE_MATERIALS = {
  steel: {
    name: "Сталь",
    standard: "Сталь (ГОСТ 3262-75, ГОСТ 10704-91)",
    lambda: 50,
    norm: true,
    sizes: [
      { label: "DN 15 (Ø21,3×2,8)", od: 21.3, wall: 2.8 },
      { label: "DN 20 (Ø26,8×2,8)", od: 26.8, wall: 2.8 },
      { label: "DN 25 (Ø33,5×3,2)", od: 33.5, wall: 3.2 },
      { label: "DN 32 (Ø42,3×3,2)", od: 42.3, wall: 3.2 },
      { label: "DN 40 (Ø48,0×3,5)", od: 48.0, wall: 3.5 },
      { label: "DN 50 (Ø60,0×3,5)", od: 60.0, wall: 3.5 },
      { label: "DN 65 (Ø76,0×4,0)", od: 76.0, wall: 4.0 },
      { label: "DN 80 (Ø89,0×4,0)", od: 89.0, wall: 4.0 },
      { label: "DN 100 (Ø108,0×4,0)", od: 108.0, wall: 4.0 },
      { label: "DN 125 (Ø133,0×4,5)", od: 133.0, wall: 4.5 },
      { label: "DN 150 (Ø159,0×4,5)", od: 159.0, wall: 4.5 },
      { label: "DN 200 (Ø219,0×6,0)", od: 219.0, wall: 6.0 },
      { label: "DN 250 (Ø273,0×7,0)", od: 273.0, wall: 7.0 },
      { label: "DN 300 (Ø325,0×8,0)", od: 325.0, wall: 8.0 }
    ]
  },
  ppr: {
    name: "Полипропилен PP-R",
    standard: "Полипропилен PP-R, SDR 6 / PN 20 (ГОСТ 32415-2013, DIN 8077/8078)",
    lambda: 0.24,
    norm: false,
    sizes: [
      { label: "PP-R Ø20×3,4 (DN 15)", od: 20, wall: 3.4 },
      { label: "PP-R Ø25×4,2 (DN 20)", od: 25, wall: 4.2 },
      { label: "PP-R Ø32×5,4 (DN 25)", od: 32, wall: 5.4 },
      { label: "PP-R Ø40×6,7 (DN 32)", od: 40, wall: 6.7 },
      { label: "PP-R Ø50×8,3 (DN 40)", od: 50, wall: 8.3 },
      { label: "PP-R Ø63×10,5 (DN 50)", od: 63, wall: 10.5 },
      { label: "PP-R Ø75×12,5 (DN 65)", od: 75, wall: 12.5 },
      { label: "PP-R Ø90×15,0 (DN 80)", od: 90, wall: 15.0 },
      { label: "PP-R Ø110×18,3 (DN 100)", od: 110, wall: 18.3 }
    ]
  },
  pex: {
    name: "Сшитый полиэтилен PEX",
    standard: "Сшитый полиэтилен PEX-a (DIN 16892)",
    lambda: 0.38,
    norm: false,
    sizes: [
      { label: "PEX Ø16×2,0", od: 16, wall: 2.0 },
      { label: "PEX Ø20×2,0", od: 20, wall: 2.0 },
      { label: "PEX Ø25×2,3", od: 25, wall: 2.3 },
      { label: "PEX Ø32×2,9", od: 32, wall: 2.9 },
      { label: "PEX Ø40×3,7", od: 40, wall: 3.7 },
      { label: "PEX Ø50×4,6", od: 50, wall: 4.6 },
      { label: "PEX Ø63×5,8", od: 63, wall: 5.8 },
      { label: "PEX Ø75×6,8", od: 75, wall: 6.8 },
      { label: "PEX Ø90×8,2", od: 90, wall: 8.2 },
      { label: "PEX Ø110×10,0", od: 110, wall: 10.0 }
    ]
  },
  mp: {
    name: "Металлопластик PEX-AL-PEX",
    standard: "Металлопластик PEX-AL-PEX (ГОСТ Р 53630-2015)",
    lambda: 0.45,
    norm: false,
    sizes: [
      { label: "MP Ø16×2,0", od: 16, wall: 2.0 },
      { label: "MP Ø20×2,0", od: 20, wall: 2.0 },
      { label: "MP Ø26×3,0", od: 26, wall: 3.0 },
      { label: "MP Ø32×3,0", od: 32, wall: 3.0 },
      { label: "MP Ø40×3,5", od: 40, wall: 3.5 },
      { label: "MP Ø50×4,0", od: 50, wall: 4.0 },
      { label: "MP Ø63×4,5", od: 63, wall: 4.5 },
      { label: "MP Ø75×5,0", od: 75, wall: 5.0 },
      { label: "MP Ø90×6,0", od: 90, wall: 6.0 }
    ]
  },
  copper: {
    name: "Медь",
    standard: "Медь (ГОСТ 617-2006, EN 1057)",
    lambda: 385,
    norm: false,
    sizes: [
      { label: "Медь Ø15×1,0", od: 15, wall: 1.0 },
      { label: "Медь Ø18×1,0", od: 18, wall: 1.0 },
      { label: "Медь Ø22×1,0", od: 22, wall: 1.0 },
      { label: "Медь Ø28×1,5", od: 28, wall: 1.5 },
      { label: "Медь Ø35×1,5", od: 35, wall: 1.5 },
      { label: "Медь Ø42×1,5", od: 42, wall: 1.5 },
      { label: "Медь Ø54×2,0", od: 54, wall: 2.0 },
      { label: "Медь Ø64×2,0", od: 64, wall: 2.0 },
      { label: "Медь Ø76,1×2,0", od: 76.1, wall: 2.0 },
      { label: "Медь Ø88,9×2,0", od: 88.9, wall: 2.0 },
      { label: "Медь Ø108×2,5", od: 108, wall: 2.5 }
    ]
  }
};

/* ---- Приложение Б СП 61.13330.2012: λ = λ0 + k·tm, Вт/(м·°С) ---- */
const MATERIALS = {
  mw_cyl_80:   { name: "Минеральная вата, цилиндры, 80 кг/м³", lambda0: 0.044, k: 0.00022 },
  mw_cyl_100:  { name: "Минеральная вата, цилиндры, 100 кг/м³", lambda0: 0.049, k: 0.00021 },
  mw_cyl_150:  { name: "Минеральная вата, цилиндры, 150 кг/м³", lambda0: 0.050, k: 0.00020 },
  mw_mat_100:  { name: "Маты минераловатные прошивные, 100 кг/м³", lambda0: 0.038, k: 0.00021 },
  mw_super_45: { name: "Супертонкое базальтовое волокно, 40–60 кг/м³", lambda0: 0.032, k: 0.00019 },
  glass_45:    { name: "Супертонкое стеклянное волокно, 40–60 кг/м³", lambda0: 0.033, k: 0.00014 },
  ppu_40:      { name: "Пенополиуретан (ППУ), 40 кг/м³", lambda0: 0.030, k: 0.00015 },
  ppu_50:      { name: "Пенополиуретан (ППУ), 50 кг/м³", lambda0: 0.032, k: 0.00015 },
  ppu_70:      { name: "Пенополиуретан (ППУ), 70 кг/м³", lambda0: 0.037, k: 0.00015 },
  rubber:      { name: "Вспененный каучук (EPDM), 60–80 кг/м³", lambda0: 0.034, k: 0.00020 },
  pe_20:       { name: "Пенополиэтилен, 20 кг/м³", lambda0: 0.039, k: 0.00020 },
  pe_50:       { name: "Пенополиэтилен, 50 кг/м³", lambda0: 0.035, k: 0.00018 },
  ps_17:       { name: "Пенополистирол, 17 кг/м³", lambda0: 0.039, k: 0.00018 },
  ps_25:       { name: "Пенополистирол, 25 кг/м³", lambda0: 0.036, k: 0.00018 }
};

/* ---- Таблица В.2 СП 61.13330.2012: αн, Вт/(м²·°С) ---- */
function getAlpha(placement, orientation) {
  const vert = orientation === "vertical";
  switch (placement) {
    case "indoor_low":  return vert ? 8 : 7;
    case "indoor_high": return vert ? 12 : 10;
    case "air_5":       return vert ? 26 : 20;
    case "air_10":      return vert ? 35 : 26;
    case "air_15":      return vert ? 52 : 35;
    case "channel":     return 11;
    default:            return 10;
  }
}

/* ---- Таблица В.1 СП 61.13330.2012: коэффициент дополнительных потерь K ---- */
const K_SELECT = {
  steel_movable_small: 1.2,
  steel_movable_big: 1.15,
  steel_suspended: 1.05,
  nonmetal: 1.7,
  channelless: 1.15,
  none: 1.0
};

/* ---- Табл. 13 СП 61.13330.2012: районный коэффициент ---- */
function getRegionCoef(region, outdoor) {
  if (region === "eu") return 1.0;
  if (region === "siberia") return outdoor ? 0.98 : 0.98;
  if (region === "far") return outdoor ? 0.96 : 0.96;
  return 1.0;
}

/* ---- Нормативные таблицы плотности теплового потока, Вт/м (СП 61.13330.2012) ---- */
const DN = [15, 20, 25, 40, 50, 65, 80, 100, 125, 150, 200, 250, 300, 350, 400];
const NORM = {
  // Таблица 4: помещение, более 5000 ч/год (tн = 20 °C)
  indoor_long: {
    temps: [50, 100, 150, 200],
    q: [
      [6, 14, 23, 33], [7, 16, 26, 37], [8, 18, 28, 40], [9, 21, 32, 45],
      [10, 23, 36, 50], [12, 26, 41, 56], [13, 28, 44, 60], [14, 31, 48, 65],
      [16, 35, 53, 72], [18, 38, 58, 79], [22, 46, 70, 93], [26, 53, 79, 106],
      [29, 60, 88, 118], [33, 66, 97, 129], [36, 72, 106, 139]
    ]
  },
  // Таблица 5: помещение, 5000 ч/год и менее (tн = 20 °C)
  indoor_short: {
    temps: [50, 100, 150, 200],
    q: [
      [6, 16, 25, 35], [7, 18, 28, 40], [8, 20, 31, 43], [10, 23, 36, 49],
      [11, 25, 40, 54], [13, 29, 45, 62], [14, 32, 49, 66], [16, 35, 54, 73],
      [18, 39, 60, 81], [21, 44, 66, 89], [26, 53, 80, 107], [30, 62, 92, 122],
      [34, 70, 103, 136], [38, 77, 113, 149], [42, 85, 123, 162]
    ]
  },
  // Таблица 2: открытый воздух, более 5000 ч/год (tн — среднегодовая)
  air_long: {
    temps: [20, 50, 100, 150, 200],
    q: [
      [4, 9, 17, 25, 35], [4, 10, 19, 28, 39], [5, 11, 20, 31, 42], [5, 12, 23, 35, 47],
      [6, 14, 26, 38, 51], [7, 16, 29, 43, 58], [8, 17, 31, 46, 62], [9, 19, 34, 50, 67],
      [10, 21, 38, 55, 74], [11, 23, 42, 61, 80], [14, 28, 50, 72, 95], [16, 33, 57, 82, 107],
      [18, 37, 64, 91, 118], [22, 45, 77, 108, 140], [25, 49, 84, 117, 152]
    ]
  }
};

function interp1(xs, ys, x) {
  if (x <= xs[0]) return ys[0];
  if (x >= xs[xs.length - 1]) return ys[ys.length - 1];
  for (let i = 0; i < xs.length - 1; i++) {
    if (x >= xs[i] && x <= xs[i + 1]) {
      const t = (x - xs[i]) / (xs[i + 1] - xs[i]);
      return ys[i] + (ys[i + 1] - ys[i]) * t;
    }
  }
  return ys[ys.length - 1];
}

function normQ(caseKey, dn, temp) {
  const table = NORM[caseKey] || NORM.indoor_long;
  const byDn = table.q.map((row) => interp1(table.temps, row, temp));
  return interp1(DN, byDn, dn);
}

function fmt(num, d = 2) {
  if (!isFinite(num)) return "—";
  return num.toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: d });
}

/* ---- Управление материалом трубы и типоразмером ---- */
function rebuildSizes(matKey, preferredOd) {
  const mat = PIPE_MATERIALS[matKey] || PIPE_MATERIALS.steel;
  dnSelect.innerHTML = "";

  const optCustom = document.createElement("option");
  optCustom.value = "custom";
  optCustom.textContent = "Указать размер вручную";
  dnSelect.appendChild(optCustom);

  const optgroup = document.createElement("optgroup");
  optgroup.label = mat.standard;
  mat.sizes.forEach((sz) => {
    const o = document.createElement("option");
    o.value = `${sz.od},${sz.wall}`;
    o.textContent = sz.label;
    optgroup.appendChild(o);
  });
  dnSelect.appendChild(optgroup);

  // Ближайший типоразмер по наружному диаметру
  let best = mat.sizes[0];
  let bestDiff = Infinity;
  mat.sizes.forEach((sz) => {
    const d = Math.abs(sz.od - preferredOd);
    if (d < bestDiff) { bestDiff = d; best = sz; }
  });
  dnSelect.value = `${best.od},${best.wall}`;
  applySize();
}

function applySize() {
  const v = dnSelect.value;
  if (v === "custom") {
    dnInput.disabled = false;
    wallInput.disabled = false;
  } else {
    const parts = v.split(",").map(parseFloat);
    dnInput.value = parts[0];
    wallInput.value = parts[1];
    dnInput.disabled = true;
    wallInput.disabled = true;
  }
}

dnSelect.addEventListener("change", applySize);

pipeMatSelect.addEventListener("change", () => {
  const preferred = parseFloat(dnInput.value) || 89;
  rebuildSizes(pipeMatSelect.value, preferred);
});

// Начальная инициализация
rebuildSizes(pipeMatSelect.value, parseFloat(dnInput.value) || 89);

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const tv = parseFloat(document.getElementById("spTv").value);
  const tn = parseFloat(document.getElementById("spTn").value);
  const dn = parseFloat(dnInput.value);
  const wall = parseFloat(wallInput.value);
  const thk = parseFloat(thicknessInput.value);
  const pipeKey = pipeMatSelect.value;
  const matKey = materialSelect.value;
  const placement = placementSelect.value;
  const orientation = document.querySelector('input[name="spOrient"]:checked').value;
  const kKey = document.getElementById("spK").value;
  const region = document.getElementById("spRegion").value;
  const normCase = normCaseSelect.value;
  const L = parseFloat(document.getElementById("spLength").value);
  const G = parseFloat(document.getElementById("spFlow").value);

  if (!(dn > 0)) { alert("Укажите корректный наружный диаметр"); return; }
  if (!(wall > 0)) { alert("Укажите корректную толщину стенки трубы"); return; }
  if (2 * wall >= dn) { alert("Толщина стенки слишком велика: внутренний диаметр ≤ 0"); return; }
  if (thk < 0) { alert("Толщина изоляции не может быть отрицательной"); return; }
  if (!(L > 0)) { alert("Длина трассы должна быть больше 0"); return; }

  const pipeMat = PIPE_MATERIALS[pipeKey] || PIPE_MATERIALS.steel;
  const isSteel = pipeKey === "steel" && pipeMat.norm;

  const mat = MATERIALS[matKey];
  // Расчётная температура материала: tm = (tв+40)/2 (помещение, канал, лето); tm = tв/2 (наружный воздух зимой)
  const isOutdoorAir = placement.startsWith("air_");
  const tm = isOutdoorAir ? tv / 2 : (tv + 40) / 2;
  const lambda = mat.lambda0 + mat.k * tm;

  const dOut = dn / 1000;
  const dIn = dn - 2 * wall;
  const dInM = dIn / 1000;
  const dIz = (dn + 2 * thk) / 1000;
  const alpha = getAlpha(placement, orientation);

  // Сопротивление стенки трубы Rтр = ln(dн/dвн)/(2πλтр)
  const Rtr = Math.log(dOut / dInM) / (2 * Math.PI * pipeMat.lambda);
  const Riz = Math.log(dIz / dOut) / (2 * Math.PI * lambda);
  const Rn = 1 / (Math.PI * dIz * alpha);
  const Rtot = Rtr + Riz + Rn;

  const K = K_SELECT[kKey] ?? 1.0;
  const qRad = (tv - tn) / Rtot;
  const q = K * qRad;

  const Qtot = q * L;
  const Qkw = Qtot / 1000;

  const Gs = G / 3600;
  const rho = 970;
  const cp = 4186;
  const massFlow = Gs * rho;
  const dtPerM = massFlow > 0 ? q / (massFlow * cp) : 0;
  const dtTotal = dtPerM * L;
  const tEnd = tv - dtTotal;

  // Температура поверхности изоляции (по радиальному потоку без учёта K)
  const tSurf = tn + qRad * Rn;

  // Нормативная (допустимая) плотность теплового потока — только для стальных труб
  const regionCoef = getRegionCoef(region, isOutdoorAir);
  const qNorm = isSteel ? normQ(normCase, dn, tv) * regionCoef : null;
  const okNorm = isSteel && q <= qNorm;

  // Температура поверхности не более 35 °С (безопасность, СП 61.13330)
  const okSurf = tSurf <= 35.5;

  document.getElementById("rPipeMat").textContent = `${pipeMat.name} (λ = ${fmt(pipeMat.lambda, pipeMat.lambda < 1 ? 2 : 0)} Вт/(м·°С))`;
  document.getElementById("rDvn").textContent = `${fmt(dIn, 1)} мм`;
  document.getElementById("rRtr").textContent = `${fmt(Rtr, pipeMat.lambda < 1 ? 4 : 6)} (м·°С)/Вт`;
  document.getElementById("rLambda").textContent = `${fmt(lambda, 4)} Вт/(м·°С)`;
  document.getElementById("rTm").textContent = `${fmt(tm, 1)} °С`;
  document.getElementById("rAlpha").textContent = `${fmt(alpha, 0)} Вт/(м²·°С)`;
  document.getElementById("rK").textContent = `${fmt(K, 2)}`;
  document.getElementById("rRiz").textContent = `${fmt(Riz, 4)} (м·°С)/Вт`;
  document.getElementById("rRn").textContent = `${fmt(Rn, 4)} (м·°С)/Вт`;
  document.getElementById("rRtot").textContent = `${fmt(Rtot, 4)} (м·°С)/Вт`;
  document.getElementById("rQ").textContent = `${fmt(q, 1)} Вт/м`;
  document.getElementById("rQnorm").textContent = isSteel ? `${fmt(qNorm, 1)} Вт/м` : "— (норма только для стали)";
  document.getElementById("rQtot").textContent = `${fmt(Qtot, 0)} Вт`;
  document.getElementById("rQkw").textContent = `${fmt(Qkw, 3)} кВт`;
  document.getElementById("rSurf").textContent = `${fmt(tSurf, 1)} °С`;
  document.getElementById("rDtPerM").textContent = `${fmt(dtPerM, 3)} °С/м`;
  document.getElementById("rDtTot").textContent = `${fmt(dtTotal, 2)} °С`;
  document.getElementById("rTend").textContent = `${fmt(tEnd, 1)} °С`;

  // Блок сравнения с нормой — только для стальных труб
  document.getElementById("spNormBlock").classList.toggle("hidden", !isSteel);
  document.getElementById("itemQnorm").classList.toggle("hidden", !isSteel);

  // Вердикт по нормам
  const verdict = document.getElementById("rVerdict");
  verdict.classList.remove("ok", "bad", "info");
  if (!isSteel) {
    verdict.classList.add("info");
    verdict.textContent = `ℹ Труба из ${pipeMat.name.toLowerCase()}: нормы табл. 2, 4, 5 СП 61.13330.2012 установлены для стальных трубопроводов и здесь не применяются. Расчёт выполнен по общим формулам Приложения В с учётом Rтр.`;
  } else if (okNorm) {
    verdict.classList.add("ok");
    verdict.textContent = `✔ Соответствует норме СП 61.13330.2012 (факт ${fmt(q, 1)} ≤ норма ${fmt(qNorm, 1)} Вт/м)`;
  } else {
    verdict.classList.add("bad");
    verdict.textContent = `✘ Превышает норму СП 61.13330.2012 (факт ${fmt(q, 1)} > норма ${fmt(qNorm, 1)} Вт/м). Увеличьте толщину изоляции или снизьте теплопроводность материала.`;
  }

  const surfVerdict = document.getElementById("rSurfVerdict");
  surfVerdict.classList.remove("ok", "bad");
  if (okSurf) {
    surfVerdict.classList.add("ok");
    surfVerdict.textContent = "✔ Температура поверхности изоляции ≤ 35 °С — безопасна в зоне доступа";
  } else {
    surfVerdict.classList.add("bad");
    surfVerdict.textContent = "✘ Температура поверхности изоляции > 35 °С — риск ожога, требуется большая толщина или защитный кожух";
  }

  // Инфографика: бары
  if (isSteel) {
    const maxBar = Math.max(q, qNorm) || 1;
    document.getElementById("barQ").style.width = `${Math.min(100, (q / maxBar) * 100)}%`;
    document.getElementById("barQnorm").style.width = `${Math.min(100, (qNorm / maxBar) * 100)}%`;
    document.getElementById("barQLabel").textContent = `${fmt(q, 1)} Вт/м`;
    document.getElementById("barQnormLabel").textContent = `${fmt(qNorm, 1)} Вт/м`;
  }

  // Инфографика: температурный профиль
  drawTempProfile(tv, tEnd);

  // Инфографика: индикатор поверхности
  const surfBar = document.getElementById("surfBar");
  const pct = Math.max(0, Math.min(100, (tSurf / 60) * 100));
  surfBar.style.width = `${pct}%`;
  surfBar.style.background = tSurf > 35 ? "linear-gradient(90deg,#34d399,#fbbf24,#f87171)" : "linear-gradient(90deg,#34d399,#60a5fa)";
  document.getElementById("surfMark").style.left = `${Math.max(0, Math.min(100, (35 / 60) * 100))}%`;

  resultsDiv.classList.add("show");
  resultsDiv.scrollIntoView({ behavior: "smooth", block: "start" });
});

function drawTempProfile(tv, tEnd) {
  const svg = document.getElementById("tempProfile");
  const W = 640, H = 120, pad = 40;
  const grad = Math.max(0.5, tv - tEnd);
  const yFor = (t) => pad + (1 - (t - tEnd) / grad) * (H - 2 * pad);
  const y0 = Math.max(pad, Math.min(H - pad, yFor(tv)));
  const y1 = Math.max(pad, Math.min(H - pad, yFor(tEnd)));
  svg.innerHTML = `
    <defs>
      <linearGradient id="pg" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#f87171"/>
        <stop offset="1" stop-color="#60a5fa"/>
      </linearGradient>
    </defs>
    <line x1="${pad}" y1="${y0}" x2="${W - pad}" y2="${y1}" stroke="url(#pg)" stroke-width="14" stroke-linecap="round"/>
    <circle cx="${pad}" cy="${y0}" r="9" fill="#f87171"/>
    <circle cx="${W - pad}" cy="${y1}" r="9" fill="#60a5fa"/>
    <text x="${pad}" y="${y0 - 16}" fill="#e2e8f0" font-size="15" text-anchor="start">${fmt(tv, 1)} °С</text>
    <text x="${W - pad}" y="${y1 - 16}" fill="#e2e8f0" font-size="15" text-anchor="end">${fmt(tEnd, 1)} °С</text>
    <text x="${pad}" y="${H - 8}" fill="#94a3b8" font-size="12">начало трассы</text>
    <text x="${W - pad}" y="${H - 8}" fill="#94a3b8" font-size="12" text-anchor="end">конец трассы</text>
  `;
}

resetBtn.addEventListener("click", () => {
  form.reset();
  dnInput.disabled = false;
  wallInput.disabled = false;
  rebuildSizes(pipeMatSelect.value, parseFloat(dnInput.value) || 89);
  resultsDiv.classList.remove("show");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ---- Service Worker для офлайн-режима ---- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}