import { saveScore, loadLeaderboard } from "./firebase.js";

let level = 0, speed = 8, moving = false, vx = 0, vy = 0, startTime, timerInterval, timeLeft = 30;
let name = "", shareText = "", cheatCounter = 0;

const btn = document.getElementById("gameBtn");
const area = document.getElementById("gameArea");
const timerEl = document.getElementById("timer");
const tauntEl = document.getElementById("taunt");
const popupBox = document.querySelector(".popupBox");

const taunts = ["Warmup.", "Faster...", "Try this.", "Slippery!", "Don't miss!", "Dizzy?", "Chaos!", "Impossible.", "FOCUS!", "SURVIVE!"];

window.addEventListener('DOMContentLoaded', () => {
    const savedName = localStorage.getItem("player_name");
    if(savedName) document.getElementById("username").value = savedName;
    loadLeaderboard();
});

window.start = () => {
    const inputName = document.getElementById("username").value.trim();
    if (!inputName) return alert("Enter your name to play!");
    localStorage.setItem("player_name", inputName);
    name = inputName;
    document.getElementById("home").style.display = "none";
    showLoadingSequence();
};

window.retry = () => {
    document.getElementById("popup").style.display = "none";
    document.getElementById("game").style.display = "none";
    document.querySelectorAll('.particle').forEach(p => p.remove());
    showLoadingSequence();
};

window.goHome = () => {
    document.getElementById("popup").style.display = "none";
    document.getElementById("game").style.display = "none";
    document.querySelectorAll('.particle').forEach(p => p.remove());
    const homeEl = document.getElementById("home");
    homeEl.style.display = "block";
    homeEl.style.animation = "none";
    setTimeout(() => homeEl.style.animation = "fadeIn 0.4s ease-out forwards", 10);
    loadLeaderboard();
};

function showLoadingSequence() {
    document.getElementById("loadingScreen").style.display = "flex";
    setTimeout(() => {
        document.getElementById("loadingScreen").style.display = "none";
        document.getElementById("game").style.display = "block";
        level = 1; moving = true; startTime = Date.now(); timeLeft = 30; speed = 8; cheatCounter = 0;
        btn.style.background = ""; btn.style.boxShadow = ""; btn.style.color = ""; btn.innerText = "CLICK ME";
        tauntEl.innerText = taunts[0]; tauntEl.style.color = "#ff4757"; timerEl.innerText = "30s";
        const angle = Math.random() * Math.PI * 2;
        vx = Math.cos(angle) * speed; vy = Math.sin(angle) * speed;
        startTimer(); animate();
    }, 1200);
}

function updateSkins() {
    if (level === 4) { btn.style.background = "linear-gradient(135deg, #00ff00, #008000)"; btn.style.boxShadow = "0 0 20px #00ff00"; }
    else if (level === 8) { btn.style.background = "linear-gradient(135deg, #ffd700, #ff8c00)"; btn.style.boxShadow = "0 0 25px #ffd700"; }
    else if (level === 10) { btn.style.background = "linear-gradient(135deg, #ff0000, #800000)"; btn.style.boxShadow = "0 0 35px #ff0000"; btn.style.color = "#fff"; btn.innerText = "SURVIVE!"; }
}

function createParticles(x, y, count = 15, sizeMult = 1) {
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div'); p.className = 'particle'; document.body.appendChild(p);
        const size = (Math.random() * 8 + 4) * sizeMult;
        p.style.width = size + 'px'; p.style.height = size + 'px'; p.style.left = x + 'px'; p.style.top = y + 'px';
        const a = Math.random() * Math.PI * 2, v = Math.random() * 100 + 50;
        p.animate([{ transform: 'translate(-50%, -50%) scale(1)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a)*v}px), calc(-50% + ${Math.sin(a)*v}px)) scale(0)`, opacity: 0 }], { duration: 600 + Math.random() * 400 }).onfinish = () => p.remove();
    }
}

function registerHit(e) {
    if (e) e.preventDefault();
    if (!moving) return;
    createParticles(btn.offsetLeft + btn.offsetWidth / 2, btn.offsetTop + btn.offsetHeight / 2);
    level++;
    if (level > 10) { endGame(true); return; }
    document.getElementById("message").innerText = `LEVEL ${level}`;
    tauntEl.innerText = taunts[level - 1];
    speed *= 1.25; updateSkins();
    const angle = Math.random() * Math.PI * 2;
    vx = Math.cos(angle) * speed; vy = Math.sin(angle) * speed;
}

btn.addEventListener('touchstart', registerHit, {passive: false});
btn.addEventListener('mousedown', registerHit);

function triggerHack(e) {
    if (e) e.preventDefault();
    if (!moving) return;
    cheatCounter++;
    if (cheatCounter >= 5) {
        moving = false; tauntEl.innerText = "SYSTEM OVERRIDE..."; tauntEl.style.color = "#00ff00";
        createParticles(window.innerWidth/2, window.innerHeight/2, 50, 2);
        setTimeout(() => { level = 11; endGame(true, true); }, 1000);
    }
}

timerEl.addEventListener('touchstart', triggerHack, {passive: false});
timerEl.addEventListener('mousedown', triggerHack);

function animate() {
    if (!moving) return;
    let x = btn.offsetLeft + vx, y = btn.offsetTop + vy;
    if (x <= 0) { x = 0; vx *= -1; }
    if (x + btn.offsetWidth >= area.clientWidth) { x = area.clientWidth - btn.offsetWidth; vx *= -1; }
    if (y <= 0) { y = 0; vy *= -1; }
    if (y + btn.offsetHeight >= area.clientHeight) { y = area.clientHeight - btn.offsetHeight; vy *= -1; }
    btn.style.left = x + "px"; btn.style.top = y + "px";
    requestAnimationFrame(animate);
}

setInterval(() => {
    if (moving && level >= 2 && Math.random() < 0.3) {
        const a = Math.random() * Math.PI * 2;
        vx = Math.cos(a) * speed; vy = Math.sin(a) * speed;
    }
}, 800);

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--; timerEl.innerText = timeLeft + "s";
        if (timeLeft <= 0) endGame(false);
    }, 1000);
}

function getPlayerRank(lvl, time) {
    if (lvl > 10) return time < 15 ? "LEGEND" : "MASTER";
    if (lvl >= 8) return "PRO";
    if (lvl >= 4) return "AMATEUR";
    return "NOOB";
}

async function endGame(win, wasHacked = false) {
    moving = false; clearInterval(timerInterval);
    const finalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    const displayTime = wasHacked ? "0.01" : finalTime;
    const rank = wasHacked ? "HACKER" : getPlayerRank(level, displayTime);
    
    document.getElementById("popup").style.display = "flex";
    
    if (win) {
        popupBox.classList.add("winner-box");
        createParticles(window.innerWidth/2, window.innerHeight/2, 60, 2);
        const rc = wasHacked ? "#00ff00" : "#00f2ff";
        document.getElementById("result").innerHTML = `<span style="font-size:0.8em; color:gray;">RANK SECURED:</span><br><span style="color:${rc}; font-size:1.5em; text-shadow:0 0 10px ${rc};">${rank}</span><br><br>PASSED IN ${displayTime}s`;
        shareText = wasHacked ? `🤖 I bypassed the mainframe and got HACKER rank! Try to stop me.` : `🏆 I achieved ${rank} rank in the Click Me Challenge (${displayTime}s)! Can you beat me?`;
    } else {
        popupBox.classList.remove("winner-box");
        document.getElementById("result").innerHTML = `<span style="font-size:0.8em; color:gray;">RANK SECURED:</span><br><span style="color:#ff4757; font-size:1.5em;">${rank}</span><br><br>FAILED AT LEVEL ${level}`;
        shareText = `💀 I got the ${rank} rank and died at Level ${level} on the Click Me Challenge. Bet you can't do better.`;
    }

    await saveScore(name, displayTime, level, rank, win ? "PASSED" : "FAILED");
}

window.openShareMenu = () => document.getElementById("shareModal").style.display = "flex";
window.closeShareMenu = () => document.getElementById("shareModal").style.display = "none";
window.shareTo = (platform) => {
    const gameUrl = window.location.href;
    const txt = encodeURIComponent(shareText);
    const url = encodeURIComponent(gameUrl);
    
    if (platform === "copy") {
        navigator.clipboard.writeText(`${shareText} - Play here: ${gameUrl}`);
        const copyBtn = document.querySelector('.share-btn.cp');
        copyBtn.innerText = "Copied!"; copyBtn.style.background = "#25D366";
        setTimeout(() => { copyBtn.innerText = "Copy Link"; copyBtn.style.background = "#4a4a4a"; }, 2000);
        return; 
    }

    let link = "";
    if (platform === "whatsapp") link = `https://api.whatsapp.com/send?text=${txt}%20-%20Play%20here:%20${url}`;
    else if (platform === "telegram") link = `https://t.me/share/url?url=${url}&text=${txt}`;
    else if (platform === "x") link = `https://twitter.com/intent/tweet?text=${txt}&url=${url}`;
    
    if (link) window.open(link, '_blank');
};