const form = document.getElementById("heatLossForm");
const diameterTypeSelect = document.getElementById("diameterType");
const outerDiameterInput = document.getElementById("outerDiameter");
const insulationTypeSelect = document.getElementById("insulationType");
const insulationThicknessGroup = document.getElementById("insulationThicknessGroup");
const insulationThicknessInput = document.getElementById("insulationThickness");
const resultsDiv = document.getElementById("results");
const resetBtn = document.getElementById("resetBtn");
const installBanner = document.getElementById("installBanner");
const installBtn = document.getElementById("installBtn");
const installClose = document.getElementById("installClose");

let deferredPrompt = null;

function getAlpha(layingType) {
  switch (layingType) {
    case "indoor_open": return 10.5;
    case "indoor_closed": return 7.0;
    case "unheated_room": return 8.5;
    case "crawl_space": return 7.0;
    case "outdoor": return 17.0;
    default: return 10.5;
  }
}

function getInsulationReduction(insulationType, thicknessMm) {
  switch (insulationType) {
    case "none": return 1.0;
    case "foam_pe":
      if (thicknessMm >= 25) return 0.35;
      if (thicknessMm >= 13) return 0.4;
      if (thicknessMm >= 9) return 0.45;
      return 0.5;
    case "rubber":
      if (thicknessMm >= 25) return 0.35;
      if (thicknessMm >= 13) return 0.4;
      return 0.45;
    case "mineral_wool":
      if (thicknessMm >= 40) return 0.25;
      if (thicknessMm >= 30) return 0.3;
      if (thicknessMm >= 20) return 0.35;
      return 0.4;
    case "ppu_shell":
      if (thicknessMm >= 50) return 0.15;
      if (thicknessMm >= 40) return 0.2;
      if (thicknessMm >= 30) return 0.25;
      return 0.3;
    case "foam":
      if (thicknessMm >= 40) return 0.25;
      if (thicknessMm >= 30) return 0.3;
      return 0.35;
    case "custom":
      if (thicknessMm <= 0) return 1.0;
      if (thicknessMm < 10) return 0.55;
      if (thicknessMm < 20) return 0.45;
      if (thicknessMm < 30) return 0.38;
      if (thicknessMm < 40) return 0.32;
      if (thicknessMm < 50) return 0.27;
      return 0.22;
    default: return 1.0;
  }
}

diameterTypeSelect.addEventListener("change", () => {
  const val = diameterTypeSelect.value;
  if (val !== "custom") {
    outerDiameterInput.value = parseFloat(val).toFixed(1);
    outerDiameterInput.disabled = true;
  } else {
    outerDiameterInput.disabled = false;
  }
});

if (diameterTypeSelect.value !== "custom") {
  outerDiameterInput.value = parseFloat(diameterTypeSelect.value).toFixed(1);
  outerDiameterInput.disabled = true;
}

insulationTypeSelect.addEventListener("change", () => {
  const val = insulationTypeSelect.value;
  if (val === "none") {
    insulationThicknessGroup.classList.add("hidden");
    insulationThicknessInput.value = "0";
  } else if (val === "custom") {
    insulationThicknessGroup.classList.remove("hidden");
    insulationThicknessInput.value = "20";
  } else {
    insulationThicknessGroup.classList.remove("hidden");
    switch (val) {
      case "foam_pe": insulationThicknessInput.value = "13"; break;
      case "rubber": insulationThicknessInput.value = "13"; break;
      case "mineral_wool": insulationThicknessInput.value = "30"; break;
      case "ppu_shell": insulationThicknessInput.value = "40"; break;
      case "foam": insulationThicknessInput.value = "40"; break;
      default: insulationThicknessInput.value = "20";
    }
  }
});

function initInsulation() {
  const val = insulationTypeSelect.value;
  if (val === "none") {
    insulationThicknessGroup.classList.add("hidden");
    insulationThicknessInput.value = "0";
  } else {
    insulationThicknessGroup.classList.remove("hidden");
  }
}
initInsulation();

function formatNumber(num, decimals = 2) {
  if (num === 0 || isNaN(num) || !isFinite(num)) return "0";
  const factor = Math.pow(10, decimals);
  const rounded = Math.round(num * factor) / factor;
  return rounded.toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: decimals });
}

function formatNumberSmart(num) {
  if (num >= 1000) return formatNumber(num, 0);
  if (num >= 100) return formatNumber(num, 1);
  if (num >= 10) return formatNumber(num, 1);
  if (num >= 1) return formatNumber(num, 2);
  return formatNumber(num, 3);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const tSupply = parseFloat(document.getElementById("tSupply").value);
  const tEnv = parseFloat(document.getElementById("tEnv").value);
  const flowRateM3h = parseFloat(document.getElementById("flowRate").value);
  const pipeLength = parseFloat(document.getElementById("pipeLength").value);
  const outerDiameterMm = parseFloat(document.getElementById("outerDiameter").value);
  const layingType = document.querySelector('input[name="layingType"]:checked').value;
  const insulationType = insulationTypeSelect.value;
  const insulationThicknessMm = parseFloat(insulationThicknessInput.value);
  const safetyFactor = parseFloat(document.getElementById("safetyFactor").value);

  if (pipeLength <= 0) { alert("Длина трубопровода должна быть больше 0"); return; }
  if (outerDiameterMm <= 0) { alert("Наружный диаметр должен быть больше 0"); return; }
  if (flowRateM3h <= 0) { alert("Расход теплоносителя должен быть больше 0"); return; }

  const tWorking = tSupply;
  const deltaT = tWorking - tEnv;
  const dOutM = outerDiameterMm / 1000;
  const surfPerM = Math.PI * dOutM;
  const alphaN = getAlpha(layingType);
  const qPerMUninsulated = alphaN * Math.PI * dOutM * deltaT;
  const kReduction = getInsulationReduction(insulationType, insulationThicknessMm);
  let qPerM = qPerMUninsulated * kReduction;
  if (qPerM < 0) qPerM = 0;

  const qTotalNoSafe = qPerM * pipeLength;
  const qTotalSafe = qTotalNoSafe * safetyFactor;
  const qTotalKw = qTotalSafe / 1000;

  const flowRateM3s = flowRateM3h / 3600;
  const rhoWater = 970;
  const cpWater = 4186;
  const massFlow = flowRateM3s * rhoWater;
  const deltaTPerM = massFlow > 0 ? qPerM / (massFlow * cpWater) : 0;
  const deltaTTotal = deltaTPerM * pipeLength;

  let qNote = "";
  if (qPerM < 5) qNote = "Низкие удельные теплопотери (хорошая изоляция/небольшая Δt)";
  else if (qPerM < 15) qNote = "Умеренные удельные теплопотери (типично для внутридомовых трасс)";
  else if (qPerM < 30) qNote = "Повышенные теплопотери (большой диаметр, открыто или большая Δt)";
  else qNote = "Значительные теплопотери — рекомендуется проверить необходимость изоляции";

  const qPerMEl = document.getElementById("qPerM");
  qPerMEl.classList.remove("warning", "danger");
  if (qPerM >= 30) qPerMEl.classList.add("danger");
  else if (qPerM >= 15) qPerMEl.classList.add("warning");

  document.getElementById("tAvg").textContent = `${formatNumber(tWorking, 1)} °С`;
  document.getElementById("deltaT").textContent = `${formatNumber(deltaT, 1)} °С`;
  document.getElementById("dOutMm").textContent = `${formatNumber(outerDiameterMm, 1)} мм`;
  document.getElementById("surf1m").textContent = `${formatNumber(surfPerM, 3)} м²/м`;
  document.getElementById("qPerM").textContent = `${formatNumberSmart(qPerM)} Вт/м`;
  document.getElementById("qNote").textContent = qNote;
  document.getElementById("qTotalNoSafe").textContent = `${formatNumberSmart(qTotalNoSafe)} Вт`;
  document.getElementById("safeFactorVal").textContent = `${safetyFactor.toFixed(2)}×`;
  document.getElementById("qTotalSafe").textContent = `${formatNumberSmart(qTotalSafe)} Вт`;
  document.getElementById("qTotalKw").textContent = `${formatNumber(qTotalKw, 3)} кВт`;
  document.getElementById("dtPerM").textContent = `${formatNumber(deltaTPerM, 3)} °С/м`;
  document.getElementById("dtTotal").textContent = `${formatNumber(deltaTTotal, 2)} °С`;

  resultsDiv.classList.add("show");
  resultsDiv.scrollIntoView({ behavior: "smooth", block: "start" });
});

resetBtn.addEventListener("click", () => {
  form.reset();
  if (diameterTypeSelect.value !== "custom") {
    outerDiameterInput.value = parseFloat(diameterTypeSelect.value).toFixed(1);
    outerDiameterInput.disabled = true;
  } else {
    outerDiameterInput.disabled = false;
  }
  initInsulation();
  resultsDiv.classList.remove("show");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBanner.classList.add('show');
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBanner.classList.remove('show');
});

installClose.addEventListener('click', () => {
  installBanner.classList.remove('show');
});