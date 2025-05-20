/* ===== stats.js v2.3 ===== */

//
// 1. Pure helpers -----------------------------------------------------------
//

// среднее значение массива чисел (или «–»)
const avg = arr => {
  const nums = arr.filter(x => typeof x === 'number');
  return nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2) : '–';
};

// top-N по средней оценке
const getTopMovies = (movies, limit = 5) =>
  movies
    .filter(m => m.scoreSvyat != null && m.scoreAlena != null)
    .sort((a, b) =>
      ((b.scoreSvyat + b.scoreAlena) / 2) -
      ((a.scoreSvyat + a.scoreAlena) / 2))
    .slice(0, limit);

// совпавшие оценки
const getScoreMatches = movies =>
  movies.filter(m =>
    m.scoreSvyat != null &&
    m.scoreAlena != null &&
    m.scoreSvyat === m.scoreAlena);

// просмотренные по месяцам { 'YYYY-MM': count }
const getWatchTrends = movies => {
  const byMonth = {};
  movies.forEach(m => {
    if (m.status === 'Просмотрен' && m.date) {
      const month = m.date.slice(0, 7);
      byMonth[month] = (byMonth[month] || 0) + 1;
    }
  });
  return byMonth;
};

//
// 2. Render -----------------------------------------------------------------
//

function renderStats(movies = []) {
  const node = document.getElementById('stats-block');
  if (!node) return;

  // summary
  const total     = movies.length;
  const planned   = movies.filter(m => m.status === 'Запланирован').length;
  const watched   = movies.filter(m => m.status === 'Просмотрен').length;
  const avgSvyat  = avg(movies.map(m => m.scoreSvyat));
  const avgAlena  = avg(movies.map(m => m.scoreAlena));

  // details
  const top      = getTopMovies(movies);
  const matches  = getScoreMatches(movies);
  const trends   = getWatchTrends(movies);

  node.innerHTML = /*html*/`
    <div class="stats-summary">
      <b>Всего фильмов:</b> ${total}<br>
      <b>Запланировано:</b> ${planned}<br>
      <b>Просмотрено:</b> ${watched}<br>
      <b>Средняя оценка Свята:</b> ${avgSvyat}<br>
      <b>Средняя оценка Алёны:</b> ${avgAlena}<br>

      <hr style="margin:16px 0;">

      <h3>Топ-5 фильмов по оценке</h3>
      <ol>
        ${top.map(m => `
          <li>
            ${m.title}${m.year ? ` (${m.year})` : ''} —
            <b>${((m.scoreSvyat + m.scoreAlena) / 2).toFixed(1)}</b>
          </li>
        `).join('')}
      </ol>

      <h3>Совпадения оценок (${matches.length})</h3>
      <ul>
        ${matches.map(m => `
          <li>${m.title} — <b>${m.scoreSvyat}</b></li>
        `).join('')}
      </ul>

      <h3>Тренд по месяцам</h3>
      <ul>
        ${Object.entries(trends).map(([month, count]) => `
          <li>${month}: <b>${count}</b> фильм(ов)</li>
        `).join('')}
      </ul>
    </div>
  `;
}

//
// 3. (опц.) экспорт — если используешь ES-modules
//    export { renderStats };
