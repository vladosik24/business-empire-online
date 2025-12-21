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
    businesses: {}
  };

  document.getElementById("login").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
  document.getElementById("playerName").innerText = player.name;

  render();
  setInterval(tick, 1000);
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

function render() {
  document.getElementById("money").innerText = player.money.toFixed(0);
  document.getElementById("income").innerText = player.income;

  const list = document.getElementById("businesses");
  list.innerHTML = "";

  BUSINESS_LIST.forEach((b, i) => {
    const div = document.createElement("div");
    div.className = "business";
    div.innerHTML = `
      <strong>${b.name}</strong><br>
      Ціна: ${b.cost} 💰<br>
      Дохід: +${b.income}/хв<br>
      У вас: ${player.businesses[b.name] || 0}<br>
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
