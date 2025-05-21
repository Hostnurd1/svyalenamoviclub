import React, { useState } from "react";
import "./App.css";
import MovieList from "./MovieList";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// ТВОЙ КОНФИГ FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyAxLMSDQSPon7NTd9loVRMLNCseBFSOTDc",
  authDomain: "movieclub-aba80.firebaseapp.com",
  projectId: "movieclub-aba80",
  storageBucket: "movieclub-aba80.appspot.com",
  messagingSenderId: "747897349535",
  appId: "1:747897349535:web:bd29be3880dbcffac749aa",
  measurementId: "G-LQ40KH85NE"
};
const app = initializeApp(firebaseConfig);
getAnalytics(app);

const USERS = [
  {
    id: "svyat",
    name: "Свят",
    defaultAvatar: "https://i.imgur.com/EhFvB2p.png"
  },
  {
    id: "alena",
    name: "Алёна",
    defaultAvatar: "https://i.imgur.com/pI6c5Oe.png"
  }
];

function App() {
  const [tab, setTab] = useState("movies");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("movieclubUser");
    return saved ? JSON.parse(saved) : null;
  });

  function handleChooseUser(userId) {
    const chosen = USERS.find(u => u.id === userId);
    setUser(chosen);
    localStorage.setItem("movieclubUser", JSON.stringify(chosen));
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem("movieclubUser");
  }

  if (!user) {
    return (
      <div className="choose-user">
        <h2>Кто ты?</h2>
        <div className="choose-buttons">
          {USERS.map(u => (
            <button key={u.id} onClick={() => handleChooseUser(u.id)}>
              <img src={u.defaultAvatar} alt={u.name} width={60} height={60} style={{ borderRadius: "50%" }} />
              <div>{u.name}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="title">Свят & Алёна MovieClub</div>
        <div className="user-profile" onClick={handleLogout} title="Сменить пользователя">
          <img src={user.defaultAvatar} alt={user.name} width={36} height={36} style={{ borderRadius: "50%" }} />
          <span>{user.name}</span>
        </div>
      </header>
      <main className="main">
        {tab === "movies" && <MovieList user={user} />}
      </main>
      <nav className="tabbar">
        <button className={tab === "movies" ? "active" : ""} onClick={() => setTab("movies")}>Фильмы</button>
      </nav>
    </div>
  );
}

export default App;


