// ==== Firebase init ====
const firebaseConfig = {
  apiKey: "AIzaSyAxLMSDQSPon7NTd9loVRMLNCseBFSOTDc",
  authDomain: "movieclub-aba80.firebaseapp.com",
  projectId: "movieclub-aba80",
  storageBucket: "movieclub-aba80.appspot.com",
  messagingSenderId: "747897349535",
  appId: "1:747897349535:web:bd29be3880dbcffac749aa",
  measurementId: "G-LQ40KH85NE"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ==== Пользователь (кто сейчас) ====
let currentUser = localStorage.getItem('mc_user') || '';

function chooseUser(user, fromModal = false) {
  currentUser = user;
  localStorage.setItem('mc_user', user);
  highlightUserBtn();
  if (fromModal) {
    document.getElementById('user-modal').style.display = 'none';
    document.querySelector('.container').style.filter = '';
    document.querySelector('.container').style.pointerEvents = '';
    loadMovies();
  } else {
    loadMovies();
  }
}

function highlightUserBtn() {
  const btnS = document.getElementById('btn-svyat');
  const btnA = document.getElementById('btn-alena');
  if (btnS && btnA) {
    btnS.classList.toggle('active', currentUser === 'Свят');
    btnA.classList.toggle('active', currentUser === 'Алёна');
  }
}

function showModal() {
  document.getElementById('user-modal').style.display = 'flex';
  document.querySelector('.container').style.filter = 'blur(4px)';
  document.querySelector('.container').style.pointerEvents = 'none';
}

window.onload = function () {
  if (!currentUser) {
    showModal();
  } else {
    document.getElementById('user-modal').style.display = 'none';
    document.querySelector('.container').style.filter = '';
    document.querySelector('.container').style.pointerEvents = '';
    highlightUserBtn();
    loadMovies();
  }
};
// ==== Добавление фильма ====
async function addMovie() {
  const title = document.getElementById('new-movie-title').value.trim();
  const year = document.getElementById('new-movie-year').value.trim();
  if (!title || !currentUser) return;
  await db.collection('movies').add({
    title: title,
    year: year ? Number(year) : null,
    status: 'Запланирован',
    date: new Date().toISOString(),
    addedBy: currentUser,
    scoreSvyat: null,
    scoreAlena: null,
    commentSvyat: '',
    commentAlena: '',
    emojiSvyat: '',
    emojiAlena: '',
    confirmedSvyat: false,
    confirmedAlena: false
  });
  document.getElementById('new-movie-title').value = '';
  document.getElementById('new-movie-year').value = '';
  loadMovies();
}

// ==== Удаление фильма ====
async function deleteMovie(id) {
  if (confirm('Точно удалить фильм?')) {
    await db.collection('movies').doc(id).delete();
    loadMovies();
  }
}

// ==== Рендер списка фильмов (карточек) ====
async function loadMovies() {
  const res = await db.collection('movies').orderBy('date', 'desc').get();
  let html = '';
  const maxPreview = 60;
  res.forEach(doc => {
    const m = doc.data();
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
        <button class="del-btn" onclick="deleteMovie('${doc.id}')" title="Удалить фильм">✖️</button>
      </div>
      <div>
        <b>Свят:</b>
        <input type="number" min="1" max="10" value="${m.scoreSvyat ?? ''}"
          onchange="setScore('${doc.id}','Свят',this.value)" ${disableS} style="width:34px">
        <input type="text" maxlength="2" placeholder="😊" value="${m.emojiSvyat || ''}"
          onchange="setEmoji('${doc.id}','Свят',this.value)" ${disableS} style="width:34px">
        <textarea rows="2" placeholder="Комментарий"
          onchange="setComment('${doc.id}','Свят',this.value)" ${disableS} style="width:140px;resize:vertical;">${m.commentSvyat || ''}</textarea>
        ${m.commentSvyat && m.commentSvyat.length > maxPreview ? `<div>${previewS}</div>` : ''}
        ${!m.confirmedSvyat && currentUser === 'Свят'
          ? `<button onclick="confirmReview('${doc.id}','Свят')" ${!m.scoreSvyat ? 'disabled' : ''} style="margin-left:5px;">Подтвердить</button>`
          : ''}
        ${needS && m.confirmedAlena ? needS : ''}
      </div>
      <div>
        <b>Алёна:</b>
        <input type="number" min="1" max="10" value="${m.scoreAlena ?? ''}"
          onchange="setScore('${doc.id}','Алёна',this.value)" ${disableA} style="width:34px">
        <input type="text" maxlength="2" placeholder="😍" value="${m.emojiAlena || ''}"
          onchange="setEmoji('${doc.id}','Алёна',this.value)" ${disableA} style="width:34px">
        <textarea rows="2" placeholder="Комментарий"
          onchange="setComment('${doc.id}','Алёна',this.value)" ${disableA} style="width:140px;resize:vertical;">${m.commentAlena || ''}</textarea>
        ${m.commentAlena && m.commentAlena.length > maxPreview ? `<div>${previewA}</div>` : ''}
        ${!m.confirmedAlena && currentUser === 'Алёна'
          ? `<button onclick="confirmReview('${doc.id}','Алёна')" ${!m.scoreAlena ? 'disabled' : ''} style="margin-left:5px;">Подтвердить</button>`
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
  document.getElementById('movie-list').innerHTML = html;
}
// ==== Сохранение оценок, эмодзи, комментариев ====
async function setScore(id, user, value) {
  const field = user === 'Свят' ? 'scoreSvyat' : 'scoreAlena';
  await db.collection('movies').doc(id).update({ [field]: Number(value) });
  loadMovies();
}
async function setComment(id, user, value) {
  const field = user === 'Свят' ? 'commentSvyat' : 'commentAlena';
  await db.collection('movies').doc(id).update({ [field]: value });
  loadMovies();
}
async function setEmoji(id, user, value) {
  const field = user === 'Свят' ? 'emojiSvyat' : 'emojiAlena';
  await db.collection('movies').doc(id).update({ [field]: value });
  loadMovies();
}

// ==== Подтверждение отзыва ====
async function confirmReview(id, user) {
  const field = user === 'Свят' ? 'confirmedSvyat' : 'confirmedAlena';
  await db.collection('movies').doc(id).update({ [field]: true });
  loadMovies();
}

// ==== Раскрытие длинного комментария ====
function expandComment(el, fullText) {
  el.parentNode.innerHTML = fullText;
}

// ==== Рандомайзер ====
async function randomMovie() {
  const res = await db.collection('movies').where('status','==','Запланирован').get();
  const arr = [];
  res.forEach(doc => arr.push(doc.data()));
  if (arr.length === 0) {
    document.getElementById('random-out').innerText = 'Нет фильмов в планах!';
    return;
  }
  const rnd = arr[Math.floor(Math.random()*arr.length)];
  document.getElementById('random-out').innerHTML = `🎬 Ваш выбор: <b>${rnd.title}${rnd.year ? ' ('+rnd.year+')' : ''}</b>`;
}
// ==== Перерисовка при смене пользователя ====
function rerenderAll() {
  highlightUserBtn();
  loadMovies();
}

// ==== Автоочистка поля добавления по Enter ====
document.getElementById('new-movie-title').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    addMovie();
  }
});
document.getElementById('new-movie-year').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    addMovie();
  }
});

// ==== Автоматическая перерисовка при смене пользователя ====
document.getElementById('btn-svyat').addEventListener('click', rerenderAll);
document.getElementById('btn-alena').addEventListener('click', rerenderAll);
document.getElementById('btn-switch').addEventListener('click', function() {
  showModal();
});

// ==== (Опционально) Лоадер — если хочешь отображать “загрузка…” при долгой загрузке фильмов ====
// Добавь в index.html после <div class="container"> <div id="loader" style="display:none;text-align:center;">Загрузка...</div>
// И сюда в main.js:
function showLoader(show) {
  document.getElementById('loader').style.display = show ? 'block' : 'none';
}

// В loadMovies:
// showLoader(true);
// ... весь код загрузки ...
// showLoader(false);

