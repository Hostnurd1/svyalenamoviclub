import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc
} from "firebase/firestore";

export default function MovieList({ user }) {
  const db = getFirestore();
  const [movies, setMovies] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newMovie, setNewMovie] = useState({ title: "", year: "" });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Запланировано");

  // Реалтайм загрузка фильмов
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

  // Добавление фильма
  async function handleAddMovie() {
    if (!newMovie.title.trim() || !newMovie.year.trim()) return;
    await addDoc(collection(db, "movies"), {
      title: newMovie.title.trim(),
      year: newMovie.year.trim(),
      addedBy: user.name,
      addedById: user.id,
      status: "Запланировано",
      createdAt: new Date()
    });
    setNewMovie({ title: "", year: "" });
    setShowAdd(false);
  }

  // Удаление фильма
  async function handleDeleteMovie(id) {
    if (window.confirm("Удалить этот фильм?")) {
      await deleteDoc(doc(db, "movies", id));
    }
  }

  return (
    <div className="movie-list">
      <div className="movie-list-header">
        <h2>Список фильмов</h2>
        <button className="fab" onClick={() => setShowAdd(true)} title="Добавить фильм">
          +
        </button>
      </div>

      {/* Табы фильтра */}
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
          {movies.filter(m => m.status === filter).length === 0 && (
            <li className="empty">Нет фильмов. Добавьте первый!</li>
          )}
          {movies
            .filter(m => m.status === filter)
            .map(m => (
              <li key={m.id} className="movie-card">
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
                      onClick={() => handleDeleteMovie(m.id)}
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
    </div>
  );
}

