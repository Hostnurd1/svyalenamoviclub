// ===== main.js (MovieClub v2.3) =====
// ES‑module: подключаем в index.html как <script src="main.js" type="module" defer></script>
// Экспортируем функцию addMovie, но одновременно кладём её в window,
// чтобы старый код (logic.js, html‑onclick) продолжал работать.

import firebase from 'firebase/compat/app';
import { dbAddMovie } from './firebase.js';
import { loadAndRenderMovies, showToast, showError } from './ui.js';

// ---------------------------------------------------------------------------
// state guard – защита от двойного клика
// ---------------------------------------------------------------------------
let addLock = false;

export function addMovie() {
  if (addLock) return;           // ещё идёт прошлый запрос
  addLock = true;

  const addBtn  = document.getElementById('add-movie-btn');
  const titleEl = document.getElementById('new-movie-title');
  const yearEl  = document.getElementById('new-movie-year');

  const title = titleEl.value.trim();
  const year  = yearEl.value.trim();

  // валидация ---------------------------------------------------------------
  if (!title || !window.currentUser) {
    showError('Укажи название и выбери пользователя!');
    unlock();
    return;
  }

  // собираем поля -----------------------------------------------------------
  const movieObj = {
    title,
    year: year ? Number(year) : null,

    status: 'Запланирован',
    date: firebase.firestore.FieldValue.serverTimestamp(), // серверное время
    addedBy: window.currentUser,

    scoreSvyat: null,
    scoreAlena: null,
    commentSvyat: '',
    commentAlena: '',
    emojiSvyat: '',
    emojiAlena: '',
    confirmedSvyat: false,
    confirmedAlena: false
  };

  // записываем в Firestore ---------------------------------------------------
  dbAddMovie(movieObj)
    .then(() => {
      titleEl.value = '';
      yearEl.value  = '';
      showToast('Фильм добавлен!');
      loadAndRenderMovies();
    })
    .catch((err) => {
      console.error(err);
      showError('Ошибка при добавлении!');
    })
    .finally(unlock);
}

function unlock() {
  addLock = false;
  const addBtn = document.getElementById('add-movie-btn');
  if (addBtn) addBtn.disabled = false;
}

// -------------------------------------------------------------
// раскрываем глобально (для legacy‑кода) ----------------------
// -------------------------------------------------------------
window.addMovie = addMovie;


