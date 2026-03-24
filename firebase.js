import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, limit, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "12345",
  appId: "1:12345:web:6789"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function saveScore(name, time, level, rank, status) {
    const id = name.toLowerCase().trim();
    const ref = doc(db, "scores", id);
    const snap = await getDoc(ref);
    let better = true;
    if (snap.exists()) {
        const old = snap.data();
        if (level < old.level || (level === old.level && parseFloat(time) >= old.time)) better = false;
    }
    if (better) await setDoc(ref, { name, time: parseFloat(time), level, rank, status, ts: Date.now() });
}

export async function loadLeaderboard() {
    const container = document.getElementById("scores");
    try {
        const q = query(collection(db, "scores"), orderBy("level", "desc"), limit(20));
        const snap = await getDocs(q);
        let res = []; snap.forEach(d => res.push(d.data()));
        res.sort((a,b) => (b.level === a.level) ? a.time - b.time : b.level - a.level);
        let html = `<table style="width:100%; font-size:0.8rem; text-align:left; border-collapse:collapse;">
            <tr style="color:#00f2ff; border-bottom:1px solid rgba(0,242,255,0.2)"><th>#</th><th>Name</th><th>Rank</th><th>Time</th></tr>`;
        res.slice(0, 5).forEach((d, i) => {
            html += `<tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                <td style="padding:8px 0">${i+1}</td><td>${d.name}</td>
                <td style="color:${d.rank==='LEGEND'?'#ffd700':'#00f2ff'}">${d.rank}</td><td style="text-align:right">${d.time}s</td>
            </tr>`;
        });
        container.innerHTML = html + `</table>`;
    } catch (e) { container.innerText = "Leaderboard Offline"; }
}