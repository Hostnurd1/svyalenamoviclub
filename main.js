/* =================================================
   MovieClub — main.js v2.3
   -------------------------------------------------
   «Клей» интерфейса:
     • вешает обработчики на кнопки / поля
     • запускает skeleton-обёрнутые экшены
     • реализует Рандом-фильм
   Бизнес-логика живёт в logic.js
   ================================================= */

import { dbGetMovies }   from "./firebase.js";
import { showToast }     from "./ui.js";
import { renderSkeleton } from "./ui.js";

/* ---------- 1.  helper: skeleton-обёртка ------------------------------- */
const withSkeleton = fn => (...args) => {
  renderSkeleton();
  setTimeout(() => fn(...args), 120);   // имитация краткой задержки сети
};

/* ---------- 2.  DOMContentLoaded — вешаем события ---------------------- */
document.addEventListener("DOMContentLoaded", () => {
  /* версия внизу */
  document.getElementById("versionLabel").textContent = "v2.3";

  /* фильтры */
  document.querySelectorAll(".filter-btn").forEach(btn =>
    btn.addEventListener("click",
      withSkeleton(() => window.setFilter(btn.dataset.filter)))
  );

  /* вкладки (табы) */
  document.querySelectorAll(".tab").forEach(btn =>
    btn.addEventListener("click",
      withSkeleton(() => window.switchTab(btn.dataset.tab)))
  );

  /* поиск */
  const movieSearch = document.getElementById("movie-search");
  movieSearch.addEventListener("input",
    withSkeleton(e => window.setSearch(e.target.value)));

  /* рандомайзер */
  document.getElementById("randomBtn").addEventListener("click", randomMovie);

  /* enter-ввод в форме добавления */
  ["new-movie-title", "new-movie-year"].forEach(id =>
    document.getElementById(id).addEventListener("keydown", e => {
      if (e.key === "Enter") window.addMovie();
    })
  );
});

/* ---------- 3.  Рандом-фильм ------------------------------------------- */
async function randomMovie() {
  const out = document.getElementById("random-out");
  out.textContent = "🎲 ищем…";

  let movies = [];
  try {
    movies = await dbGetMovies();
  } catch (err) {
    console.error(err);
    out.textContent = "Ошибка сети 😢";
    return;
  }

  movies = movies.filter(m => m.status === "Запланирован");
  if (!movies.length) {
    out.textContent = "Нет фильмов в планах!";
    return;
  }

  const rnd = movies[Math.floor(Math.random() * movies.length)];
  out.innerHTML =
    `🎬 Ваш выбор: <b>${rnd.title}${rnd.year ? ` (${rnd.year})` : ""}</b>`;

  // лёгкая вибрация как отклик
  navigator.vibrate?.(15);
}

