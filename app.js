const DB_URL = "https://business-empire-default-rtdb.firebaseio.com";

// ====== GAME DATA ======
let balance = Number(localStorage.getItem("balance")) || 0;

let businesses = JSON.parse(localStorage.getItem("businesses")) || [
  { name: "Кава", basePrice: 50, baseIncome: 1, level: 0 },
  { name: "Міні-магазин", basePrice: 200, baseIncome: 5, level: 0 },
  { name: "Інтернет-магазин", basePrice: 1000, baseIncome: 20, level: 0 }
];

let lastBonus = Number(localStorage.getItem("lastBonus")) || 0;

// ====== DOM ======
const balanceEl = document.getElementById("balance");
const businessListEl = document.getElementById("business-list");
const eventsEl = document.getElementById("events");
const statsEl = document.getElementById("stats");
const bonusBtn = document.getElementById("daily-bonus-btn");
const bonusTimerEl = document.getElementById("bonus-timer");
const leaderboardEl = document.getElementById("leaderboardList");

// ====== RENDER ======
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

// ====== UPGRADE ======
function upgrade(i) {
  const b = businesses[i];
  const price = b.basePrice * Math.pow(1.6, b.level);

  if (balance >= price) {
    balance -= price;
    b.level++;
    saveGame();
    render();
    showEvent(`Апгрейд: ${b.name}`);
  } else {
    showEvent(`Недостатньо грошей`);
  }
}

// ====== BONUS ======
function canClaimBonus() {
  return Date.now() - lastBonus >= 24 * 60 * 60 * 1000;
}

function claimBonus() {
  if (!canClaimBonus()) {
    showEvent("Бонус ще недоступний");
    return;
  }

  balance += 500;
  lastBonus = Date.now();
  saveGame();
  render();
  showEvent("Щоденний бонус +₴500");
}

bonusBtn.onclick = claimBonus;

// ====== GAME LOOP ======
setInterval(() => {
  const income = businesses.reduce(
    (sum, b) => sum + b.baseIncome * Math.pow(1.4, b.level),
    0
  );
  balance += income;
  saveGame();
  render();
}, 1000);

// ====== EVENTS ======
function showEvent(text) {
  eventsEl.textContent = text;
}

// ====== SAVE ======
function saveGame() {
  localStorage.setItem("balance", balance);
  localStorage.setItem("businesses", JSON.stringify(businesses));
  localStorage.setItem("lastBonus", lastBonus);
}

// ====== BONUS TIMER ======
function updateBonusTimer() {
  const remain = Math.max(
    0,
    24 * 60 * 60 * 1000 - (Date.now() - lastBonus)
  );

  const h = String(Math.floor(remain / 3600000)).padStart(2, "0");
  const m = String(Math.floor((remain % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((remain % 60000) / 1000)).padStart(2, "0");

  bonusTimerEl.textContent = `Щоденний бонус: ${h}:${m}:${s}`;
}
setInterval(updateBonusTimer, 1000);

// ====== LEADERBOARD SAVE ======
function saveScore() {
  const input = document.getElementById("playerName");
  const name = input.value.trim() || "Гравець";
  const money = Math.floor(balance);

  if (!Number.isFinite(money) || money <= 0) return;

  fetch(`${DB_URL}/scores.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      money,
      createdAt: Date.now()
    })
  }).then(() => {
    input.value = "";
    loadLeaderboard();
  });
}

// ====== LEADERBOARD LOAD (FIX UNDEFINED) ======
function loadLeaderboard() {
  fetch(`${DB_URL}/scores.json`)
    .then(res => res.json())
    .then(data => {
      const ul = document.getElementById("leaderboardList");
      if (!ul) return;

      ul.innerHTML = "";

      if (!data || typeof data !== "object") return;

      const list = Object.values(data)
        .filter(s =>
          s &&
          typeof s === "object" &&
          typeof s.name === "string" &&
          s.name.trim().length > 0 &&
          typeof s.money === "number" &&
          Number.isFinite(s.money) &&
          s.money > 0
        )
        .sort((a, b) => b.money - a.money)
        .slice(0, 10);

   list.forEach(s => {
  if (!s.name || !Number.isFinite(s.money)) return;

  const li = document.createElement("li");
  li.textContent = `${s.name} — ₴${Math.floor(s.money)}`;
  ul.appendChild(li);
});
document.addEventListener("DOMContentLoaded", () => {
  render();
  loadLeaderboard();
});
// ====== INIT ======
document.addEventListener("DOMContentLoaded", () => {
  render();
  loadLeaderboard();

  // повторне завантаження для Telegram (фікс WebView)
  setTimeout(loadLeaderboard, 500);
});