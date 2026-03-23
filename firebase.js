import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } 
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const config = {
  apiKey: "AIzaSyBrS9idyapTKBeuYpipT3u-sgGnm1896b0",
  authDomain: "impossible-button.firebaseapp.com",
  projectId: "impossible-button"
};

const app = initializeApp(config);
const db = getFirestore(app);

// save score
export async function saveScore(name,time){
  await addDoc(collection(db,"scores"),{
    name,
    time
  });
}

// load leaderboard
export async function loadLeaderboard(){
  const q = query(collection(db,"scores"), orderBy("time"), limit(5));
  const snap = await getDocs(q);

  let html="";
  snap.forEach(d=>{
    let data = d.data();
    html += `${data.name} - ${data.time}s<br>`;
  });

  document.getElementById("scores").innerHTML = html;
}