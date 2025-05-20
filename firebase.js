// ===== firebase.js (MovieClub v2.4 – modular) =====

// SDK — модульная версия
import { initializeApp, getApps } from
  "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getFirestore, query, orderBy, collection, addDoc,
  getDocs, doc, deleteDoc, updateDoc, serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyAxLMSDQSPon7NTd9loVRMLNCseBFSOTDc",
  authDomain:        "movieclub-aba80.firebaseapp.com",
  projectId:         "movieclub-aba80",
  storageBucket:     "movieclub-aba80.appspot.com",
  messagingSenderId: "747897349535",
  appId:             "1:747897349535:web:bd29be3880dbcffac749aa",
  measurementId:     "G-LQ40KH85NE"
};

// реюзим, если уже инициализировано
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db  = getFirestore(app);

/* ---------- CRUD helpers (экспортируем) ---------------- */
export async function dbAddMovie(movieObj){
  await addDoc(collection(db, "movies"), { ...movieObj, date: serverTimestamp() });
}

export async function dbDeleteMovie(id){
  await deleteDoc(doc(db, "movies", id));
}

export async function dbUpdateMovie(id, fields){
  await updateDoc(doc(db, "movies", id), fields);
}

export async function dbGetMovies(){
  const snap = await getDocs(
    query(collection(db, "movies"), orderBy("date", "desc"))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

