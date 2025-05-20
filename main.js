// ==== MovieClub v2.0: main.js ====

// Глобальные переменные (текущий пользователь, вкладка и фильтр)
window.currentTab = 'planned';
window.currentUser = localStorage.getItem('mc_user') || '';
window.currentFilter = 'all';
window.currentSearch = '';

// Привязка UI-функций к logic
window.addMovie = function () {
  const title = document.getElementById('new-movie-title').value.trim();
  const year = document.getElementById('new-movie-year').value.trim();
  if (!title || !window.currentUser) return;
  addMovieLogic(title, year, window.currentUser);
};

window.switchTab = function(tab) {
  window.currentTab = tab;
  renderTabs(tab);
  loadAndRenderMovies();
};

window.setFilter = function(filter) {
  window.currentFilter = filter;
  renderFilters(filter);
  loadAndRenderMovies();
};

window.setSearch = function(val) {
  window.currentSearch = val.trim().toLowerCase();
  loadAndRenderMovies();
};

// Входной рендер приложения
window.onload = function () {
  renderTabs(window.currentTab);
  renderFilters(window.currentFilter);
  renderVersion('v2.0');
  loadAndRenderMovies();
};

// Подключаем смену пользователя через UI
window.chooseUser = function(user, fromModal) {
  window.currentUser = user;
  localStorage.setItem('mc_user', user);
  highlightUserBtn();
  if (fromModal) {
    document.getElementById('user-modal').style.display = 'none';
    document.querySelector('.container').style.filter = '';
    document.querySelector('.container').style.pointerEvents = '';
  }
  loadAndRenderMovies();
};

window.showModal = function() {
  document.getElementById('user-modal').style.display = 'flex';
  document.querySelector('.container').style.filter = 'blur(4px)';
  document.querySelector('.container').style.pointerEvents = 'none';
};

document.getElementById('btn-svyat').addEventListener('click', () => window.chooseUser('Свят'));
document.getElementById('btn-alena').addEventListener('click', () => window.chooseUser('Алёна'));
document.getElementById('btn-switch').addEventListener('click', window.showModal);

// Автоматический показ модалки при отсутствии выбранного пользователя
if (!window.currentUser) {
  window.showModal();
}

// Быстрое добавление фильма по Enter
document.getElementById('new-movie-title').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') window.addMovie();
});
document.getElementById('new-movie-year').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') window.addMovie();
});

// Связь поиска с logic
document.getElementById('movie-search').addEventListener('input', function(e) {
  window.setSearch(e.target.value);
});

