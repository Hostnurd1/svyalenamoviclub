// MovieList.js
import React, { useState } from "react";

export default function MovieList({ user }) {
  const [movies, setMovies] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newMovie, setNewMovie] = useState({ title: "", year: "" });

  // Добавление фильма в список
  function handleAddMovie() {
    if (!newMovie.title.trim() || !newMovie.year.trim()) return;
    setMovies([
      ...movies,
      {
        id: Date.now(),
        title: newMovie.title,
        year: newMovie.year,
        addedBy: user.name,
        status: "Запланировано"
      }
    ]);
    setNewMovie({ title: "", year: "" });
    setShowAdd(false);
  }

  return (
    <div className="movie-list">
      <div className="movie-list-header">
        <h2>Список фильмов</h2>
        {/* Плавающая кнопка "Добавить" */}
        <button className="fab" onClick={() => setShowAdd(true)} title="Добавить фильм">
          +
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
            />
            <input
              type="text"
              placeholder="Год"
              value={newMovie.year}
              onChange={e => setNewMovie({ ...newMovie, year: e.target.value })}
            />
            <div className="modal-actions">
              <button onClick={handleAddMovie}>Добавить</button>
              <button onClick={() => setShowAdd(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Список фильмов */}
      <ul>
        {movies.length === 0 && <li className="empty">Нет фильмов. Добавьте первый!</li>}
        {movies.map(m => (
          <li key={m.id} className="movie-card">
            <div className="movie-title">{m.title} <span className="movie-year">({m.year})</span></div>
            <div className="movie-meta">
              <span>Добавил: {m.addedBy}</span>
              <span className={`status ${m.status === "Запланировано" ? "planned" : "watched"}`}>{m.status}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
