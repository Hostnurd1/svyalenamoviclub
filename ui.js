// ==== MovieClub v2.0: ui.js ====

// Рендерим навигацию по вкладкам
function renderTabs(currentTab) {
  document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.tab[data-tab="${currentTab}"]`).classList.add('active');
}

// Рендерим фильтры (выделение активного фильтра)
function renderFilters(currentFilter) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.filter-btn[data-filter="${currentFilter}"]`).classList.add('active');
}

// Устанавливаем значение поиска
function setSearchInput(value) {
  document.getElementById('movie-search').value = value;
}

// Рендер версии приложения (если вдруг что-то сбросилось)
function renderVersion(version = 'v2.0') {
  const v = document.querySelector('.version');
  if (v) v.textContent = version;
}
// ==== Рендер списка фильмов (карточек) ====
function renderMovieList(movies, currentUser) {
  const list = document.getElementById('movie-list');
  if (!list) return;
  if (!movies.length) {
    list.innerHTML = `<li class="movie" style="text-align:center;color:#bbb;font-size:18px;padding:33px 0;">
      Нет фильмов по заданным фильтрам</li>`;
    return;
  }
  const maxPreview = 60;
  let html = '';
  movies.forEach(m => {
    let verb = (m.addedBy === 'Алёна') ? 'добавила' : (m.addedBy === 'Свят' ? 'добавил' : '');
    let yearStr = m.year ? `<span class="mini">(${m.year})</span>` : '';
    let disableS = (currentUser !== 'Свят' || m.confirmedSvyat) ? 'disabled' : '';
    let disableA = (currentUser !== 'Алёна' || m.confirmedAlena) ? 'disabled' : '';
    let needA = !m.confirmedAlena ? `<span class="important-note">Алёна ещё не оценила</span>` : '';
    let needS = !m.confirmedSvyat ? `<span class="important-note">Свят ещё не оценил</span>` : '';

    // Для длинных комментариев (Показать всё)
    let previewS = m.commentSvyat && m.commentSvyat.length > maxPreview
      ? `${m.commentSvyat.slice(0, maxPreview)}... <span class="show-more" onclick="expandComment(this,'${m.commentSvyat.replace(/'/g,"&#39;")}')">Показать всё</span>`
      : (m.commentSvyat || '');
    let previewA = m.commentAlena && m.commentAlena.length > maxPreview
      ? `${m.commentAlena.slice(0, maxPreview)}... <span class="show-more" onclick="expandComment(this,'${m.commentAlena.replace(/'/g,"&#39;")}')">Показать всё</span>`
      : (m.commentAlena || '');

    html += `<li class="movie">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <span class="movie-title">${m.title} ${yearStr}</span>
          <span class="mini">[${m.status || ''}]</span>
          ${m.addedBy ? `<div class="mini">${verb}: ${m.addedBy}</div>` : ''}
        </div>
        <button class="del-btn" onclick="deleteMovieUI('${m.id}')" title="Удалить фильм">✖️</button>
      </div>
      <div class="user-block user-svyat">
        <b>Свят:</b>
        <input type="number" min="1" max="10" value="${m.scoreSvyat ?? ''}"
          onchange="setScoreUI('${m.id}','Свят',this.value)" ${disableS} style="width:34px">
        <input type="text" maxlength="2" placeholder="😊" value="${m.emojiSvyat || ''}"
          onchange="setEmojiUI('${m.id}','Свят',this.value)" ${disableS} style="width:34px">
        <textarea rows="2" placeholder="Комментарий"
          onchange="setCommentUI('${m.id}','Свят',this.value)" ${disableS} style="width:140px;resize:vertical;">${m.commentSvyat || ''}</textarea>
        ${m.commentSvyat && m.commentSvyat.length > maxPreview ? `<div>${previewS}</div>` : ''}
        ${!m.confirmedSvyat && currentUser === 'Свят'
          ? `<button onclick="confirmReviewUI('${m.id}','Свят')" ${!m.scoreSvyat ? 'disabled' : ''} style="margin-left:5px;">Подтвердить</button>`
          : ''}
        ${needS && m.confirmedAlena ? needS : ''}
      </div>
      <div class="user-block user-alena">
        <b>Алёна:</b>
        <input type="number" min="1" max="10" value="${m.scoreAlena ?? ''}"
          onchange="setScoreUI('${m.id}','Алёна',this.value)" ${disableA} style="width:34px">
        <input type="text" maxlength="2" placeholder="😍" value="${m.emojiAlena || ''}"
          onchange="setEmojiUI('${m.id}','Алёна',this.value)" ${disableA} style="width:34px">
        <textarea rows="2" placeholder="Комментарий"
          onchange="setCommentUI('${m.id}','Алёна',this.value)" ${disableA} style="width:140px;resize:vertical;">${m.commentAlena || ''}</textarea>
        ${m.commentAlena && m.commentAlena.length > maxPreview ? `<div>${previewA}</div>` : ''}
        ${!m.confirmedAlena && currentUser === 'Алёна'
          ? `<button onclick="confirmReviewUI('${m.id}','Алёна')" ${!m.scoreAlena ? 'disabled' : ''} style="margin-left:5px;">Подтвердить</button>`
          : ''}
        ${needA && m.confirmedSvyat ? needA : ''}
      </div>
      <div class="avg-score">
        Средняя оценка: ${
          (m.scoreSvyat && m.scoreAlena)
            ? ((Number(m.scoreSvyat)+Number(m.scoreAlena))/2).toFixed(1)
            : '-'
        }
      </div>
    </li>`;
  });
  list.innerHTML = html;
}
// ==== UI-удаление фильма (делегирует реальное удаление logic.js) ====
function deleteMovieUI(id) {
  if (confirm('Точно удалить фильм?')) {
    deleteMovieLogic(id); // вызов из logic.js
  }
}

// ==== UI для подтверждения отзыва, ачивок и пятюни ====
function confirmReviewUI(id, user) {
  confirmReviewLogic(id, user); // вызов из logic.js
  // Анимация/уведомление после подтверждения
  showToast(user === "Свят" ? "Оценка и отзыв Свята сохранены!" : "Оценка и отзыв Алёны сохранены!");
}

// ==== UI для анимации “пятюня”, если оценки совпали ====
function checkFives(m) {
  if (m.scoreSvyat && m.scoreAlena && m.scoreSvyat === m.scoreAlena) {
    showFives();
  }
}
function showFives() {
  let el = document.createElement('div');
  el.className = "fives-popup";
  el.innerHTML = "&#128079; Пятюня! Совпали оценки! &#128079;";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

// ==== UI-уведомление/тост ====
function showToast(msg) {
  let el = document.createElement('div');
  el.className = "toast";
  el.innerText = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1800);
}

// ==== UI-рендер статистики (пример) ====
function renderStats(statsObj) {
  // statsObj = { total: X, planned: Y, watched: Z, avgSvyat: A, avgAlena: B, mostCommon: ... }
  const stats = document.getElementById('stats-block');
  if (!stats) return;
  stats.innerHTML = `
    <div class="stats-summary">
      <b>Всего фильмов:</b> ${statsObj.total}<br>
      <b>Запланировано:</b> ${statsObj.planned}<br>
      <b>Просмотрено:</b> ${statsObj.watched}<br>
      <b>Средняя оценка Свята:</b> ${statsObj.avgSvyat}<br>
      <b>Средняя оценка Алёны:</b> ${statsObj.avgAlena}<br>
      <b>Чаще всего совпадает:</b> ${statsObj.mostCommon ? statsObj.mostCommon : "-"}
    </div>
  `;
}
