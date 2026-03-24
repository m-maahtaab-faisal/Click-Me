import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, limit, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBrS9idyapTKBeuYpipT3u-sgGnm1896b0",
  authDomain: "impossible-button.firebaseapp.com",
  projectId: "impossible-button",
  storageBucket: "impossible-button.firebasestorage.app",
  messagingSenderId: "600877832745",
  appId: "1:600877832745:web:cbe68f4a3bfe719666da38",
  measurementId: "G-M194WW2SSK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function saveScore(playerName, time, levelReached, rank, status) {
  try {
    const userId = playerName.toLowerCase().trim();
    const userRef = doc(db, "scores", userId);
    const docSnap = await getDoc(userRef);

    const newLevel = parseInt(levelReached);
    const newTime = parseFloat(time);
    let isBetterScore = true;

    if (docSnap.exists()) {
      const oldData = docSnap.data();
      if (newLevel < oldData.level || (newLevel === oldData.level && newTime >= oldData.time)) {
        isBetterScore = false; 
      }
    }

    if (isBetterScore) {
      await setDoc(userRef, {
        name: playerName,
        time: newTime,
        level: newLevel,
        rank: rank,
        status: status,
        timestamp: Date.now()
      });
    }
  } catch (e) { 
    console.error("Firebase Save Error: ", e); 
  }
}

export async function loadLeaderboard() {
  const scoresContainer = document.getElementById("scores");
  try {
    // ⚠️ THIS LINE REQUIRES THE INDEX LINK IN YOUR CONSOLE ⚠️
    const q = query(collection(db, "scores"), orderBy("level", "desc"), orderBy("time", "asc"), limit(25));
    const snap = await getDocs(q);

    let results = [];
    snap.forEach(document => results.push(document.data()));

    const top5 = results.slice(0, 5);

    if (top5.length === 0) {
        scoresContainer.innerHTML = "<div style='color: gray; margin-top: 20px;'>Be the first on the leaderboard!</div>";
        return;
    }

    let html = `<table style='width:100%; text-align: left; border-collapse: collapse; font-size: 0.85rem;'>
        <tr style='color: #00f2ff; border-bottom: 1px solid rgba(0, 242, 255, 0.2);'>
            <th style='padding:5px'>#</th><th style='padding:5px'>Pilot</th><th style='padding:5px'>Rank</th><th style='text-align: right; padding:5px'>Time</th>
        </tr>`;
    
    top5.forEach((data, index) => {
      let rankColor = "#e0e0e0";
      if (data.rank === "LEGEND") rankColor = "#FFD700"; 
      if (data.rank === "MASTER") rankColor = "#ff00ff"; 
      if (data.rank === "PRO") rankColor = "#00f2ff";    
      if (data.rank === "HACKER") rankColor = "#00ff00";

      html += `<tr style="font-weight: 500; border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 8px 5px; color: gray;">${index + 1}</td>
        <td style="padding: 8px 5px;">${data.name}</td>
        <td style="padding: 8px 5px; color: ${rankColor}; font-weight: 800;">${data.rank || "---"}</td>
        <td style="text-align: right; padding: 8px 5px;">${data.time}s</td>
      </tr>`;
    });
    scoresContainer.innerHTML = html + "</table>";
  } catch (error) {
    console.error("Firebase Load Error:", error);
    scoresContainer.innerHTML = "<div style='color: red; margin-top: 20px;'>Leaderboard failed to connect. Check Firebase Rules!</div>";
  }
}