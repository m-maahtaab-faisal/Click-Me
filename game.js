import { saveScore, loadLeaderboard } from "./firebase.js";

let level = 0, speed = 8, moving = false, vx = 0, vy = 0, startTime, timerInterval, timeLeft = 30, name = "", shareText = "", cheatCounter = 0;
const btn = document.getElementById("gameBtn"), area = document.getElementById("gameArea"), timerEl = document.getElementById("timer"), tauntEl = document.getElementById("taunt"), popupBox = document.querySelector(".popupBox");
const taunts = ["Warmup.", "Faster...", "Try this.", "Slippery!", "Don't miss!", "Dizzy?", "Chaos!", "Almost impossible.", "FOCUS!", "SURVIVE!"];

window.addEventListener('DOMContentLoaded', () => {
    if(localStorage.getItem("player_name")) document.getElementById("username").value = localStorage.getItem("player_name");
    loadLeaderboard();
});

window.start = () => {
    name = document.getElementById("username").value.trim();
    if (!name) return alert("Enter your name!");
    localStorage.setItem("player_name", name);
    document.getElementById("home").style.display = "none";
    showLoadingSequence();
};

window.retry = () => {
    // 💰 INTERSTITIAL AD TRIGGER 💰
    console.log("Ad Triggered on Retry");
    document.getElementById("popup").style.display = "none";
    document.getElementById("game").style.display = "none";
    document.querySelectorAll('.particle').forEach(p => p.remove());
    showLoadingSequence();
};

function showLoadingSequence() {
    document.getElementById("loadingScreen").style.display = "flex";
    setTimeout(() => {
        document.getElementById("loadingScreen").style.display = "none";
        document.getElementById("game").style.display = "block";
        level = 1; moving = true; startTime = Date.now(); timeLeft = 30; speed = 8; cheatCounter = 0;
        resetBtnStyle();
        const angle = Math.random() * Math.PI * 2;
        vx = Math.cos(angle) * speed; vy = Math.sin(angle) * speed;
        tauntEl.innerText = taunts[0]; startTimer(); animate();
    }, 1200);
}

function resetBtnStyle() {
    btn.style.background = ""; btn.style.boxShadow = ""; btn.style.color = ""; btn.innerText = "CLICK ME";
}

function updateSkins() {
    if (level === 4) { btn.style.background = "linear-gradient(135deg, #00ff00, #008000)"; btn.style.boxShadow = "0 0 20px #00ff00"; }
    else if (level === 8) { btn.style.background = "linear-gradient(135deg, #ffd700, #ff8c00)"; btn.style.boxShadow = "0 0 25px #ffd700"; }
    else if (level === 10) { btn.style.background = "linear-gradient(135deg, #ff0000, #800000)"; btn.style.boxShadow = "0 0 35px #ff0000"; btn.style.color = "#fff"; btn.innerText = "SURVIVE!"; }
}

function registerHit(e) {
    if (e) e.preventDefault();
    if (!moving) return;
    createParticles(btn.offsetLeft + btn.offsetWidth/2, btn.offsetTop + btn.offsetHeight/2);
    level++;
    if (level > 10) { endGame(true); return; }
    document.getElementById("message").innerText = `LEVEL ${level}`;
    tauntEl.innerText = taunts[level - 1];
    speed *= 1.25; updateSkins();
    const angle = Math.random() * Math.PI * 2;
    vx = Math.cos(angle) * speed; vy = Math.sin(angle) * speed;
}

btn.addEventListener('touchstart', registerHit); btn.addEventListener('mousedown', registerHit);

function animate() {
    if (!moving) return;
    let x = btn.offsetLeft + vx, y = btn.offsetTop + vy;
    if (x <= 0 || x + btn.offsetWidth >= area.clientWidth) vx *= -1;
    if (y <= 0 || y + btn.offsetHeight >= area.clientHeight) vy *= -1;
    btn.style.left = x + "px"; btn.style.top = y + "px";
    requestAnimationFrame(animate);
}

setInterval(() => { if (moving && level > 1 && Math.random() < 0.3) { const a = Math.random() * Math.PI * 2; vx = Math.cos(a) * speed; vy = Math.sin(a) * speed; }}, 800);

function startTimer() { timerInterval = setInterval(() => { timeLeft--; timerEl.innerText = timeLeft + "s"; if (timeLeft <= 0) endGame(false); }, 1000); }

async function endGame(win, hacked = false) {
    moving = false; clearInterval(timerInterval);
    const time = hacked ? "0.01" : ((Date.now() - startTime) / 1000).toFixed(2);
    const rank = hacked ? "HACKER" : (win ? (time < 15 ? "LEGEND" : "MASTER") : (level >= 8 ? "PRO" : (level >= 4 ? "AMATEUR" : "NOOB")));
    document.getElementById("popup").style.display = "flex";
    if (win) { popupBox.classList.add("winner-box"); createParticles(window.innerWidth/2, window.innerHeight/2, 40, 2); }
    document.getElementById("result").innerHTML = `<span style="color:gray;font-size:0.8rem">RANK:</span><br><span style="color:#00f2ff;font-size:1.5rem">${rank}</span><br><br>${win ? 'PASSED' : 'FAILED AT LVL ' + level} IN ${time}s`;
    shareText = win ? `🏆 I got ${rank} rank in ${time}s!` : `💀 I reached Level ${level} and got ${rank} rank!`;
    await saveScore(name, time, level, rank, win ? "PASSED" : "FAILED");
}

timerEl.onclick = () => { cheatCounter++; if(cheatCounter >= 5) endGame(true, true); };
window.goHome = () => location.reload();
window.openShareMenu = () => document.getElementById("shareModal").style.display = "flex";
window.closeShareMenu = () => document.getElementById("shareModal").style.display = "none";
window.shareTo = (p) => {
    const u = window.location.href, txt = encodeURIComponent(shareText), url = encodeURIComponent(u);
    if (p === 'copy') { navigator.clipboard.writeText(shareText + " " + u); alert("Copied!"); return; }
    let l = p==='whatsapp' ? `https://wa.me/?text=${txt}%20${url}` : p==='telegram' ? `https://t.me/share/url?url=${url}&text=${txt}` : `https://twitter.com/intent/tweet?text=${txt}&url=${url}`;
    window.open(l, '_blank');
};

function createParticles(x, y, c=15, s=1) {
    for (let i = 0; i < c; i++) {
        const p = document.createElement('div'); p.className = 'particle'; document.body.appendChild(p);
        const sz = (Math.random()*8+4)*s; p.style.width = p.style.height = sz+'px'; p.style.left = x+'px'; p.style.top = y+'px';
        const a = Math.random()*Math.PI*2, v = Math.random()*100+50;
        p.animate([{opacity:1, transform:'scale(1)'}, {opacity:0, transform:`translate(${Math.cos(a)*v}px, ${Math.sin(a)*v}px) scale(0)`}], {duration:800}).onfinish = () => p.remove();
    }
}