let player = null;

const BUSINESS_LIST = [
  { name: "Кіоск", cost: 500, income: 5 },
  { name: "Магазин", cost: 1500, income: 20 },
  { name: "Кафе", cost: 4000, income: 60 },
  { name: "Компанія", cost: 10000, income: 200 }
];

function startGame() {
  const name = document.getElementById("nameInput").value.trim();
  if (!name) return alert("Введіть імʼя");

  const saved = localStorage.getItem("player_" + name);
  player = saved ? JSON.parse(saved) : {
    name,
    money: 1688,
    income: 0,
    businesses: {},
    upgrades: {}
  };

  document.getElementById("login").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
  document.getElementById("playerName").innerText = player.name;

  render();
  setInterval(tick, 1000);
  setInterval(randomEvent, 30000); // подія кожні 30 секунд
}

function tick() {
  player.money += player.income / 60;
  save();
  render();
  updateRating();
}

function buyBusiness(index) {
  const b = BUSINESS_LIST[index];
  if (player.money < b.cost) return alert("Недостатньо грошей");

  player.money -= b.cost;
  player.businesses[b.name] = (player.businesses[b.name] || 0) + 1;
  player.income += b.income;

  save();
  render();
  updateRating();
}

function upgradeBusiness(index) {
  const b = BUSINESS_LIST[index];
  const level = player.upgrades[b.name] || 0;
  const upgradeCost = (level + 1) * b.cost;

  if (player.money < upgradeCost) return alert("Недостатньо грошей на апгрейд");
  player.money -= upgradeCost;
  player.upgrades[b.name] = level + 1;
  player.income += b.income;

  save();
  render();
}

function render() {
  document.getElementById("money").innerText = Math.floor(player.money);
  document.getElementById("income").innerText = player.income;

  const list = document.getElementById("businesses");
  list.innerHTML = "";
  BUSINESS_LIST.forEach((b, i) => {
    const div = document.createElement("div");
    div.className = "business";
    const level = player.upgrades[b.name] || 0;
    div.innerHTML = `
      <strong>${b.name}</strong><br>
      Ціна: ${b.cost} 💰<br>
      Дохід: +${b.income}/хв<br>
      У вас: ${player.businesses[b.name] || 0}<br>
      Апгрейд рівень: ${level} <button onclick="upgradeBusiness(${i})">Прокачати</button><br>
      <button onclick="buyBusiness(${i})">Купити</button>
    `;
    list.appendChild(div);
  });
}

function save() {
  localStorage.setItem("player_" + player.name, JSON.stringify(player));
}

function updateRating() {
  const rating = [];
  for (let key in localStorage) {
    if (key.startsWith("player_")) {
      rating.push(JSON.parse(localStorage[key]));
    }
  }
  rating.sort((a, b) => b.money - a.money);

  const ol = document.getElementById("rating");
  ol.innerHTML = "";
  rating.slice(0, 10).forEach(p => {
    const li = document.createElement("li");
    li.innerText = `${p.name}: ${Math.floor(p.money)} 💰`;
    ol.appendChild(li);
  });
}

function randomEvent() {
  const events = [
    { text: "Бонус! Отримуєте 500 💰", money: 500 },
    { text: "Кризa! Втратили 300 💰", money: -300 },
    { text: "Інвестиція принесла 200 💰", money: 200 }
  ];

  const e = events[Math.floor(Math.random() * events.length)];
  player.money += e.money;
  document.getElementById("events").innerText = e.text;
  save();
  render();
}
