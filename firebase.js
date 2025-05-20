// ==== MovieClub v2.0: firebase.js ====

// 1. Инициализация Firebase (только один раз во всём проекте)
const firebaseConfig = {
  apiKey: "AIzaSyAxLMSDQSPon7NTd9loVRMLNCseBFSOTDc",
  authDomain: "movieclub-aba80.firebaseapp.com",
  projectId: "movieclub-aba80",
  storageBucket: "movieclub-aba80.appspot.com",
  messagingSenderId: "747897349535",
  appId: "1:747897349535:web:bd29be3880dbcffac749aa",
  measurementId: "G-LQ40KH85NE"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 2. Базовые функции для других файлов (CRUD)
async function dbAddMovie(movieObj) {
  return db.collection('movies').add(movieObj);
}

async function dbDeleteMovie(id) {
  return db.collection('movies').doc(id).delete();
}

async function dbUpdateMovie(id, fields) {
  return db.collection('movies').doc(id).update(fields);
}

async function dbGetMovies() {
  // Получить все фильмы, упорядоченные по дате (новые сверху)
  const res = await db.collection('movies').orderBy('date', 'desc').get();
  const arr = [];
  res.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
  return arr;
}
