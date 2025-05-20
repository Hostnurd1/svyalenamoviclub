// ===== logic.js (MovieClub v2.3) =====

/*
  Этот файл теперь является ES-модулем.
  index.html:  <script src="logic.js" type="module" defer></script>
*/
import { loadAndRenderMovies, setSearch } from './ui.js';

// Состояние
let currentUser = localStorage.getItem('mc_user') || null;
export { currentUser };

// ---------- helpers ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ---------- выбор пользователя ----------
export function chooseUser(user, fromModal = false) {
  currentUser = user;
  localStorage.setItem('mc_user', user);

  $$('.avatar-btn').forEach((b) => b.classList.remove('active'));
  if (user === 'Свят')   $('#btn-svyat') .classList.add('active');
  if (user === 'Алёна')  $('#btn-alena').classList.add('active');

  if (fromModal) closeUserModal();

  loadAndRenderMovies();
}

// ---------- модалка ----------
export function showUserModal() {
  const modal = $('#user-modal');
  if (!modal || modal.style.display === 'flex') return; // уже открыта
  modal.style.display = 'flex';
  $('.container').style.filter        = 'blur(4px)';
  $('.container').style.pointerEvents = 'none';
}

function closeUserModal() {
  const modal = $('#user-modal');
  if (!modal || modal.style.display === 'none') return;
  modal.style.display = 'none';
  $('.container').style.filter        = '';
  $('.container').style.pointerEvents = 'auto';
}

// ---------- слушатели DOM ----------
$('#movie-search') .addEventListener('input',  (e) => setSearch(e.target.value));
$('#new-movie-title').addEventListener('keydown', (e) => e.key === 'Enter' && addMovie());
$('#new-movie-year') .addEventListener('keydown', (e) => e.key === 'Enter' && addMovie());

$('#btn-svyat') .addEventListener('click', () => chooseUser('Свят'));
$('#btn-alena').addEventListener('click', () => chooseUser('Алёна'));

// ---------- загрузка при старте ----------
window.addEventListener('DOMContentLoaded', () => {
  currentUser ? loadAndRenderMovies() : showUserModal();
});
