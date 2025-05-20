/* =================================================
   MovieClub — logic.js v2.3
   =================================================
   ▸ хранит глобальное состояние (tab / filter / search)
   ▸ обёртки над Firestore-CRUD
   ▸ главная функция loadAndRenderMovies()
   ▸ выбор пользователя, переключение фильтров и вкладок
   ------------------------------------------------- */

import {
  dbAddMovie,
  dbDeleteMovie,
  dbUpdateMovie,
  dbGetMovies
} from "./firebase.js";

import {
  renderSkeleton,
  renderMovieList,
  renderFilters,
  showToast
} from "./ui.js";

import { renderStats } from "./stats.js";

/* ---------- 1. GLOBAL STATE --------------------------------------------- */
window.currentTab    = "planned";                           // planned | watched | stats
window.currentUser   = localStorage.getItem("mc_user") || "";
window.currentFilter = "all";                               // all | 8+ | withComment | confirmedOnly
window.currentSearch = "";

/* ---------- 2. HELPERS --------------------------------------------------- */
const fieldByUser = (base, user) => (user === "Свят" ? `${base}Svyat` : `${base}Alena`);

/* ---------- 3. CRUD-WRAPPERS (UI → Firestore) --------------------------- */
window.addMovie = async () => {
  const title = document.getElementById("new-movie-title").value.trim();
  const year  = document.getElementById("new-movie-year").value.trim();

  if (!title || !window.currentUser) {
    showToast("Укажи название и выбери пользователя!", "error");
    return;
  }

  const movieObj = {
    title,
    year: year ? Number(year) : null,
    status: "Запланирован",
    addedBy: window.currentUser,
    scoreSvyat: null,   scoreAlena: null,
    commentSvyat: "",   commentAlena: "",
    emojiSvyat: "",     emojiAlena: "",
    confirmedSvyat: false, confirmedAlena: false
  };

  try {
    await dbAddMovie(movieObj);
    document.getElementById("new-movie-title").value = "";
    document.getElementById("new-movie-year").value  = "";
    showToast("Фильм добавлен!");
    loadAndRenderMovies();
  } catch (e) {
    console.error(e);
    showToast("Ошибка сохранения 😢", "error");
  }
};

window.deleteMovieLogic   = async id        => { await dbDeleteMovie(id);        loadAndRenderMovies(); };
window.confirmReviewLogic = async (id, u)   => { await dbUpdateMovie(id, { [fieldByUser("confirmed", u)]: true }); loadAndRenderMovies(); };
window.setCommentLogic    = async (id, u,v) => { await dbUpdateMovie(id, { [fieldByUser("comment",   u)]: v    }); loadAndRenderMovies(); };
window.setScoreStar       = async (id, u,v) => { await dbUpdateMovie(id, { [fieldByUser("score",     u)]: v    }); loadAndRenderMovies(); navigator.vibrate?.(20); };

/* ---------- 4. MAIN LOADER ---------------------------------------------- */
window.loadAndRenderMovies = async () => {
  renderSkeleton();

  let movies = [];
  try {
    movies = await dbGetMovies();
  } catch (e) {
    console.error(e);
    showToast("Ошибка загрузки 😢", "error");
    document.getElementById("movie-list").innerHTML =
      "<li class='movie' style='text-align:center;color:#f66;padding:30px 0'>Не удалось получить данные</li>";
    return;
  }

  /* вкладки */
  if (currentTab === "planned") movies = movies.filter(m => m.status === "Запланирован");
  if (currentTab === "watched") movies = movies.filter(m => m.status === "Просмотрен");

  /* поиск */
  if (currentSearch) {
    const s = currentSearch;
    movies = movies.filter(m => (m.title || "").toLowerCase().includes(s));
  }

  /* фильтры */
  if (currentFilter === "8+")              movies = movies.filter(m => (m.scoreSvyat >= 8) || (m.scoreAlena >= 8));
  if (currentFilter === "withComment")     movies = movies.filter(m => (m.commentSvyat?.length) || (m.commentAlena?.length));
  if (currentFilter === "confirmedOnly")   movies = movies.filter(m => m.confirmedSvyat && m.confirmedAlena);

  renderMovieList(movies, currentUser);
  if (currentTab === "stats") renderStats(movies);
};

/* ---------- 5. UI-SWITCHES ---------------------------------------------- */
window.switchTab = tab => {
  if (currentTab === tab) return;
  currentTab = tab;
  document.querySelectorAll(".tab").forEach(btn =>
    btn.classList.toggle("active", btn.dataset.tab === tab));
  loadAndRenderMovies();
};

window.setFilter = f => {
  currentFilter = f;
  renderFilters(f);
  loadAndRenderMovies();
};

window.setSearch = val => {
  currentSearch = val.trim().toLowerCase();
  loadAndRenderMovies();
};

window.chooseUser = (user, fromModal = false) => {
  currentUser = user;
  localStorage.setItem("mc_user", user);

  document.querySelectorAll(".avatar-btn").forEach(btn =>
    btn.classList.toggle("active",
      btn.querySelector(".avatar-name").textContent === user));

  if (fromModal) {
    document.getElementById("user-modal").style.display = "none";
    const c = document.querySelector(".container");
    c.style.filter = ""; c.style.pointerEvents = "auto";
  }

  loadAndRenderMovies();
};

/* ---------- 6. ON-BOOT --------------------------------------------------- */
window.addEventListener("load", () => {
  if (!currentUser) {
    document.getElementById("user-modal").style.display = "flex";
    const c = document.querySelector(".container");
    c.style.filter = "blur(4px)";
    c.style.pointerEvents = "none";
  } else {
    loadAndRenderMovies();
  }
});

