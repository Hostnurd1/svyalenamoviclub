// ====== UI v2.2 ======

/* Звёздочный рейтинг (10 звёзд) */
function renderStarRating(id, user, rating, disabled = false) {
  let html = '<div class="star-rating">';
  for (let i = 1; i <= 10; i++) {
    html += `<span class="star${i <= rating ? ' filled' : ''}" 
      tabindex="0" 
      data-star="${i}" 
      data-id="${id}" 
      data-user="${user}" 
      ${disabled ? 'aria-disabled="true"' : ''}>
      ★
    </span>`;
  }
  html += '</div>';
  return html;
}

/* Скелетон-загрузка */
function renderSkeleton(count = 4) {
  let html = '';
  for (let i = 0; i < count; i++) html += `<div class="skeleton"></div>`;
  document.getElementById('movie-list').innerHTML = html;
}

/* Toast/snackbar (успех или ошибка) */
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1700);
}

/* Пятюня — анимация совпадения */
function showFives() {
  let el = document.createElement('div');
  el.className = "toast toast-success";
  el.innerHTML = "&#128079; Пятюня! Совпали оценки! &#128079;";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1600);
}

/* Рендер фильмов */
function renderMovieList(movies, currentUser) {
  const list = document.getElementById('movie-list');
  if (!list) return;
  if (!movies.length) {
    list.innerHTML = `<li class="movie" style="text-align:center;color:#bbb;font-size:18px;padding:33px 0;">
      Нет фильмов по заданным фильтрам</li>`;
    return;
  }
  let html = '';
  movies.forEach(m => {
    let verb = (m.addedBy === 'Алёна') ? 'добавила' : (m.addedBy === 'Свят' ? 'добавил' : '');
    let yearStr = m.year ? `<span class="movie-year">(${m.year})</span>` : '';
    let disableSvyat = !(currentUser === 'Свят' && !m.confirmedSvyat);
    let disableAlena = !(currentUser === 'Алёна' && !m.confirmedAlena);

    // Флажок совпадения оценок
    let match = (m.scoreSvyat && m.scoreAlena && m.scoreSvyat === m.scoreAlena);

    html += `<li class="movie">
      <div class="movie-header">
        <span class="movie-title">${m.title}</span>
        ${yearStr}
        <span class="movie-status">${m.status || ''}</span>
        ${m.addedBy ? `<span class="mini">${verb}: ${m.addedBy}</span>` : ''}
        <button class="del-btn" onclick="deleteMovieUI('${m.id}')" title="Удалить фильм">✖️</button>
      </div>
      <div class="user-block user-svyat">
        <div class="user-row">
          <span class="user-label">Свят:</span>
          ${renderStarRating(m.id, 'Свят', m.scoreSvyat, disableSvyat)}
        </div>
        <textarea rows="2" placeholder="Комментарий" 
          onchange="setCommentUI('${m.id}','Свят',this.value)"
          ${disableSvyat ? 'disabled' : ''}>${m.commentSvyat || ''}</textarea>
        <button class="confirm-btn" 
          onclick="confirmReviewUI('${m.id}','Свят')"
          ${(!m.scoreSvyat || disableSvyat) ? 'disabled' : ''}>Подтвердить</button>
      </div>
      <div class="user-block user-alena">
        <div class="user-row">
          <span class="user-label">Алёна:</span>
          ${renderStarRating(m.id, 'Алёна', m.scoreAlena, disableAlena)}
        </div>
        <textarea rows="2" placeholder="Комментарий" 
          onchange="setCommentUI('${m.id}','Алёна',this.value)"
          ${disableAlena ? 'disabled' : ''}>${m.commentAlena || ''}</textarea>
        <button class="confirm-btn" 
          onclick="confirmReviewUI('${m.id}','Алёна')"
          ${(!m.scoreAlena || disableAlena) ? 'disabled' : ''}>Подтвердить</button>
      </div>
      <span class="avg-score">Средняя оценка: ${
        (m.scoreSvyat && m.scoreAlena)
          ? ((Number(m.scoreSvyat)+Number(m.scoreAlena))/2).toFixed(1)
          : '-'
      }</span>
      ${match ? `<span class="important-note" style="float:left;margin-top:7px;">&#128079; Совпадение! &#128079;</span>` : ''}
    </li>`;
    // Пятюня-анимашка на совпадение (вызывается только когда есть match)
    if (match) setTimeout(showFives, 200);
  });
  list.innerHTML = html;
}

/* UI — удалить фильм (вызывает логику) */
window.deleteMovieUI = function(id) {
  if (confirm('Точно удалить фильм?')) {
    deleteMovieLogic(id);
  }
};
/* UI — подтвердить отзыв */
window.confirmReviewUI = function(id, user) {
  confirmReviewLogic(id, user);
  showToast('Оценка подтверждена!');
};
/* UI — сохранить комментарий */
window.setCommentUI = function(id, user, value) {
  setCommentLogic(id, user, value);
};

/* Фильтры: визуальная активность */
function renderFilters(currentFilter) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    if (btn.dataset.filter === currentFilter) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/* Звезды интерактив (клик) */
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('star') && !e.target.hasAttribute('aria-disabled')) {
    const val = +e.target.dataset.star;
    const id = e.target.dataset.id;
    const user = e.target.dataset.user;
    window.setScoreStar(id, user, val);
  }
});

