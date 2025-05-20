// ====== logic.js v2.2 ======

/* Глобальные состояния */
window.currentTab = 'planned';
window.currentUser = localStorage.getItem('mc_user') || '';
window.currentFilter = 'all';
window.currentSearch = '';

/* Добавление фильма */
window.addMovie = function () {
  const title = document.getElementById('new-movie-title').value.trim();
  const year = document.getElementById('new-movie-year').value.trim();
  if (!title || !window.currentUser) return;
  const movieObj = {
    title: title,
    year: year ? Number(year) : null,
    status: 'Запланирован',
    date: new Date().toISOString(),
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
  dbAddMovie(movieObj);
  document.getElementById('new-movie-title').value = '';
  document.getElementById('new-movie-year').value = '';
  loadAndRenderMovies();
};

/* Удаление фильма */
window.deleteMovieLogic = async function(id) {
  await dbDeleteMovie(id);
  loadAndRenderMovies();
};

/* Подтверждение отзыва */
window.confirmReviewLogic = async function(id, user) {
  const field = user === 'Свят' ? 'confirmedSvyat' : 'confirmedAlena';
  await dbUpdateMovie(id, { [field]: true });
  loadAndRenderMovies();
};

/* Сохранение комментария */
window.setCommentLogic = async function(id, user, value) {
  const field = user === 'Свят' ? 'commentSvyat' : 'commentAlena';
  await dbUpdateMovie(id, { [field]: value });
  loadAndRenderMovies();
};

/* Сохранение оценки (звезда) */
window.setScoreStar = async function (id, user, value) {
  const field = user === 'Свят' ? 'scoreSvyat' : 'scoreAlena';
  await dbUpdateMovie(id, { [field]: value });
  loadAndRenderMovies();
  // Вибрация при успехе
  if (window.navigator.vibrate) window.navigator.vibrate(20);
};

/* Главный рендер: фильтрация, поиск, табы */
window.loadAndRenderMovies = async function() {
  renderSkeleton(); // Показываем скелетон, пока грузится
  let movies = await dbGetMovies();

  // Фильтрация по вкладкам
  if (window.currentTab === 'planned') {
    movies = movies.filter(m => m.status === 'Запланирован');
  } else if (window.currentTab === 'watched') {
    movies = movies.filter(m => m.status === 'Просмотрен');
  }

  // Поиск
  if (window.currentSearch) {
    const s = window.currentSearch.trim().toLowerCase();
    movies = movies.filter(m => (m.title || '').toLowerCase().includes(s));
  }

  // Фильтры
  if (window.currentFilter === '8+') {
    movies = movies.filter(m => (m.scoreSvyat >= 8 || m.scoreAlena >= 8));
  } else if (window.currentFilter === 'withComment') {
    movies = movies.filter(m =>
      (m.commentSvyat && m.commentSvyat.length > 0) ||
      (m.commentAlena && m.commentAlena.length > 0)
    );
  } else if (window.currentFilter === 'confirmedOnly') {
    movies = movies.filter(m => m.confirmedSvyat && m.confirmedAlena);
  }

  // Рендер фильмов
  renderMovieList(movies, window.currentUser);
};

/* Переключение вкладки */
window.switchTab = function(tab) {
  window.currentTab = tab;
  document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.tab[data-tab="${tab}"]`).classList.add('active');
  loadAndRenderMovies();
};

/* Фильтры (только один активен) */
window.setFilter = function(filter) {
  window.currentFilter = filter;
  renderFilters(filter);
  loadAndRenderMovies();
};

/* Поиск */
window.setSearch = function(val) {
  window.currentSearch = val.trim().toLowerCase();
  loadAndRenderMovies();
};

/* Выбор пользователя */
window.chooseUser = function(user, fromModal) {
  window.currentUser = user;
  localStorage.setItem('mc_user', user);
  document.querySelectorAll('.avatar-btn').forEach(btn => btn.classList.remove('active'));
  if (user === 'Свят') document.getElementById('btn-svyat').classList.add('active');
  if (user === 'Алёна') document.getElementById('btn-alena').classList.add('active');
  if (fromModal) {
    document.getElementById('user-modal').style.display = 'none';
    document.querySelector('.container').style.filter = '';
    document.querySelector('.container').style.pointerEvents = '';
  }
  loadAndRenderMovies();
};

/* Модалка выбора пользователя */
window.showModal = function() {
  document.getElementById('user-modal').style.display = 'flex';
  document.querySelector('.container').style.filter = 'blur(4px)';
  document.querySelector('.container').style.pointerEvents = 'none';
};

/* Быстрый поиск по Enter */
document.getElementById('movie-search').addEventListener('input', function(e) {
  window.setSearch(e.target.value);
});

/* Добавить по Enter */
document.getElementById('new-movie-title').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') window.addMovie();
});
document.getElementById('new-movie-year').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') window.addMovie();
});

/* Переключение пользователя */
document.getElementById('btn-svyat').addEventListener('click', () => window.chooseUser('Свят'));
document.getElementById('btn-alena').addEventListener('click', () => window.chooseUser('Алёна'));

/* Модалка при отсутствии пользователя */
window.onload = function () {
  if (!window.currentUser) window.showModal();
  else loadAndRenderMovies();
};

