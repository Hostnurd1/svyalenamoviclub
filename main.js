/* ===== main.js v2.3 =====
   Только «клей» интерфейса ─ всё бизнес-правила остаются в logic.js
*/

// --- 1. Версия в углу ------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const vLabel = document.querySelector('.version');
  if (vLabel) vLabel.textContent = 'v2.3';
});

// --- 2. Утилита: запускаем действие со скелетоном --------------------------
function withSkeleton(fn) {
  return (...args) => {
    renderSkeleton();                  // shimmer-placeholder из ui.js
    setTimeout(() => fn(...args), 120); // мини-задержка = «сетевой» лаг
  };
}

// --- 3. Навешиваем обработчики после разбора DOM ---------------------------
document.addEventListener('DOMContentLoaded', () => {
  /* Фильтры-кнопки */
  document.querySelectorAll('.filter-btn').forEach(btn =>
    btn.addEventListener('click',
      withSkeleton(() => setFilter(btn.dataset.filter)))
  );

  /* Табы */
  document.querySelectorAll('.tab').forEach(btn =>
    btn.addEventListener('click',
      withSkeleton(() => switchTab(btn.dataset.tab)))
  );

  /* Поиск */
  document.getElementById('movie-search')
          .addEventListener('input',
            withSkeleton(e => setSearch(e.target.value)));

  /* Рандомайзер */
  document.querySelector('.random-btn')
          .addEventListener('click', randomMovie);
});

// --- 4. Случайный фильм ----------------------------------------------------
async function randomMovie() {
  const out = document.getElementById('random-out');
  out.textContent = '🎲 ищем…';

  try {
    let movies = await dbGetMovies();
    movies = movies.filter(m => m.status === 'Запланирован');

    if (!movies.length) {
      out.textContent = 'Нет фильмов в планах!';
      return;
    }

    const rnd = movies[Math.floor(Math.random() * movies.length)];
    out.innerHTML =
      `🎬 Ваш выбор: <b>${rnd.title}${rnd.year ? ` (${rnd.year})` : ''}</b>`;
  } catch (err) {
    console.error(err);
    out.textContent = 'Ошибка сети 😢';
  }
}

/* Показ/скрытие модалки и первая загрузка
   уже обрабатываются в logic.js (window.load listener). */


