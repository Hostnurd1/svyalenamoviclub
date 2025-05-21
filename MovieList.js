import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDoc
} from "firebase/firestore";

// Звёздный рейтинг
function Stars({ value, onChange, editable = true }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span
          key={i}
          onClick={() => editable && onChange(i)}
          style={{
            cursor: editable ? "pointer" : "default",
            color: i <= value ? "#ffd86b" : "#495178",
            fontSize: "1.5em",
            transition: "0.14s"
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function MovieList({ user }) {
  const db = getFirestore();
  const [movies, setMovies] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newMovie, setNewMovie] = useState({ title: "", year: "" });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Запланировано");

  // --- Поиск
  const [search, setSearch] = useState("");
  // --- Рандомайзер
  function randomPick() {
    const filtered = movies.filter(m => m.status === "Запланировано");
    if (filtered.length === 0) return alert("Нет фильмов для выбора!");
    const rnd = filtered[Math.floor(Math.random() * filtered.length)];
    openMovie(rnd);
  }

  // --- Состояния для модалки фильма (оценка/коммент)
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [updating, setUpdating] = useState(false);

  // --- Реалтайм загрузка фильмов
  useEffect(() => {
    const q = query(collection(db, "movies"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, snapshot => {
      setMovies(
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );
      setLoading(false);
    });
    return () => unsubscribe();
  }, [db]);

  // --- Добавление фильма
  async function handleAddMovie() {
    if (!newMovie.title.trim() || !newMovie.year.trim()) return;
    await addDoc(collection(db, "movies"), {
      title: newMovie.title.trim(),
      year: newMovie.year.trim(),
      addedBy: user.name,
      addedById: user.id,
      status: "Запланировано",
      ratings: {},
      createdAt: new Date()
    });
    setNewMovie({ title: "", year: "" });
    setShowAdd(false);
  }

  // --- Удаление фильма
  async function handleDeleteMovie(id) {
    if (window.confirm("Удалить этот фильм?")) {
      await deleteDoc(doc(db, "movies", id));
    }
  }
  // --- Открытие фильма (загрузка своей оценки/коммента)
  async function openMovie(movie) {
    setSelectedMovie(movie);
    const db = getFirestore();
    const docRef = doc(db, "movies", movie.id);
    const snap = await getDoc(docRef);
    const data = snap.data();
    if (data && data.ratings && data.ratings[user.id]) {
      setMyRating(data.ratings[user.id].stars);
      setMyComment(data.ratings[user.id].comment);
    } else {
      setMyRating(0);
      setMyComment("");
    }
  }

  // --- Сохранение оценки и комментария
  async function handleSaveRating() {
    if (!myRating) return;
    setUpdating(true);
    const db = getFirestore();
    const movieRef = doc(db, "movies", selectedMovie.id);
    const snap = await getDoc(movieRef);
    const oldData = snap.data();
    const newRatings = {
      ...((oldData && oldData.ratings) || {}),
      [user.id]: {
        stars: myRating,
        comment: myComment
      }
    };
    // Проверяем, оба ли оценили
    const users = ["svyat", "alena"];
    const bothRated = users.every(uid => newRatings[uid] && newRatings[uid].stars);

    await updateDoc(movieRef, {
      ratings: newRatings,
      status: bothRated ? "Просмотрено" : "Запланировано"
    });
    setUpdating(false);
    setSelectedMovie(null);
  }

  // --- Рендер
  return (
    <div className="movie-list">
      <div className="movie-list-header">
        <h2>Список фильмов</h2>
        <button className="fab" onClick={() => setShowAdd(true)} title="Добавить фильм">
          +
        </button>
      </div>
      {/* Поиск */}
      <input
        type="text"
        placeholder="Поиск по названию"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "8px 12px",
          borderRadius: 12,
          border: "none",
          margin: "8px 0 16px 0",
          background: "#1b1f3a",
          color: "#fff",
          fontSize: "1.04rem"
        }}
      />
      {/* Табы + рандомайзер */}
      <div className="movie-list-tabs" style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <button
          className={filter === "Запланировано" ? "active" : ""}
          onClick={() => setFilter("Запланировано")}
          style={{
            background: filter === "Запланировано" ? "#3843ab" : "#1b1f3a",
            color: "#fff",
            border: "none",
            padding: "8px 18px",
            borderRadius: 18,
            cursor: "pointer",
            transition: "0.15s"
          }}
        >
          Запланировано
        </button>
        <button
          className={filter === "Просмотрено" ? "active" : ""}
          onClick={() => setFilter("Просмотрено")}
          style={{
            background: filter === "Просмотрено" ? "#3843ab" : "#1b1f3a",
            color: "#fff",
            border: "none",
            padding: "8px 18px",
            borderRadius: 18,
            cursor: "pointer",
            transition: "0.15s"
          }}
        >
          Просмотрено
        </button>
        <button
          onClick={randomPick}
          style={{
            marginLeft: "auto",
            background: "#3843ab",
            color: "#fff",
            border: "none",
            padding: "8px 18px",
            borderRadius: 18,
            cursor: "pointer",
            fontWeight: 500
          }}
        >
          Что посмотреть?
        </button>
      </div>
      {/* Модалка для добавления */}
      {showAdd && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Добавить фильм</h3>
            <input
              type="text"
              placeholder="Название"
              value={newMovie.title}
              onChange={e => setNewMovie({ ...newMovie, title: e.target.value })}
              maxLength={60}
            />
            <input
              type="text"
              placeholder="Год"
              value={newMovie.year}
              onChange={e => setNewMovie({ ...newMovie, year: e.target.value })}
              maxLength={6}
            />
            <div className="modal-actions">
              <button onClick={handleAddMovie}>Добавить</button>
              <button onClick={() => setShowAdd(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Список фильмов */}
      {loading ? (
        <div style={{ color: "#bbc2f2", marginTop: 32 }}>Загрузка...</div>
      ) : (
        <ul>
          {movies
            .filter(m => m.status === filter)
            .filter(m => m.title.toLowerCase().includes(search.toLowerCase()))
            .length === 0 && (
              <li className="empty">Нет фильмов. Добавьте первый!</li>
            )}
          {movies
            .filter(m => m.status === filter)
            .filter(m => m.title.toLowerCase().includes(search.toLowerCase()))
            .map(m => (
              <li
                key={m.id}
                className="movie-card"
                style={{ cursor: "pointer" }}
                onClick={() => openMovie(m)}
              >
                <div className="movie-title">
                  {m.title} <span className="movie-year">({m.year})</span>
                </div>
                <div className="movie-meta">
                  <span>Добавил: {m.addedBy}</span>
                  <span className={`status ${m.status === "Запланировано" ? "planned" : "watched"}`}>
                    {m.status}
                  </span>
                  {m.addedById === user.id && (
                    <button
                      style={{
                        marginLeft: 10,
                        background: "none",
                        color: "#ff7171",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "1.15rem"
                      }}
                      onClick={e => { e.stopPropagation(); handleDeleteMovie(m.id); }}
                      title="Удалить фильм"
                    >
                      ×
                    </button>
                  )}
                </div>
              </li>
            ))}
        </ul>
      )}

      {/* Модальное окно фильма — оценки и комментарии */}
      {selectedMovie && (
        <div className="modal-backdrop">
          <div className="modal" style={{ minWidth: 300 }}>
            <h3>
              {selectedMovie.title}{" "}
              <span style={{ fontWeight: 400, color: "#bbc2f2" }}>
                ({selectedMovie.year})
              </span>
            </h3>
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 14, color: "#a5acd7" }}>
                Добавил: {selectedMovie.addedBy}
              </span>
            </div>
            <div style={{ margin: "14px 0" }}>
              <b>Твоя оценка:</b>
              <Stars value={myRating} onChange={setMyRating} editable />
            </div>
            <textarea
              style={{
                width: "100%",
                minHeight: 52,
                background: "#1b1f3a",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: 8,
                marginTop: 6
              }}
              placeholder="Твой комментарий (по желанию)"
              value={myComment}
              onChange={e => setMyComment(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={handleSaveRating} disabled={!myRating || updating}>
                {updating ? "Сохраняем..." : "Подтвердить"}
              </button>
              <button onClick={() => setSelectedMovie(null)} disabled={updating}>
                Отмена
              </button>
            </div>
            <hr style={{ margin: "18px 0 10px" }} />
            <div>
              <b>Оценки:</b>
              <ul style={{ margin: "8px 0 0 0", padding: 0, listStyle: "none" }}>
                {["svyat", "alena"].map(uid => {
                  const u = uid === "svyat" ? "Свят" : "Алёна";
                  const r = (selectedMovie.ratings && selectedMovie.ratings[uid]);
                  return (
                    <li key={uid} style={{ marginBottom: 8 }}>
                      <span style={{ fontWeight: 500 }}>{u}: </span>
                      {r ? (
                        <>
                          <Stars value={r.stars} editable={false} />{" "}
                          <span style={{ color: "#b7c5f2", fontSize: 14 }}>
                            {r.comment && <span style={{ marginLeft: 6 }}>— {r.comment}</span>}
                          </span>
                        </>
                      ) : (
                        <span style={{ color: "#bbc2f2" }}>Ещё не оценил(а)</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

