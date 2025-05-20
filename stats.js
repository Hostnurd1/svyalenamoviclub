// ==== MovieClub v2.0: stats.js ====

// Подсчет топ-фильмов по оценке (за всё время или только за последние N)
function getTopMovies(movies, limit = 5) {
  const rated = movies.filter(m => m.scoreSvyat && m.scoreAlena);
  rated.sort((a, b) => (
    ((b.scoreSvyat + b.scoreAlena)/2) - ((a.scoreSvyat + a.scoreAlena)/2)
  ));
  return rated.slice(0, limit);
}

// Сколько раз совпали оценки (и на каких фильмах)
function getScoreMatches(movies) {
  return movies.filter(m => m.scoreSvyat && m.scoreAlena && m.scoreSvyat === m.scoreAlena);
}

// Тренд: в какие месяцы/года чаще всего смотрели фильмы
function getWatchTrends(movies) {
  const byMonth = {};
  movies.forEach(m => {
    if (m.status === "Просмотрен" && m.date) {
      const month = m.date.slice(0, 7); // 'YYYY-MM'
      byMonth[month] = (byMonth[month] || 0) + 1;
    }
  });
  return byMonth;
}

// Визуализация топов и трендов (упрощенный вариант)
function renderAdvancedStats(movies) {
  const stats = document.getElementById('stats-block');
  if (!stats) return;
  // Топ фильмов
  const top = getTopMovies(movies, 5);
  let html = `<h3>Топ-5 фильмов по оценке</h3><ol>`;
  top.forEach(m => {
    html += `<li>${m.title} (${m.year || ""}) — <b>${((m.scoreSvyat + m.scoreAlena)/2).toFixed(1)}</b></li>`;
  });
  html += `</ol>`;

  // Совпавшие оценки
  const matches = getScoreMatches(movies);
  html += `<h3>Совпавшие оценки (${matches.length})</h3><ul>`;
  matches.forEach(m => {
    html += `<li>${m.title} — <b>${m.scoreSvyat}</b></li>`;
  });
  html += `</ul>`;

  // Тренд по месяцам
  const trends = getWatchTrends(movies);
  html += `<h3>Динамика просмотров по месяцам</h3><ul>`;
  Object.entries(trends).forEach(([month, count]) => {
    html += `<li>${month}: <b>${count}</b> фильмов</li>`;
  });
  html += `</ul>`;

  stats.innerHTML = html;
}
