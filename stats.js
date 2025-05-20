// ====== stats.js (MovieClub v2.2) ======

// Получить топ-N фильмов по средней оценке
function getTopMovies(movies, limit = 5) {
  const rated = movies.filter(m => m.scoreSvyat && m.scoreAlena);
  rated.sort((a, b) => (
    ((b.scoreSvyat + b.scoreAlena)/2) - ((a.scoreSvyat + a.scoreAlena)/2)
  ));
  return rated.slice(0, limit);
}

// Совпавшие оценки
function getScoreMatches(movies) {
  return movies.filter(m => m.scoreSvyat && m.scoreAlena && m.scoreSvyat === m.scoreAlena);
}

// Тренды по месяцам
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

// Рендер статистики
function renderStats(movies) {
  const stats = document.getElementById('stats-block');
  if (!stats) return;
  // Счётчики
  const total = movies.length;
  const planned = movies.filter(m => m.status === 'Запланирован').length;
  const watched = movies.filter(m => m.status === 'Просмотрен').length;
  const avgSvyat = avg(movies.map(m => m.scoreSvyat));
  const avgAlena = avg(movies.map(m => m.scoreAlena));

  // Топ
  const top = getTopMovies(movies, 5);
  // Совпадения
  const matches = getScoreMatches(movies);
  // Тренды
  const trends = getWatchTrends(movies);

  let html = `<div class="stats-summary">
    <b>Всего фильмов:</b> ${total}<br>
    <b>Запланировано:</b> ${planned}<br>
    <b>Просмотрено:</b> ${watched}<br>
    <b>Средняя оценка Свята:</b> ${avgSvyat}<br>
    <b>Средняя оценка Алёны:</b> ${avgAlena}<br>
    <hr style="margin: 10px 0;">
    <h3>Топ-5 фильмов по оценке</h3>
    <ol>${top.map(m => `<li>${m.title} (${m.year || ""}) — <b>${((m.scoreSvyat + m.scoreAlena)/2).toFixed(1)}</b></li>`).join('')}</ol>
    <h3>Совпадения оценок (${matches.length})</h3>
    <ul>${matches.map(m => `<li>${m.title} — <b>${m.scoreSvyat}</b></li>`).join('')}</ul>
    <h3>Тренд по месяцам</h3>
    <ul>${Object.entries(trends).map(([month, count]) =>
      `<li>${month}: <b>${count}</b> фильмов</li>`
    ).join('')}</ul>
  </div>`;
  stats.innerHTML = html;
}

// Вспомогательная функция для средней оценки
function avg(arr) {
  arr = arr.filter(x => typeof x === 'number');
  if (!arr.length) return "-";
  return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);
}
