/* =============================
   MovieClub – ui.js  v2.4
   =============================
   • отвечает за DOM-рендер
   • без бизнес-логики Firestore
   • экспортирует функции для logic.js
   ============================= */

const STAR_MAX = 10;
const starSvg  = filled => filled ? "★" : "☆";

/* ---------- 1. ЗВЁЗДЫ ---------------------------------------------- */
function renderStarRating(id, user, rating = 0, disabled = false) {
  let html = '<div class="star-rating" role="radiogroup">';
  for (let i = 1; i <= STAR_MAX; i++) {
    const filled = i <= rating;
    html += `
      <span class="star${filled ? ' filled' : ''}"
            role="radio" aria-label="${i}"
            tabindex="0"
            data-star="${i}"
            data-id="${id}"
            data-user="${user}"
            ${disabled ? 'aria-disabled="true"' : ''}>
        ${starSvg(filled)}
      </span>`;
  }
  html += '</div>';
  return html;
}

/* ---------- 2. SKELETON ------------------------------------------- */
function renderSkeleton(rows = 4) {
  const list = document.getElementById("movie-list");
  if (!list) return;
  list.innerHTML = Array.from({ length: rows },
    () => '<div class="skeleton"></div>').join("");
}

/* ---------- 3. TOAST / SNACKBAR ----------------------------------- */
function showToast(msg, type = "success") {
  const div = document.createElement("div");
  div.className = `toast toast-${type}`;
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => {
    div.style.opacity = "0";
    setTimeout(() => div.remove(), 220);
  }, 1700);
}

function showHighFive() { showToast("👏 Пятюня! Совпали оценки! 👏", "success"); }

/* ---------- 4. MOVIE-LIST ----------------------------------------- */
function renderMovieList(movies, currentUser) {
  const list = document.getElementById("movie-list");
  if (!list) return;

  if (!movies.length) {
    list.innerHTML =
      `<li class="movie" style="text-align:center;color:#bbb;font-size:18px;padding:33px 0;">
         Нет фильмов по заданным фильтрам
       </li>`;
    return;
  }

  let needHiFive = false;

  const html = movies.map(m => {
    const addedVerb = m.addedBy === "Алёна" ? "добавила" : "добавил";
    const yearStr   = m.year ? `<span class="movie-year">(${m.year})</span>` : "";

    const disS = !(currentUser === "Свят"  && !m.confirmedSvyat);
    const disA = !(currentUser === "Алёна" && !m.confirmedAlena);

    const hasBoth = m.scoreSvyat != null && m.scoreAlena != null;
    const match   = hasBoth && m.scoreSvyat === m.scoreAlena;
    if (match) needHiFive = true;

    const avg = hasBoth ? ((m.scoreSvyat + m.scoreAlena) / 2).toFixed(1) : "-";

    return `
      <li class="movie">
        <div class="movie-header">
          <span class="movie-title">${m.title}</span>
          ${yearStr}
          <span class="movie-status">${m.status || ""}</span>
          ${m.addedBy ? `<span class="mini">${addedVerb}: ${m.addedBy}</span>` : ""}
          <button class="del-btn" title="Удалить фильм"
                  onclick="deleteMovieUI('${m.id}')">✖️</button>
        </div>

        <div class="user-block user-svyat">
          <div class="user-row"><span class="user-label">Свят:</span>
            ${renderStarRating(m.id,"Свят",m.scoreSvyat,disS)}
          </div>
          <textarea placeholder="Комментарий" ${disS ? "disabled" : ""}
            onchange="setCommentUI('${m.id}','Свят',this.value)">${m.commentSvyat || ""}</textarea>
          <button class="confirm-btn" ${(!m.scoreSvyat || disS) ? "disabled" : ""}
            onclick="confirmReviewUI('${m.id}','Свят')">Подтвердить</button>
        </div>

        <div class="user-block user-alena">
          <div class="user-row"><span class="user-label">Алёна:</span>
            ${renderStarRating(m.id,"Алёна",m.scoreAlena,disA)}
          </div>
          <textarea placeholder="Комментарий" ${disA ? "disabled" : ""}
            onchange="setCommentUI('${m.id}','Алёна',this.value)">${m.commentAlena || ""}</textarea>
          <button class="confirm-btn" ${(!m.scoreAlena || disA) ? "disabled" : ""}
            onclick="confirmReviewUI('${m.id}','Алёна')">Подтвердить</button>
        </div>

        <span class="avg-score">Средняя оценка: ${avg}</span>
        ${match ? '<span class="important-note">👏 Совпадение! 👏</span>' : ""}
      </li>`;
  }).join("");

  list.innerHTML = html;
  if (needHiFive) setTimeout(showHighFive, 200);
}

/* ---------- 5. FILTER CHIP state ---------------------------------- */
function renderFilters(currentFilter) {
  document.querySelectorAll(".filter-btn").forEach(btn =>
    btn.classList.toggle("active", btn.dataset.filter === currentFilter));
}

/* ---------- 6. STAR EVENTS (click + key) --------------------------- */
document.addEventListener("click", e => {
  const star = e.target.closest(".star");
  if (!star || star.hasAttribute("aria-disabled")) return;
  const { star: val, id, user } = star.dataset;
  window.setScoreStar(id, user, +val);
});

document.addEventListener("keydown", e => {
  if (!["Enter"," "].includes(e.key)) return;
  const star = e.target.closest(".star");
  if (!star || star.hasAttribute("aria-disabled")) return;
  e.preventDefault();
  const { star: val, id, user } = star.dataset;
  window.setScoreStar(id, user, +val);
});

/* ---------- 7. UI → Logic wrappers -------------------------------- */
window.deleteMovieUI  = id            => confirm("Точно удалить?") && deleteMovieLogic(id);
window.confirmReviewUI= (id,user)     => { confirmReviewLogic(id,user); showToast("Оценка подтверждена!"); };
window.setCommentUI   = (id,user,val) => setCommentLogic(id,user,val);

/* ---------- 8. EXPORTS --------------------------------------------- */
export {
  renderSkeleton,
  renderMovieList,
  renderFilters,
  showToast
};

