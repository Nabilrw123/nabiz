const sensorState = {
  airTemperature: 29.5,
  airHumidity: 68,
  soilMoisture: 31,
  soilTemperature: 25.1,
  rangeHours: 6,
};

const airChart = document.getElementById("air-chart");
const soilChart = document.getElementById("soil-chart");
const airCtx = airChart.getContext("2d");
const soilCtx = soilChart.getContext("2d");

const airSeries = Array.from({ length: 12 }, (_, i) => ({
  temp: 28.5 + Math.sin(i / 1.6) * 0.9 + Math.random() * 0.6,
  humidity: 67 + Math.cos(i / 1.8) * 1.8 + Math.random() * 1.2,
}));

const soilSeries = Array.from({ length: 12 }, (_, i) =>
  32 - Math.sin(i / 1.3) * 1.5 - Math.random() * 1.2
);

const rangeButtons = document.querySelectorAll(".time-controls button");
rangeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    rangeButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    sensorState.rangeHours = Number(button.dataset.range);
    updateCharts();
  });
});

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function drawLineChart(ctx, dataset, options) {
  const { color, min, max, property, secondary, secondaryColor } = options;
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const padding = 32;

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(0.5, 0.5);

  ctx.strokeStyle = "rgba(47, 128, 237, 0.2)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 8]);
  for (let i = 0; i <= 4; i += 1) {
    const y = padding + ((height - padding * 2) / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  dataset.forEach((point, index) => {
    const x = lerp(padding, width - padding, index / (dataset.length - 1));
    const value = typeof point === "number" ? point : point[property];
    const yRatio = (value - min) / (max - min);
    const y = lerp(height - padding, padding, yRatio);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  ctx.fillStyle = color;
  dataset.forEach((point, index) => {
    const x = lerp(padding, width - padding, index / (dataset.length - 1));
    const value = typeof point === "number" ? point : point[property];
    const yRatio = (value - min) / (max - min);
    const y = lerp(height - padding, padding, yRatio);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  if (secondary) {
    ctx.strokeStyle = secondaryColor;
    ctx.fillStyle = secondaryColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    dataset.forEach((point, index) => {
      const x = lerp(padding, width - padding, index / (dataset.length - 1));
      const value = point[secondary];
      const yRatio = (value - options.secondaryMin) /
        (options.secondaryMax - options.secondaryMin);
      const y = lerp(height - padding, padding, yRatio);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    dataset.forEach((point, index) => {
      const x = lerp(padding, width - padding, index / (dataset.length - 1));
      const value = point[secondary];
      const yRatio = (value - options.secondaryMin) /
        (options.secondaryMax - options.secondaryMin);
      const y = lerp(height - padding, padding, yRatio);
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  ctx.restore();
}

function updateCharts() {
  drawLineChart(airCtx, airSeries, {
    color: "#2f80ed",
    min: 26,
    max: 32,
    property: "temp",
    secondary: "humidity",
    secondaryColor: "#27ae60",
    secondaryMin: 60,
    secondaryMax: 80,
  });

  drawLineChart(soilCtx, soilSeries, {
    color: "#f2994a",
    min: 24,
    max: 36,
  });
}

function updateMetrics() {
  document.getElementById("air-temp").textContent = `${sensorState.airTemperature.toFixed(1)}°C`;
  document.getElementById("air-humidity").textContent = `${sensorState.airHumidity.toFixed(0)}%`;
  document.getElementById("soil-moisture").textContent = `${sensorState.soilMoisture.toFixed(0)}%`;
  document.getElementById("soil-temp").textContent = `${sensorState.soilTemperature.toFixed(1)}°C`;
}

function pushNewSensorSample() {
  const { airTemperature, airHumidity, soilMoisture } = sensorState;
  const newAir = {
    temp: airTemperature + (Math.random() - 0.5) * 0.7,
    humidity: airHumidity + (Math.random() - 0.5) * 2,
  };
  const newSoil = soilMoisture + (Math.random() - 0.4) * 1.3;

  airSeries.push(newAir);
  soilSeries.push(newSoil);
  if (airSeries.length > 24) airSeries.shift();
  if (soilSeries.length > 24) soilSeries.shift();

  sensorState.airTemperature = newAir.temp;
  sensorState.airHumidity = newAir.humidity;
  sensorState.soilMoisture = newSoil;
  sensorState.soilTemperature += (Math.random() - 0.5) * 0.1;
}

setInterval(() => {
  pushNewSensorSample();
  updateMetrics();
  updateCharts();
  updateBlockHealth();
}, 6000);

const orchardMap = document.querySelector(".orchard-map");
const detailElements = {
  block: document.getElementById("block-name"),
  variety: document.getElementById("block-variety"),
  air: document.getElementById("block-air-temp"),
  soil: document.getElementById("block-soil-moisture"),
  status: document.getElementById("block-status"),
};

const orchardBlocks = [
  { id: "A1", variety: "Arumanis", airTemp: 29.4, soilMoisture: 34, status: "optimal" },
  { id: "A2", variety: "Manalagi", airTemp: 28.9, soilMoisture: 36, status: "optimal" },
  { id: "A3", variety: "Gadung", airTemp: 30.5, soilMoisture: 29, status: "caution" },
  { id: "A4", variety: "Gedong Gincu", airTemp: 31.1, soilMoisture: 27, status: "alert" },
  { id: "B1", variety: "Arumanis", airTemp: 29.0, soilMoisture: 32, status: "optimal" },
  { id: "B2", variety: "Harumanis", airTemp: 28.7, soilMoisture: 25, status: "caution" },
  { id: "B3", variety: "Manalagi", airTemp: 30.2, soilMoisture: 31, status: "optimal" },
  { id: "B4", variety: "Golek", airTemp: 30.8, soilMoisture: 24, status: "alert" },
  { id: "C1", variety: "Arumanis", airTemp: 27.8, soilMoisture: 26, status: "caution" },
  { id: "C2", variety: "Golek", airTemp: 28.5, soilMoisture: 30, status: "optimal" },
  { id: "C3", variety: "Manalagi", airTemp: 29.9, soilMoisture: 28, status: "caution" },
  { id: "C4", variety: "Gedong Gincu", airTemp: 30.1, soilMoisture: 33, status: "optimal" },
  { id: "D1", variety: "Arumanis", airTemp: 29.2, soilMoisture: 32, status: "optimal" },
  { id: "D2", variety: "Manalagi", airTemp: 30.4, soilMoisture: 30, status: "optimal" },
  { id: "D3", variety: "Gadung", airTemp: 31.6, soilMoisture: 23, status: "alert" },
  { id: "D4", variety: "Gedong Gincu", airTemp: 29.5, soilMoisture: 29, status: "caution" },
];

function createBlockElement(block) {
  const element = document.createElement("button");
  element.className = `map-block status-${block.status}`;
  element.setAttribute("role", "gridcell");
  element.innerHTML = `
    <strong>${block.id}</strong>
    <span>${block.variety}</span>
    <span class="status-chip status-${block.status}">
      ${block.status === "optimal" ? "Optimal" : block.status === "caution" ? "Perlu perhatian" : "Siaga tinggi"}
    </span>
  `;
  element.addEventListener("click", () => selectBlock(block));
  return element;
}

function renderMap() {
  orchardMap.innerHTML = "";
  for (let row = 0; row < 4; row += 1) {
    const rowFragment = document.createDocumentFragment();
    for (let col = 0; col < 4; col += 1) {
      const block = orchardBlocks[row * 4 + col];
      rowFragment.appendChild(createBlockElement(block));
    }
    orchardMap.appendChild(rowFragment);
  }
}

function selectBlock(block) {
  detailElements.block.textContent = block.id;
  detailElements.variety.textContent = block.variety;
  detailElements.air.textContent = `${block.airTemp.toFixed(1)}°C`;
  detailElements.soil.textContent = `${block.soilMoisture.toFixed(0)}%`;
  const descriptions = {
    optimal: "Kondisi ideal, tidak ada tindakan segera",
    caution: "Pantau kebutuhan air dan nutrisi",
    alert: "Butuh tindakan cepat: cek irigasi dan shading",
  };
  detailElements.status.textContent = descriptions[block.status];
}

function updateBlockHealth() {
  orchardBlocks.forEach((block) => {
    const delta = (Math.random() - 0.5) * 0.6;
    block.soilMoisture = Math.max(20, Math.min(40, block.soilMoisture + delta));
    if (block.soilMoisture < 26) {
      block.status = "alert";
    } else if (block.soilMoisture < 30) {
      block.status = "caution";
    } else {
      block.status = "optimal";
    }
  });
  renderMap();
}

renderMap();
updateMetrics();
updateCharts();

const imageInput = document.getElementById("image-input");
const analyzeButton = document.getElementById("analyze-button");
const previewFrame = document.getElementById("preview-frame");
const ripenessStatus = document.getElementById("ripeness-status");
const ripenessScore = document.getElementById("ripeness-score");
const recommendations = document.getElementById("recommendations");

let loadedImage = null;

imageInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      loadedImage = img;
      previewFrame.innerHTML = "";
      previewFrame.appendChild(img);
      analyzeButton.classList.add("enabled");
      analyzeButton.disabled = false;
      ripenessStatus.textContent = "Siap dianalisis";
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

analyzeButton.addEventListener("click", () => {
  if (!loadedImage) return;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const size = 96;
  canvas.width = size;
  canvas.height = size;
  ctx.drawImage(loadedImage, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  let total = 0;
  let red = 0;
  let green = 0;
  let yellowish = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;
    if (brightness < 40) continue;
    total += 1;
    red += r;
    green += g;
    if (r > 150 && g > 140 && b < 120) {
      yellowish += 1;
    }
  }

  const avgRed = red / Math.max(total, 1);
  const avgGreen = green / Math.max(total, 1);
  const ripenessRatio = avgRed / Math.max(avgGreen, 1);
  const yellowRatio = yellowish / Math.max(total, 1);
  const score = Math.min(1, (ripenessRatio - 0.8) * 0.8 + yellowRatio * 0.5);
  const normalized = Math.max(0, Math.min(1, score));

  ripenessScore.style.width = `${(normalized * 100).toFixed(0)}%`;

  if (normalized > 0.75) {
    ripenessStatus.textContent = "Mangga matang - siap panen";
    ripenessStatus.style.color = "#27ae60";
    recommendations.innerHTML = `
      <li>Panen dalam 1-2 hari pada pagi hari untuk menjaga kualitas.</li>
      <li>Pisahkan buah matang dari blok lain untuk menghindari memicu pematangan dini.</li>
    `;
  } else if (normalized > 0.45) {
    ripenessStatus.textContent = "Mangga menuju matang";
    ripenessStatus.style.color = "#f2994a";
    recommendations.innerHTML = `
      <li>Lakukan pemeriksaan ulang dalam 48 jam.</li>
      <li>Pastikan ventilasi gudang baik untuk mencegah kelembapan tinggi.</li>
    `;
  } else {
    ripenessStatus.textContent = "Mangga masih muda";
    ripenessStatus.style.color = "#2f80ed";
    recommendations.innerHTML = `
      <li>Lanjutkan pemupukan sesuai jadwal.</li>
      <li>Monitor intensitas sinar matahari untuk mendukung proses fotosintesis.</li>
    `;
  }
});

window.addEventListener("resize", updateCharts);
