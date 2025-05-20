/* =================================================
   MovieClub — main.js v2.4.1
   -------------------------------------------------
   • обработчики UI
   • skeleton-wrapper
   • 🎲-рандом как toast
   ================================================= */

import { dbGetMovies }           from "./firebase.js";
import { renderSkeleton,
         showToast               } from "./ui.js";

/* ---------- skeleton-обёртка -------------------- */
const withSkeleton = fn => (...a) => {
  renderSkeleton();
  setTimeout(() => fn(...a), 120);
};

/* ---------- DOMContentLoaded ------------------- */
document.addEventListener("DOMContentLoaded", () => {

  /* версия */
  document.getElementById("versionLabel").textContent = "v2.4";

  /* фильтры */
  document.querySelectorAll(".filter-btn").forEach(btn =>
    btn.addEventListener("click",
      withSkeleton(() => window.setFilter(btn.dataset.filter)))
  );

  /* вкладки */
  document.querySelectorAll(".tab").forEach(btn =>
    btn.addEventListener("click",
      withSkeleton(() => window.switchTab(btn.dataset.tab)))
  );

  /* поиск */
  movieSearch.addEventListener("input",
    withSkeleton(e => window.setSearch(e.target.value)));

  /* рандомайзер */
  randomBtn.addEventListener("click", randomMovie);

  /* Enter-добавление */
  ["new-movie-title", "new-movie-year"].forEach(id =>
    document.getElementById(id).addEventListener("keydown",
      e => e.key === "Enter" && window.addMovie())
  );
});

/* ---------- 🎲 рандом-фильм --------------------- */
async function randomMovie() {
  const placeholder = document.getElementById("random-out");
  placeholder.classList.remove("hidden");
  placeholder.textContent = "🎲 ищем…";

  let list = [];
  try {
    list = await dbGetMovies();
  } catch (_) {
    placeholder.textContent = "Ошибка сети 😢";
    return;
  }

  const pool = list.filter(m => m.status === "Запланирован");
  if (!pool.length) {
    placeholder.textContent = "Нет фильмов в планах!";
    return;
  }

  const m = pool[Math.floor(Math.random() * pool.length)];

  /* скрываем placeholder и показываем toast */
  placeholder.classList.add("hidden");
  placeholder.textContent = "";

  showToast(`🎬 Ваш выбор: <b>${m.title}${m.year ? ` (${m.year})` : ""}</b>`,
            "success");

  navigator.vibrate?.(15);
}

/* ---------- DOM shortcuts (кэш) --------------- */
const movieSearch = document.getElementById("movie-search");
const randomBtn   = document.getElementById("randomBtn");

