// ==== MovieClub v2.0: logic.js ====

// Добавление фильма
async function addMovieLogic(title, year, user) {
  const movieObj = {
    title: title,
    year: year ? Number(year) : null,
    status: 'Запланирован',
    date: new Date().toISOString(),
    addedBy: user,
    scoreSvyat: null,
    scoreAlena: null,
    commentSvyat: '',
    commentAlena: '',
    emojiSvyat: '',
    emojiAlena: '',
    confirmedSvyat: false,
    confirmedAlena: false
  };
  await dbAddMovie(movieObj);
  loadAndRenderMovies();
}

// Удаление фильма
async function deleteMovieLogic(id) {
  await dbDeleteMovie(id);
  loadAndRenderMovies();
}

// Сохранение оценок, комментариев, эмодзи
async function setScoreLogic(id, user, value) {
  const field = user === 'Свят' ? 'scoreSvyat' : 'scoreAlena';
  await dbUpdateMovie(id, { [field]: Number(value) });
  loadAndRenderMovies();
}
async function setCommentLogic(id, user, value) {
  const field = user === 'Свят' ? 'commentSvyat' : 'commentAlena';
  await dbUpdateMovie(id, { [field]: value });
  loadAndRenderMovies();
}
async function setEmojiLogic(id, user, value) {
  const field = user === 'Свят' ? 'emojiSvyat' : 'emojiAlena';
  await dbUpdateMovie(id, { [field]: value });
  loadAndRenderMovies();
}

// Подтверждение отзыва
async function confirmReviewLogic(id, user) {
  const field = user === 'Свят' ? 'confirmedSvyat' : 'confirmedAlena';
  await dbUpdateMovie(id, { [field]: true });
  loadAndRenderMovies();
}

// Главный загрузчик фильмов + фильтрация, поиск
async function loadAndRenderMovies() {
  let movies = await dbGetMovies();

  // --- вкладки: planned, watched, stats ---
  if (currentTab === 'planned') {
    movies = movies.filter(m => m.status === 'Запланирован');
  } else if (currentTab === 'watched') {
    movies = movies.filter(m => m.status === 'Просмотрен');
  }

  // --- поиск по названию ---
  if (currentSearch) {
    movies = movies.filter(m => m.title && m.title.toLowerCase().includes(currentSearch));
  }

  // --- фильтры ---
  if (currentFilter === '8+') {
    movies = movies.filter(m =>
      (m.scoreSvyat >= 8 || m.scoreAlena >= 8)
    );
  } else if (currentFilter === 'withComment') {
    movies = movies.filter(m =>
      (m.commentSvyat && m.commentSvyat.length > 0) ||
      (m.commentAlena && m.commentAlena.length > 0)
    );
  } else if (currentFilter === 'confirmedOnly') {
    movies = movies.filter(m => m.confirmedSvyat && m.confirmedAlena);
  }

  renderMovieList(movies, currentUser);

  // Если вкладка статистика — собрать и вывести stats
  if (currentTab === 'stats') {
    renderStats(calcStats(movies));
  }
}
// ==== Смена статуса фильма ====
async function toggleStatusLogic(id, currentStatus) {
  const newStatus = currentStatus === 'Запланирован' ? 'Просмотрен' : 'Запланирован';
  await dbUpdateMovie(id, { status: newStatus });
  loadAndRenderMovies();
}

// ==== Привязка UI-функций к логике ====
window.setScoreUI = setScoreLogic;
window.setCommentUI = setCommentLogic;
window.setEmojiUI = setEmojiLogic;
window.confirmReviewUI = confirmReviewLogic;
window.deleteMovieUI = deleteMovieLogic;

// ==== Расчет статистики для вкладки “Статистика” ====
function calcStats(movies) {
  if (!movies.length) return {
    total: 0, planned: 0, watched: 0, avgSvyat: "-", avgAlena: "-", mostCommon: "-"
  };

  let planned = 0, watched = 0, sumS = 0, cntS = 0, sumA = 0, cntA = 0;
  let scoresMatch = {};
  movies.forEach(m => {
    if (m.status === "Запланирован") planned++;
    if (m.status === "Просмотрен") watched++;
    if (m.scoreSvyat) { sumS += m.scoreSvyat; cntS++; }
    if (m.scoreAlena) { sumA += m.scoreAlena; cntA++; }
    // для совпадений оценок
    if (m.scoreSvyat && m.scoreAlena && m.scoreSvyat === m.scoreAlena) {
      scoresMatch[m.scoreSvyat] = (scoresMatch[m.scoreSvyat] || 0) + 1;
    }
  });
  let mostCommon = "-";
  let maxMatch = 0;
  for (let k in scoresMatch) {
    if (scoresMatch[k] > maxMatch) {
      maxMatch = scoresMatch[k];
      mostCommon = k;
    }
  }
  return {
    total: movies.length,
    planned, watched,
    avgSvyat: cntS ? (sumS / cntS).toFixed(2) : "-",
    avgAlena: cntA ? (sumA / cntA).toFixed(2) : "-",
    mostCommon
  };
}
