// ====== GAME DATA ======
let balance = parseFloat(localStorage.getItem("balance")) || 0;
let businesses = JSON.parse(localStorage.getItem("businesses")) || [
  {name:"Кава", basePrice:50, baseIncome:1, level:0},
  {name:"Міні-магазин", basePrice:200, baseIncome:5, level:0},
  {name:"Інтернет-магазин", basePrice:1000, baseIncome:20, level:0}
];
let lastBonus = parseInt(localStorage.getItem("lastBonus")) || 0;

// ====== DOM ======
const balanceEl = document.getElementById("balance");
const businessListEl = document.getElementById("business-list");
const eventsEl = document.getElementById("events");
const statsEl = document.getElementById("stats");
const bonusBtn = document.getElementById("daily-bonus-btn");
const bonusTimerEl = document.getElementById("bonus-timer");

// ====== RENDER ======
function render() {
  balanceEl.textContent = `Баланс: ₴${balance.toFixed(2)}`;
  businessListEl.innerHTML = "";
  businesses.forEach((b,i)=>{
    const div = document.createElement("div");
    div.className = "business";
    div.innerHTML = `
      <h3>${b.name}</h3>
      <p>Рівень: ${b.level}</p>
      <p>Ціна апгрейду: ₴${(b.basePrice*Math.pow(1.6,b.level)).toFixed(2)}</p>
      <p>Дохід: ₴${(b.baseIncome*Math.pow(1.4,b.level)).toFixed(2)}/сек</p>
      <button onclick="upgrade(${i})">Апгрейд</button>
    `;
    businessListEl.appendChild(div);
  });
  const totalIncome = businesses.reduce((sum,b)=>sum+b.baseIncome*Math.pow(1.4,b.level),0);
  statsEl.innerHTML = `<p>Бізнесів: ${businesses.length} | Дохід: ₴${totalIncome.toFixed(2)}/сек</p>`;
}

// ====== UPGRADE ======
function upgrade(i){
  const b = businesses[i];
  const price = b.basePrice*Math.pow(1.6,b.level);
  if(balance >= price){
    balance -= price;
    b.level++;
    saveGame();
    render();
    showEvent(`Ти апгрейдив ${b.name}!`);
  } else {
    showEvent(`Недостатньо грошей для ${b.name}`);
  }
}

// ====== DAILY BONUS ======
function canClaimBonus(){
  const now = Date.now();
  return now - lastBonus > 24*60*60*1000;
}

function claimBonus(){
  if(canClaimBonus()){
    const bonus = 500;
    balance += bonus;
    lastBonus = Date.now();
    saveGame();
    render();
    showEvent(`Щоденний бонус: ₴${bonus}!`);
  } else {
    showEvent("Щоденний бонус ще не доступний");
  }
}

bonusBtn.onclick = claimBonus;

// ====== RANDOM EVENTS ======
function randomEvent(){
  const r = Math.random();
  if(r<0.05){ balance += 200; showEvent("Грант! +₴200"); }
  else if(r<0.10){ balance -= 100; showEvent("Криза! -₴100"); }
  else if(r<0.15){ balance += 50; showEvent("Інвестор +₴50"); }
  saveGame();
  render();
}

setInterval(()=>{
  const income = businesses.reduce((sum,b)=>sum+b.baseIncome*Math.pow(1.4,b.level),0);
  balance += income;
  saveGame();
  render();
  randomEvent();
},1000);

// ====== EVENTS ======
function showEvent(text){
  eventsEl.textContent = text;
}

// ====== SAVE ======
function saveGame(){
  localStorage.setItem("balance", balance);
  localStorage.setItem("businesses", JSON.stringify(businesses));
  localStorage.setItem("lastBonus", lastBonus);
}

// ====== BONUS TIMER ======
function updateBonusTimer(){
  const now = Date.now();
  const remaining = Math.max(0,24*60*60*1000 - (now - lastBonus));
  const h = String(Math.floor(remaining/3600000)).padStart(2,'0');
  const m = String(Math.floor((remaining%3600000)/60000)).padStart(2,'0');
  const s = String(Math.floor((remaining%60000)/1000)).padStart(2,'0');
  bonusTimerEl.textContent = `Щоденний бонус: ${h}:${m}:${s}`;
}
setInterval(updateBonusTimer,1000);
function vibrate(ms = 50) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

function clickSound() {
  const audio = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=");
  audio.play();
}
render();
