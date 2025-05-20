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

// ==== Выбор пользователя ====
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
  }
}

function highlightUserBtn() {
  const btnS = document.getElementById('btn-svyat');
  const btnA = document.getElementById('btn-alena');
  if (btnS && btnA) {
    if (currentUser === 'Свят') {
      btnS.classList.add('active');
      btnA.classList.remove('active');
    } else if (currentUser === 'Алёна') {
      btnA.classList.add('active');
      btnS.classList.remove('active');
    } else {
      btnS.classList.remove('active');
      btnA.classList.remove('active');
    }
  }
}

// ==== Модалка выбора пользователя ====
window.onload = function () {
  if (!currentUser) {
    document.getElementById('user-modal').style.display = 'flex';
    document.querySelector('.container').style.filter = 'blur(5px)';
    document.querySelector('.container').style.pointerEvents = 'none';
  } else {
    document.getElementById('user-modal').style.display = 'none';
    document.querySelector('.container').style.filter = '';
    document.querySelector('.container').style.pointerEvents = '';
    highlightUserBtn();
    loadMovies();
  }
}

// ==== Добавить фильм ====
async function addMovie() {
  const title = document.getElementById('new-movie-title').value.trim();
  if (!title || !currentUser) return;
  await db.collection('movies').add({
    title: title,
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
  loadMovies();
}

// ==== Отобразить список фильмов ====
async function loadMovies() {
  const res = await db.collection('movies').orderBy('date', 'desc').get();
  let html = '';
  res.forEach(doc => {
    const m = doc.data();
    // правильный род для "добавил/добавила"
    let verb = (m.addedBy === 'Алёна') ? 'добавила' : 'добавил';
    // кто не подтвердил оценку
    let needA = !m.confirmedAlena ? '<span style="color:#fb3640; font-size:13px;">Алёна ещё не оценила</span>' : '';
    let needS = !m.confirmedSvyat ? '<span style="color:#fb3640; font-size:13px;">Свят ещё не оценил</span>' : '';
    // disable чужих полей
    let disableS = (currentUser !== 'Свят' || m.confirmedSvyat) ? 'disabled' : '';
    let disableA = (currentUser !== 'Алёна' || m.confirmedAlena) ? 'disabled' : '';

    html += `<li class="movie">
      <div class="movie-title">${m.title} <span class="mini">(${m.status || ''})</span></div>
      <div class="mini">${verb}: ${m.addedBy || '-'}</div>
      <div>
        <b>Свят:</b>
        <input type="number" min="1" max="10" value="${m.scoreSvyat ?? ''}" 
          onchange="setScore('${doc.id}','Свят',this.value)" ${disableS} style="width:34px">
        <input type="text" maxlength="2" placeholder="😊" value="${m.emojiSvyat || ''}" 
          onchange="setEmoji('${doc.id}','Свят',this.value)" ${disableS} style="width:34px">
        <input type="text" placeholder="Комментарий" value="${m.commentSvyat || ''}" 
          onchange="setComment('${doc.id}','Свят',this.value)" ${disableS} style="width:90px">
        ${!m.confirmedSvyat && currentUser === 'Свят' ? `<button onclick="confirmReview('${doc.id}','Свят')" style="margin-left:5px;">Подтвердить</button>` : ''}
        ${needS && m.confirmedAlena ? needS : ''}
      </div>
      <div>
        <b>Алёна:</b>
        <input type="number" min="1" max="10" value="${m.scoreAlena ?? ''}" 
          onchange="setScore('${doc.id}','Алёна',this.value)" ${disableA} style="width:34px">
        <input type="text" maxlength="2" placeholder="😍" value="${m.emojiAlena || ''}" 
          onchange="setEmoji('${doc.id}','Алёна',this.value)" ${disableA} style="width:34px">
        <input type="text" placeholder="Комментарий" value="${m.commentAlena || ''}" 
          onchange="setComment('${doc.id}','Алёна',this.value)" ${disableA} style="width:90px">
        ${!m.confirmedAlena && currentUser === 'Алёна' ? `<button onclick="confirmReview('${doc.id}','Алёна')" style="margin-left:5px;">Подтвердить</button>` : ''}
        ${needA && m.confirmedSvyat ? needA : ''}
      </div>
      <b>Средняя оценка: ${
        (m.scoreSvyat && m.scoreAlena) 
          ? ((Number(m.scoreSvyat)+Number(m.scoreAlena))/2).toFixed(1) 
          : '-'
      }</b>
    </li>`;
  });
  document.getElementById('movie-list').innerHTML = html;
}

// ==== Сохранение оценок, комментариев, эмодзи ====
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

// ==== Подтверждение оценки ====
async function confirmReview(id, user) {
  const field = user === 'Свят' ? 'confirmedSvyat' : 'confirmedAlena';
  await db.collection('movies').doc(id).update({ [field]: true });
  loadMovies();
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
  document.getElementById('random-out').innerHTML = `🎬 Ваш выбор: <b>${rnd.title}</b>`;
}
