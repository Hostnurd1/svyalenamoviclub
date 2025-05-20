// ===== firebase.js (MovieClub v2.3) =====

// 1. SDK init (compat-layer, чтобы не ломать старый код)
import firebase from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app-compat.js";
import "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore-compat.js";

const firebaseConfig = {
  apiKey: "AIzaSyAxLMSDQSPon7NTd9loVRMLNCseBFSOTDc",
  authDomain: "movieclub-aba80.firebaseapp.com",
  projectId: "movieclub-aba80",
  storageBucket: "movieclub-aba80.appspot.com",
  messagingSenderId: "747897349535",
  appId: "1:747897349535:web:bd29be3880dbcffac749aa",
  measurementId: "G-LQ40KH85NE"
};

const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
const db  = app.firestore();
const { FieldValue } = firebase.firestore;

// 2. CRUD helpers (экспортируем явно)
export async function dbAddMovie(movieObj){
  // date — серверный timestamp, чтобы не падать на sort
  return db.collection("movies")
           .add({ ...movieObj, date: FieldValue.serverTimestamp() });
}
export async function dbDeleteMovie(id){
  return db.collection("movies").doc(id).delete();
}
export async function dbUpdateMovie(id, fields){
  return db.collection("movies").doc(id).update(fields);
}
export async function dbGetMovies(){
  const snap = await db.collection("movies").orderBy("date","desc").get();
  return snap.docs.map(d => ({ id:d.id, ...d.data() }));
}

