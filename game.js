import { saveScore, loadLeaderboard } from "./firebase.js";

let level=0;
let vx=2, vy=2;
let moving=false;
let startTime=0;
let name="";
let timeLeft=30;
let timerInterval;

// sounds
const clickSound = new Audio("https://www.soundjay.com/button/sounds/button-16.mp3");
const winSound = new Audio("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");

const btn = document.getElementById("gameBtn");
const msg = document.getElementById("message");
const popup = document.getElementById("popup");
const result = document.getElementById("result");
const timerEl = document.getElementById("timer");
const usernameInput = document.getElementById("username");

// ranks
function getRank(level){
  if(level <= 2) return "Noob 😅";
  if(level <= 4) return "Amateur 🙂";
  if(level <= 6) return "Pro 😎";
  if(level <= 8) return "Master 🔥";
  return "Legend 👑";
}

// auto-fill name
if(localStorage.getItem("name")){
  usernameInput.value = localStorage.getItem("name");
}

// start
window.start = ()=>{
  name = usernameInput.value.trim();
  if(!name) return alert("Enter name");

  localStorage.setItem("name", name);

  login.classList.remove("active");
  game.classList.add("active");

  startTime = Date.now();
  startTimer();

  msg.innerText="Level 1";
};

// timer
function startTimer(){
  timerInterval = setInterval(()=>{
    timeLeft--;
    timerEl.innerText = timeLeft + "s";

    if(timeLeft <= 0){
      endGame(false);
    }
  },1000);
}

// click
btn.onclick = ()=>{
  clickSound.play();
  level++;

  if(level === 1){
    startMoving();
    msg.innerText="Level 2";
    return;
  }

  vx *= 1.12;
  vy *= 1.12;

  msg.innerText = `Level ${level+1}`;

  if(level >= 10){
    endGame(true);
  }
};

// movement
function startMoving(){
  if(moving) return;
  moving=true;

  function animate(){
    if(!moving) return;

    let rect = btn.getBoundingClientRect();

    let x = rect.left + vx;
    let y = rect.top + vy;

    if(x <= 0 || x + rect.width >= window.innerWidth) vx *= -1;
    if(y <= 0 || y + rect.height >= window.innerHeight) vy *= -1;

    btn.style.left = x + "px";
    btn.style.top = y + "px";

    requestAnimationFrame(animate);
  }

  animate();
}

// end
async function endGame(win){
  moving=false;
  clearInterval(timerInterval);

  let time = ((Date.now()-startTime)/1000).toFixed(1);
  let rank = getRank(level);

  popup.style.display="flex";

  if(win){
    winSound.play();
    result.innerText = `🏆 ${name}\n${rank}\n${time}s`;
    await saveScore(name, parseFloat(time));
    loadLeaderboard();
  } else {
    result.innerText = `⏳ Level ${level}\nRank: ${rank}`;
  }
}

// share
window.shareResult = ()=>{
  let text = result.innerText;

  if(navigator.share){
    navigator.share({ text });
  } else {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  }
};

// load leaderboard
loadLeaderboard();