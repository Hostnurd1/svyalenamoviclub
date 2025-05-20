/* =================================================
   MovieClub — logic.js v2.4
   ================================================= */
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

/* ---------- 1. GLOBAL STATE ------------------------------------------- */
window.currentTab    = "planned";
window.currentUser   = localStorage.getItem("mc_user") || "";
window.currentFilter = "all";
window.currentSearch = "";

const chip = document.getElementById("current-user-chip");

/* ---------- 2. HELPERS ------------------------------------------------- */
const fieldByUser = (base, user) =>
  user === "Свят" ? `${base}Svyat` : `${base}Alena`;

/* ---------- 3. CRUD wrappers ------------------------------------------ */
window.addMovie = async () => {
  if (window.__addLock) return;               // анти-спам
  window.__addLock = true;

  const title = newMovieTitle.value.trim();
  const year  = newMovieYear.value.trim();
  if (!title || !currentUser) {
    showToast("Укажи название и выбери пользователя!", "error");
    window.__addLock = false;
    return;
  }

  const obj = {
    title,
    year: year ? +year : null,
    status: "Запланирован",
    addedBy: currentUser,
    scoreSvyat: null, scoreAlena: null,
    commentSvyat: "", commentAlena: "",
    emojiSvyat: "",   emojiAlena: "",
    confirmedSvyat: false, confirmedAlena: false
  };

  try {
    await dbAddMovie(obj);
    newMovieTitle.value = ""; newMovieYear.value = "";
    showToast("Фильм добавлен!");
    loadAndRenderMovies();
  } catch (e) {
    console.error(e);
    showToast("Ошибка сохранения 😢", "error");
  } finally {
    window.__addLock = false;
  }
};

window.deleteMovieLogic   = async id        => { await dbDeleteMovie(id); loadAndRenderMovies(); };
window.confirmReviewLogic = async (id,u)    => { await dbUpdateMovie(id,{[fieldByUser("confirmed",u)]:true}); loadAndRenderMovies(); };
window.setCommentLogic    = async (id,u,v)  => { await dbUpdateMovie(id,{[fieldByUser("comment",u)]:v});     loadAndRenderMovies(); };
window.setScoreStar       = async (id,u,v)  => { await dbUpdateMovie(id,{[fieldByUser("score",u)]:v});       loadAndRenderMovies(); navigator.vibrate?.(15); };

/* ---------- 4. MAIN LOADER -------------------------------------------- */
window.loadAndRenderMovies = async () => {
  renderSkeleton();

  let movies = [];
  try {
    movies = await dbGetMovies();
  } catch (e) {
    console.error(e);
    showToast("Ошибка загрузки 😢", "error");
    movieList.innerHTML = "<li class='movie' style='text-align:center;color:#f66;padding:30px 0'>Не удалось получить данные</li>";
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
  if (currentFilter === "8+")            movies = movies.filter(m => (m.scoreSvyat >= 8) || (m.scoreAlena >= 8));
  if (currentFilter === "withComment")   movies = movies.filter(m => (m.commentSvyat?.length) || (m.commentAlena?.length));
  if (currentFilter === "confirmedOnly") movies = movies.filter(m => m.confirmedSvyat && m.confirmedAlena);

  renderMovieList(movies, currentUser);
  if (currentTab === "stats") renderStats(movies);
};

/* ---------- 5. UI SWITCHES -------------------------------------------- */
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

  // чип-метка
  chip.textContent = `Вы: ${user}`;
  chip.classList.remove("hidden");

  if (fromModal) {
    userModal.style.display = "none";
    container.style.filter = "";
    container.style.pointerEvents = "auto";
  }
  loadAndRenderMovies();
};

/* ---------- 6. ON-BOOT ------------------------------------------------- */
window.addEventListener("load", () => {
  if (!currentUser) {
    userModal.style.display = "flex";
    container.style.filter = "blur(4px)";
    container.style.pointerEvents = "none";
  } else {
    // подсветим аватар и чип
    document.querySelectorAll(".avatar-btn").forEach(btn =>
      btn.classList.toggle("active",
        btn.querySelector(".avatar-name").textContent === currentUser));
    chip.textContent = `Вы: ${currentUser}`;
    chip.classList.remove("hidden");

    loadAndRenderMovies();
  }
});


