// ====== firebase.js (MovieClub v2.2) ======

// 1. Инициализация Firebase
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

// 2. CRUD-функции для фильмов

// Добавить фильм
async function dbAddMovie(movieObj) {
  return db.collection('movies').add(movieObj);
}

// Удалить фильм
async function dbDeleteMovie(id) {
  return db.collection('movies').doc(id).delete();
}

// Обновить фильм
async function dbUpdateMovie(id, fields) {
  return db.collection('movies').doc(id).update(fields);
}

// Получить список фильмов
async function dbGetMovies() {
  const res = await db.collection('movies').orderBy('date', 'desc').get();
  const arr = [];
  res.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
  return arr;
}
