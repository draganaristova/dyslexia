
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfilePage.css";
import HomeButton from "../widgets/HomeButton";
import LogoutButton from "../widgets/LogoutButton";
import Logo from "../widgets/Logo";
import { API } from "../data/api";

const THEMES = {
  cream: "#f1eab0",
  white: "#ffffff",
  blue: "#dcecf3",
  green: "#dcebd1"
};

function calculateStreak(items) {
  const days = new Set();
  const getKey = date => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

  items.forEach(item => {
    if (!item.completedAt) return;
    const date = new Date(item.completedAt);
    if (!Number.isNaN(date.getTime())) days.add(getKey(date));
  });

  const date = new Date();
  if (!days.has(getKey(date))) date.setDate(date.getDate() - 1);

  let streak = 0;

  while (days.has(getKey(date))) {
    streak++;
    date.setDate(date.getDate() - 1);
  }

  return streak;
}

function loadDyslexiaFont() {
  try {
    const saved = JSON.parse(localStorage.getItem("lexiland-reading-settings") || "{}");
    return saved?.dyslexiaFont === true;
  } catch {
    return false;
  }
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const settingsLoaded = useRef(false);

  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fontSize, setFontSize] = useState(16);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [theme, setTheme] = useState(localStorage.getItem("profileTheme") || "cream");
  const [dyslexiaFont, setDyslexiaFont] = useState(loadDyslexiaFont);

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  }), [token]);

  useEffect(() => {
    if (!userId || !token) {
      navigate("/login");
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const urls = [
          `${API}/profile/${userId}`,
          `${API}/exercise-progress/user/${userId}`,
          `${API}/exercise-progress/user/${userId}/summary`
        ];

        const responses = await Promise.all(urls.map(url => fetch(url, { headers })));

        if (responses.some(res => res.status === 401 || res.status === 403)) {
          localStorage.removeItem("userId");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (responses.some(res => !res.ok)) {
          throw new Error("Не може да се вчита профилот.");
        }

        const [profileData, progressData, summaryData] = await Promise.all(
          responses.map(res => res.json())
        );

        if (cancelled) return;

        setUser(profileData);
        setProgress(Array.isArray(progressData) ? progressData : []);
        setSummaries(Array.isArray(summaryData) ? summaryData : []);
        setFontSize(Number(profileData.fontSize ?? 16));
        setLetterSpacing(Number(profileData.letterSpacing ?? 0));
        setTheme(profileData.theme || "cream");
        settingsLoaded.current = true;
      } catch (err) {
        if (!cancelled) setError(err.message || "Грешка при вчитување.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [userId, token, navigate, headers]);

  useEffect(() => {
    if (!settingsLoaded.current || !userId || !token) return;

    localStorage.setItem("profileTheme", theme);

    const timer = setTimeout(() => {
      fetch(`${API}/profile/${userId}/settings`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ fontSize, letterSpacing, theme })
      }).catch(err => console.error("Settings save error:", err));
    }, 500);

    return () => clearTimeout(timer);
  }, [fontSize, letterSpacing, theme, userId, token, headers]);

  useEffect(() => {
    const color = THEMES[theme] || THEMES.cream;
    const root = document.getElementById("root");

    const previous = {
      html: document.documentElement.style.background,
      body: document.body.style.background,
      root: root?.style.background || ""
    };

    document.documentElement.style.background = color;
    document.body.style.background = color;
    if (root) root.style.background = color;

    return () => {
      document.documentElement.style.background = previous.html;
      document.body.style.background = previous.body;
      if (root) root.style.background = previous.root;
    };
  }, [theme]);

  const changeDyslexiaFont = enabled => {
    setDyslexiaFont(enabled);

    let saved = {};

    try {
      saved = JSON.parse(localStorage.getItem("lexiland-reading-settings") || "{}") || {};
    } catch {
      saved = {};
    }

    localStorage.setItem(
      "lexiland-reading-settings",
      JSON.stringify({ ...saved, dyslexiaFont: enabled })
    );

    document.body.classList.toggle("dyslexia-font", enabled);
    window.dispatchEvent(new Event("lexiland-settings-changed"));
  };

  const totalTasks = progress.filter(item => item.completed === true).length;
  const correctTasks = progress.filter(item => item.correct === true).length;
  const accuracy = totalTasks > 0 ? Math.round(correctTasks / totalTasks * 100) : 0;
  const passedMissions = summaries.filter(item => item.passed === true).length;
  const streak = calculateStreak(progress);
  const perfectGame = summaries.some(item => item.passed === true && Number(item.score) === 10);

  const badges = [
    { icon: "⭐", name: "Прв чекор", earned: totalTasks >= 1 },
    { icon: "📚", name: "10 решени задачи", earned: totalTasks >= 10 },
    { icon: "🔥", name: "3 дена по ред", earned: streak >= 3 },
    { icon: "🎯", name: "Совршена игра", earned: perfectGame },
    { icon: "🏅", name: "3 поминати мисии", earned: passedMissions >= 3 },
    { icon: "🏆", name: "6 поминати мисии", earned: passedMissions >= 6 }
  ];

  const name = user ? `${user.name || ""} ${user.surname || ""}`.trim() : "Играч";
  const age = Number(user?.age || 0);
  const level = age <= 7 ? 1 : age <= 10 ? 2 : 3;
  const levelTitle = level === 1 ? "Мал истражувач" : level === 2 ? "Храбар читач" : "Мајстор на зборови";
  const levelEmoji = level === 1 ? "🌱" : level === 2 ? "🚀" : "👑";

  const pageStyle = {
    background: THEMES[theme] || THEMES.cream,
    letterSpacing: `${letterSpacing}px`
  };

  return (
    <div className="profile-page" style={pageStyle}>
      <header className="profile-header">
        <Logo />

        <div className="nav-icons-row">
          <HomeButton />
          <LogoutButton />
        </div>
      </header>

      {loading ? (
        <div className="profile-card profile-loading">🌟 Се вчитува профилот...</div>
      ) : error ? (
        <div className="profile-card profile-error">
          <h2>Упс! 😕</h2>
          <p>{error}</p>
          <button className="profile-retry-button" onClick={() => window.location.reload()}>
            Обиди се повторно
          </button>
        </div>
      ) : (
        <div className="profile-layout">
          <main className="profile-content">
            <section className={`profile-hero hero-level-${level}`}>
              <div className="hero-avatar-ring">
                <div className="profile-avatar">{user?.avatarEmoji || "🧒"}</div>
              </div>

              <div className="profile-hero-text">
                <h1>Здраво, {name}! 🌟</h1>

                <div className="hero-chips">
                  <span className="hero-chip">{levelEmoji} {levelTitle}</span>
                  <span className="hero-chip">{user?.age} години</span>
                </div>
              </div>

              <div className="profile-streak">
                <span className="profile-streak-flame">🔥</span>
                <div>
                  <strong>{streak}</strong>
                  <p>дена по ред</p>
                </div>
              </div>
            </section>

            <section className="stat-tiles">
              <div className="stat-tile tile-green">
                <span className="stat-icon">✅</span>
                <strong>{totalTasks}</strong>
                <p>Решени задачи</p>
              </div>

              <div className="stat-tile tile-blue">
                <span className="stat-icon">🎯</span>
                <strong>{accuracy}%</strong>
                <p>Точност</p>
              </div>

              <div className="stat-tile tile-purple">
                <span className="stat-icon">🏅</span>
                <strong>{passedMissions}</strong>
                <p>Поминати мисии</p>
              </div>

              <div className="stat-tile tile-coral">
                <span className="stat-icon">🔥</span>
                <strong>{streak}</strong>
                <p>Дена по ред</p>
              </div>
            </section>

            <section className="profile-card">
              <h2>📊 Мојот напредок</h2>
              <p className="profile-card-sub">
                Досега имаш решено {totalTasks} задачи и успешно поминато {passedMissions} мисии.
                Продолжи да учиш и да освојуваш нови достигнувања! 🌟
              </p>

              <button className="profile-view-progress" onClick={() => navigate("/progress")}>
                📈 Следење напредок →
              </button>
            </section>

            <section className="profile-card">
              <h2>🏅 Моите достигнувања</h2>
              <p className="profile-card-sub">
                Освојувај значки додека учиш и напредуваш!
              </p>

              <div className="profile-badges-grid">
                {badges.map(badge => (
                  <div
                    key={badge.name}
                    className={`profile-badge ${badge.earned ? "earned" : "locked"}`}
                  >
                    <span className="profile-badge-icon">{badge.icon}</span>
                    <span className="profile-badge-label">{badge.name}</span>
                    <small>{badge.earned ? "Отклучено" : "Заклучено"}</small>
                  </div>
                ))}
              </div>
            </section>
          </main>

          <aside className="profile-settings-sidebar" aria-label="Поставки за читање">
            <div className="profile-settings-sidebar-heading">
              <span className="profile-settings-sidebar-icon">⚙️</span>
              <h2>Мои поставки</h2>
              <p>Приспособи го читањето по твоја желба.</p>
            </div>

            <div className="profile-setting-row profile-setting-toggle">
              <label htmlFor="profile-dyslexia-font">Фонт за дислексија</label>
              <input
                id="profile-dyslexia-font"
                type="checkbox"
                checked={dyslexiaFont}
                onChange={event => changeDyslexiaFont(event.target.checked)}
              />
            </div>

            <div className="profile-setting-row">
              <label htmlFor="letter-spacing">
                Растојание меѓу букви
                <strong>{letterSpacing}px</strong>
              </label>

              <input
                id="letter-spacing"
                type="range"
                min="0"
                max="6"
                step="1"
                value={letterSpacing}
                onChange={event => setLetterSpacing(Number(event.target.value))}
              />
            </div>

            <div className="profile-setting-row">
              <label>Боја на позадина</label>

              <div className="profile-theme-row">
                {Object.entries(THEMES).map(([key, color]) => (
                  <button
                    key={key}
                    type="button"
                    title={key}
                    aria-label={`Избери ${key} позадина`}
                    aria-pressed={theme === key}
                    className={`profile-theme-swatch ${theme === key ? "active" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setTheme(key)}
                  />
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
