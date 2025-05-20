/* =================================================
   MovieClub — main.js v2.4
   -------------------------------------------------
   «Клей» интерфейса:
     • вешает обработчики на фильтры, табы, поиск
     • оборачивает экшены в короткий skeleton-шимер
     • реализует рандом-фильм как toast
   ================================================= */

import { dbGetMovies }  from "./firebase.js";
import { renderSkeleton, showToast } from "./ui.js";

/* ---------- 1. helper: skeleton-обёртка ------------------------------ */
const withSkeleton = fn => (...args) => {
  renderSkeleton();
  setTimeout(() => fn(...args), 120);   // имитация лагов сети
};

/* ---------- 2. DOMContentLoaded — события --------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  /* версия */
  document.getElementById("versionLabel").textContent = "v2.4";

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
  document
    .getElementById("movie-search")
    .addEventListener("input",
      withSkeleton(e => window.setSearch(e.target.value)));

  /* рандомайзер */
  document
    .getElementById("randomBtn")
    .addEventListener("click", randomMovie);

  /* Enter-добавление */
  ["new-movie-title", "new-movie-year"].forEach(id =>
    document.getElementById(id).addEventListener("keydown", e => {
      if (e.key === "Enter") window.addMovie();
    })
  );
});

/* ---------- 3. 🎲 Случайный фильм ------------------------------------ */
async function randomMovie() {
  const out = document.getElementById("random-out");
  out.textContent = "🎲 ищем…";

  let movies = [];
  try {
    movies = await dbGetMovies();
  } catch (_) {
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

  /* превращаем плашку в toast */
  out.classList.add("toast", "toast-success");
  setTimeout(() => out.remove(), 1700);

  /* лёгкая вибрация */
  navigator.vibrate?.(15);
}


