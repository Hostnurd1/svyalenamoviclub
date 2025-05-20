// ===== stats.js (MovieClub v2.3) =====
// Модуль статистики. Экспортируем одну публичную функцию:
//   renderStats(moviesArray)
// Принимает массив фильмов (документы Firestore) и заполняет блок #stats-block
// на вкладке «Статистика».

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function getTopMovies(movies, limit = 5) {
  const rated = movies.filter((m) => typeof m.scoreSvyat === 'number' && typeof m.scoreAlena === 'number');
  rated.sort((a, b) => averageScore(b) - averageScore(a));
  return rated.slice(0, limit);
}

function getScoreMatches(movies) {
  return movies.filter(
    (m) => typeof m.scoreSvyat === 'number' && m.scoreSvyat === m.scoreAlena
  );
}

function getWatchTrends(movies) {
  const byMonth = {};
  movies.forEach((m) => {
    if (m.status === 'Просмотрен' && m.date) {
      // m.date может быть либо ISO‑строкой, либо объектом Timestamp (Firestore)
      const iso = typeof m.date === 'string' ? m.date : m.date.toDate().toISOString();
      const month = iso.slice(0, 7); // YYYY-MM
      byMonth[month] = (byMonth[month] || 0) + 1;
    }
  });
  return byMonth;
}

function averageScore(movie) {
  return (movie.scoreSvyat + movie.scoreAlena) / 2;
}

function avg(arr) {
  const nums = arr.filter((x) => typeof x === 'number');
  if (!nums.length) return '-';
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2);
}

// ---------------------------------------------------------------------------
// public
// ---------------------------------------------------------------------------
export function renderStats(movies) {
  const container = document.getElementById('stats-block');
  if (!container) return;

  const total = movies.length;
  const planned = movies.filter((m) => m.status === 'Запланирован').length;
  const watched = movies.filter((m) => m.status === 'Просмотрен').length;

  const avgSvyat = avg(movies.map((m) => m.scoreSvyat));
  const avgAlena = avg(movies.map((m) => m.scoreAlena));

  const top = getTopMovies(movies, 5);
  const matches = getScoreMatches(movies);
  const trends = getWatchTrends(movies);

  const html = `
    <div class="stats-summary">
      <p><b>Всего фильмов:</b> ${total}</p>
      <p><b>Запланировано:</b> ${planned}</p>
      <p><b>Просмотрено:</b> ${watched}</p>
      <p><b>Средняя оценка Свята:</b> ${avgSvyat}</p>
      <p><b>Средняя оценка Алёны:</b> ${avgAlena}</p>

      <hr style="margin: 16px 0;" />

      <h3>Топ‑5 фильмов по средней оценке</h3>
      <ol>
        ${top
          .map((m) => {
            const year = m.year ? ` (${m.year})` : '';
            return `<li>${m.title}${year} — <b>${averageScore(m).toFixed(1)}</b></li>`;
          })
          .join('')}
      </ol>

      <h3>Совпадения оценок (${matches.length})</h3>
      <ul>
        ${matches
          .map((m) => `<li>${m.title} — <b>${m.scoreSvyat}</b></li>`)
          .join('')}
      </ul>

      <h3>Тренд по месяцам</h3>
      <ul>
        ${Object.entries(trends)
          .sort(([a], [b]) => (a > b ? 1 : -1))
          .map(([month, count]) => `<li>${month}: <b>${count}</b> фильмов</li>`)
          .join('')}
      </ul>
    </div>`;

  container.innerHTML = html;
}
