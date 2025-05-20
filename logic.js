// ====== logic.js v2.3 (patched) ======

// --- Global state ----------------------------------------------------------
window.currentTab     = 'planned';
window.currentUser    = localStorage.getItem('mc_user') || '';
window.currentFilter  = 'all';
window.currentSearch  = '';

// --- Helpers ---------------------------------------------------------------
const isSvyat      = user => user === 'Свят';
const fieldByUser  = (base, user) => isSvyat(user) ? `${base}Svyat` : `${base}Alena`;

// --- Movie CRUD actions ----------------------------------------------------
window.addMovie = async function () {
  const title = document.getElementById('new-movie-title').value.trim();
  const year  = document.getElementById('new-movie-year').value.trim();

  if (!title || !window.currentUser) return;

  const movieObj = {
    title,
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

  try {
    await dbAddMovie(movieObj);
    document.getElementById('new-movie-title').value = '';
    document.getElementById('new-movie-year').value  = '';
    loadAndRenderMovies();
  } catch (e) {
    console.error('dbAddMovie failed', e);
    showToast('Ошибка сохранения 😢');
  }
};

window.deleteMovieLogic = async function (id) {
  await dbDeleteMovie(id);
  loadAndRenderMovies();
};

window.confirmReviewLogic = async function (id, user) {
  await dbUpdateMovie(id, { [fieldByUser('confirmed', user)]: true });
  loadAndRenderMovies();
};

window.setCommentLogic = async function (id, user, value) {
  await dbUpdateMovie(id, { [fieldByUser('comment', user)]: value });
  loadAndRenderMovies();
};

window.setScoreStar = async function (id, user, value) {
  await dbUpdateMovie(id, { [fieldByUser('score', user)]: value });
  loadAndRenderMovies();
  navigator.vibrate?.(20);
};

// --- View / state switches --------------------------------------------------
window.switchTab = function (tab) {
  if (window.currentTab === tab) return;
  window.currentTab = tab;
  document.querySelectorAll('.tab').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.tab === tab)
  );
  loadAndRenderMovies();
};

window.setFilter = function (filter) {
  window.currentFilter = filter;
  renderFilters(filter);
  loadAndRenderMovies();
};

window.setSearch = function (val) {
  window.currentSearch = val.trim().toLowerCase();
  loadAndRenderMovies();
};

window.chooseUser = function (user, fromModal = false) {
  window.currentUser = user;
  localStorage.setItem('mc_user', user);

  document.querySelectorAll('.avatar-btn').forEach(btn =>
    btn.classList.toggle('active',
      btn.querySelector('.avatar-name').textContent === user)
  );

  if (fromModal) {
    document.getElementById('user-modal').style.display = 'none';
    document.querySelector('.container').style.filter        = '';
    document.querySelector('.container').style.pointerEvents = '';
  }

  loadAndRenderMovies();
};

window.showModal = function () {
  document.getElementById('user-modal').style.display = 'flex';
  document.querySelector('.container').style.filter        = 'blur(4px)';
  document.querySelector('.container').style.pointerEvents = 'none';
};

// --- Search & add quick handlers -------------------------------------------
document.getElementById('movie-search')
  .addEventListener('input', e => setSearch(e.target.value));

['new-movie-title', 'new-movie-year'].forEach(id =>
  document.getElementById(id).addEventListener('keydown', e => {
    if (e.key === 'Enter') addMovie();
  })
);

['btn-svyat', 'btn-alena'].forEach(id =>
  document.getElementById(id).addEventListener('click', () =>
    chooseUser(id === 'btn-svyat' ? 'Свят' : 'Алёна'))
);

// --- Startup ---------------------------------------------------------------
window.addEventListener('load', () => {
  if (!window.currentUser) showModal();
  else loadAndRenderMovies();
});
