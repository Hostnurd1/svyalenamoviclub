// ====== main.js v2.2, Этап 1: Инициализация ======

// Рендер версии
document.addEventListener('DOMContentLoaded', () => {
  const v = document.querySelector('.version');
  if (v) v.textContent = 'v2.2';
});

// Точка входа: запуск приложения при загрузке страницы
window.onload = function () {
  // Если пользователь не выбран — открываем модалку
  if (!window.currentUser) {
    window.showModal();
  } else {
    // Подсветить выбранного пользователя
    document.querySelectorAll('.avatar-btn').forEach(btn => btn.classList.remove('active'));
    if (window.currentUser === 'Свят') document.getElementById('btn-svyat').classList.add('active');
    if (window.currentUser === 'Алёна') document.getElementById('btn-alena').classList.add('active');
    // Загружаем и рендерим фильмы
    window.loadAndRenderMovies();
  }
};
// ====== main.js v2.2, Этап 2: обработчики интерфейса ======

// Фильтры (чек-кнопки)
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    window.setFilter(btn.dataset.filter);
  });
});

// Переключение вкладок (табы)
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', function() {
    window.switchTab(btn.dataset.tab);
  });
});

// Поиск (input)
const searchInput = document.getElementById('movie-search');
if (searchInput) {
  searchInput.addEventListener('input', function(e) {
    window.setSearch(e.target.value);
  });
}

// Кнопка рандомайзера
window.randomMovie = async function () {
  let movies = await dbGetMovies();
  movies = movies.filter(m => m.status === "Запланирован");
  if (!movies.length) {
    document.getElementById('random-out').innerText = 'Нет фильмов в планах!';
    return;
  }
  const rnd = movies[Math.floor(Math.random() * movies.length)];
  document.getElementById('random-out').innerHTML =
    `🎬 Ваш выбор: <b>${rnd.title}${rnd.year ? ' (' + rnd.year + ')' : ''}</b>`;
};

// Смена пользователя (вызывает showModal)
document.getElementById('btn-switch')?.addEventListener('click', window.showModal);

// Версия для быстрой отладки: по Enter можно добавить фильм
document.getElementById('new-movie-title').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') window.addMovie();
});
document.getElementById('new-movie-year').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') window.addMovie();
});
// ====== main.js v2.2, Этап 3: glue-UX, skeleton, toast ======

// Показывать скелетоны при каждом переходе (фильтры, вкладки, поиск)
function startLoading() {
  renderSkeleton(4);
}

// Показ тоста об ошибке (например, нет сети, не удалось сохранить)
window.showError = function(message) {
  showToast(message, 'error');
};

// При любом изменении вкладки/фильтра — сначала скелетон, потом контент
const reloadWithSkeleton = () => {
  startLoading();
  setTimeout(window.loadAndRenderMovies, 220); // имитация ожидания/сети
};
window.setFilter = function(filter) {
  window.currentFilter = filter;
  renderFilters(filter);
  reloadWithSkeleton();
};
window.switchTab = function(tab) {
  window.currentTab = tab;
  document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.tab[data-tab="${tab}"]`).classList.add('active');
  reloadWithSkeleton();
};
window.setSearch = function(val) {
  window.currentSearch = val.trim().toLowerCase();
  reloadWithSkeleton();
};

// Защита от двойного клика (спам) на добавление фильма
let addLock = false;
window.addMovie = function () {
  if (addLock) return;
  addLock = true;
  const title = document.getElementById('new-movie-title').value.trim();
  const year = document.getElementById('new-movie-year').value.trim();
  if (!title || !window.currentUser) {
    addLock = false;
    showError("Укажи название и выбери пользователя!");
    return;
  }
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
  dbAddMovie(movieObj).then(() => {
    addLock = false;
    window.loadAndRenderMovies();
    document.getElementById('new-movie-title').value = '';
    document.getElementById('new-movie-year').value = '';
    showToast('Фильм добавлен!');
  }).catch(() => {
    addLock = false;
    showError('Ошибка при добавлении!');
  });
};


