// App.js
import React, { useState } from "react";
import "./App.css";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAxLMSDQSPon7NTd9loVRMLNCseBFSOTDc",
  authDomain: "movieclub-aba80.firebaseapp.com",
  projectId: "movieclub-aba80",
  storageBucket: "movieclub-aba80.appspot.com",
  messagingSenderId: "747897349535",
  appId: "1:747897349535:web:bd29be3880dbcffac749aa",
  measurementId: "G-LQ40KH85NE"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

function App() {
  const [tab, setTab] = useState("movies");

  return (
    <div className="app">
      {/* Верхняя панель */}
      <header className="header">
        <div className="title">Свят & Алёна MovieClub</div>
      </header>

      {/* Основная часть */}
      <main className="main">
        {tab === "movies" && <div>Список фильмов (вкладка 1)</div>}
        {tab === "achievements" && <div>Ачивки (вкладка 2)</div>}
        {tab === "history" && <div>История (вкладка 3)</div>}
      </main>

      {/* Нижняя навигация */}
      <nav className="tabbar">
        <button
          className={tab === "movies" ? "active" : ""}
          onClick={() => setTab("movies")}
        >
          Фильмы
        </button>
        <button
          className={tab === "achievements" ? "active" : ""}
          onClick={() => setTab("achievements")}
        >
          Ачивки
        </button>
        <button
          className={tab === "history" ? "active" : ""}
          onClick={() => setTab("history")}
        >
          История
        </button>
      </nav>
    </div>
  );
}

export default App;
