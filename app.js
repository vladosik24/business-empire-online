// ================= CONFIG =================
const DB_URL = "https://business-empire-default-rtdb.firebaseio.com";

// ================= GAME DATA =================
let balance = parseFloat(localStorage.getItem("balance")) || 0;

let businesses = JSON.parse(localStorage.getItem("businesses")) || [
  { name: "Кава", basePrice: 50, baseIncome: 1, level: 0 },
  { name: "Міні-магазин", basePrice: 200, baseIncome: 5, level: 0 },
  { name: "Інтернет-магазин", basePrice: 1000, baseIncome: 20, level: 0 }
];

let lastBonus = parseInt(localStorage.getItem("lastBonus")) || 0;

// ================= DOM =================
const balanceEl = document.getElementById("balance");
const businessListEl = document.getElementById("business-list");
const eventsEl = document.getElementById("events");
const statsEl = document.getElementById("stats");
const bonusBtn = document.getElementById("daily-bonus-btn");
const bonusTimerEl = document.getElementById("bonus-timer");

// ================= RENDER =================
function render() {
  balanceEl.textContent = `Баланс: ₴${balance.toFixed(2)}`;
  businessListEl.innerHTML = "";

  businesses.forEach((b, i) => {
    const price = b.basePrice * Math.pow(1.6, b.level);
    const income = b.baseIncome * Math.pow(1.4, b.level);

    const div = document.createElement("div");
    div.className = "business";
    div.innerHTML = `
      <h3>${b.name}</h3>
      <p>Рівень: ${b.level}</p>
      <p>Ціна апгрейду: ₴${price.toFixed(2)}</p>
      <p>Дохід: ₴${income.toFixed(2)}/сек</p>
      <button onclick="upgrade(${i})">Апгрейд</button>
    `;
    businessListEl.appendChild(div);
  });

  const totalIncome = businesses.reduce(
    (sum, b) => sum + b.baseIncome * Math.pow(1.4, b.level),
    0
  );

  statsEl.textContent = `Бізнесів: ${businesses.length} | Дохід: ₴${totalIncome.toFixed(2)}/сек`;
}

// ================= UPGRADE =================
function upgrade(i) {
  const b = businesses[i];
  const price = b.basePrice * Math.pow(1.6, b.level);

  if (balance >= price) {
    balance -= price;
    b.level++;
    saveGame();
    render();
    showEvent(`Апгрейд: ${b.name}`);
    vibrate();
  } else {
    showEvent(`Недостатньо грошей`);
  }
}

// ================= DAILY BONUS =================
function canClaimBonus() {
  return Date.now() - lastBonus > 24 * 60 * 60 * 1000;
}

function claimBonus() {
  if (!canClaimBonus()) {
    showEvent("Бонус ще недоступний");
    return;
  }

  const bonus = 500;
  balance += bonus;
  lastBonus = Date.now();
  saveGame();
  render();
  showEvent(`Щоденний бонус +₴${bonus}`);
}

bonusBtn.onclick = claimBonus;

// ================= TIMER =================
function updateBonusTimer() {
  const remaining = Math.max(
    0,
    24 * 60 * 60 * 1000 - (Date.now() - lastBonus)
  );

  const h = String(Math.floor(remaining / 3600000)).padStart(2, "0");
  const m = String(Math.floor((remaining % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");

  bonusTimerEl.textContent = `Щоденний бонус: ${h}:${m}:${s}`;
}

setInterval(updateBonusTimer, 1000);

// ================= GAME LOOP =================
setInterval(() => {
  const income = businesses.reduce(
    (sum, b) => sum + b.baseIncome * Math.pow(1.4, b.level),
    0
  );

  balance += income;
  saveGame();
  render();
  randomEvent();
}, 1000);

// ================= RANDOM EVENTS =================
function randomEvent() {
  const r = Math.random();
  if (r < 0.05) {
    balance += 200;
    showEvent("Грант +₴200");
  } else if (r < 0.1) {
    balance = Math.max(0, balance - 100);
    showEvent("Криза -₴100");
  }
}

// ================= EVENTS =================
function showEvent(text) {
  eventsEl.textContent = text;
}

// ================= SAVE =================
function saveGame() {
  localStorage.setItem("balance", balance);
  localStorage.setItem("businesses", JSON.stringify(businesses));
  localStorage.setItem("lastBonus", lastBonus);
}

// ================= VIBRATION =================
function vibrate(ms = 40) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

// ================= LEADERBOARD =================
function saveScore() {
  const input = document.getElementById("playerName");
  const name = input.value.trim() || "Гравець";

  fetch(`${DB_URL}/scores.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name,
      money: Math.floor(balance),
      createdAt: Date.now()
    })
  }).then(() => {
    input.value = "";
    loadLeaderboard();
  });
}

function loadLeaderboard() {
  fetch(`${DB_URL}/scores.json`)
    .then(res => res.json())
    .then(data => {
      const ul = document.getElementById("leaderboardList");
      ul.innerHTML = "";

      if (!data) return;

      Object.values(data)
        .filter(s => typeof s.money === "number" && s.money > 0)
        .sort((a, b) => b.money - a.money)
        .slice(0, 10)
        .forEach(s => {
          const li = document.createElement("li");
          li.textContent = `${s.name || "Гравець"} — ₴${s.money}`;
          ul.appendChild(li);
        });
    });
}

// ================= INIT =================
render();
loadLeaderboard();