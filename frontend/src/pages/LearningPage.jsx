
import React, { useEffect, useState } from "react";

import learningTexts from "../data/learningTexts";
import useMacedonianTTS from "../hooks/useMacedonianTTS";

import ReadingPlayer from "../components/learning/ReadingPlayer";
import ReadingSettings from "../components/learning/ReadingSettings";

import ProfileButton from "../widgets/ProfileButton";
import HomeButton from "../widgets/HomeButton";
import LogoutButton from "../widgets/LogoutButton";
import Logo from "../widgets/Logo";

import "../styles/LearningPage.css";

const DEFAULT_SETTINGS = {
  fontSize: 24,
  letterSpacing: 1.5,
  speed: 0.85,
  dyslexiaFont: false,
  highlight: true,
  background: "cream"
};

const CATEGORIES = [
  {
    id: "story",
    label: "Приказни",
    icon: "📖"
  },
  {
    id: "sentences",
    label: "Реченици",
    icon: "📝"
  },
  {
    id: "words",
    label: "Зборови",
    icon: "🔤"
  }
];

function loadSettings() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("lexiland-reading-settings") || "null"
    );

    return saved
      ? { ...DEFAULT_SETTINGS, ...saved }
      : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export default function LearningPage() {
  const tts = useMacedonianTTS();

  const [category, setCategory] = useState("story");

  const [selectedId, setSelectedId] = useState(() => {
    return (
      learningTexts.find(
        (item) => item.category === "story"
      )?.id || null
    );
  });

  const [settings, setSettings] = useState(loadSettings);

  const [showSettings, setShowSettings] = useState(false);

  const isLoggedIn = !!localStorage.getItem("token");

  const filteredTexts = learningTexts.filter(
    (item) => item.category === category
  );

  const selectedStory =
    filteredTexts.find((item) => item.id === selectedId) ||
    filteredTexts[0] ||
    null;

  useEffect(() => {
    localStorage.setItem(
      "lexiland-reading-settings",
      JSON.stringify(settings)
    );
  }, [settings]);

  const chooseStory = (id) => {
    tts.stop();
    setSelectedId(id);
  };

  const changeCategory = (nextCategory) => {
    tts.stop();

    setCategory(nextCategory);

    const first = learningTexts.find(
      (item) => item.category === nextCategory
    );

    setSelectedId(first?.id || null);
  };

  return (
    <div className="learning-page">
      {/* HEADER */}

      <header className="home-header learning-site-header">
        <Logo />

        <div className="nav-icons-row">
          <HomeButton />

          {isLoggedIn && (
            <>
              <LogoutButton />
              <ProfileButton />
            </>
          )}
        </div>
      </header>

      <main className="learning-container">
        {/* CENTERED INTRO */}

        <section className="learning-intro">
          <span className="learning-kicker">
            ✨ УЧИМЕ НИЗ ИГРА
          </span>

          <h1>Ајде да читаме!</h1>

          <p>
            Прво пробај самостојно, а кога ти треба
            помош — Марија ќе ти прочита.
            Секоја реченица е нова победа!
          </p>

          <button
            type="button"
            className="learning-settings-toggle"
            onClick={() =>
              setShowSettings((previous) => !previous)
            }
            aria-expanded={showSettings}
          >
            ⚙️{" "}
            {showSettings
              ? "Затвори поставки"
              : "Поставки за читање"}
          </button>
        </section>

        {/* MAIN CONTENT */}

        <div className="learning-layout">
          {/* LEFT SIDEBAR */}

          <aside className="learning-sidebar">
            <h2>Што ќе читаме?</h2>

            <div className="learning-categories">
              {CATEGORIES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    category === item.id ? "selected" : ""
                  }
                  onClick={() => changeCategory(item.id)}
                >
                  <span aria-hidden="true">
                    {item.icon}{" "}
                  </span>
                  {item.label}
                </button>
              ))}
            </div>

            <div className="learning-story-list">
              {filteredTexts.length === 0 ? (
                <p className="learning-no-items">
                  Наскоро ќе додадеме нови текстови! 🌟
                </p>
              ) : (
                filteredTexts.map((story) => (
                  <button
                    type="button"
                    key={story.id}
                    className={`learning-story-card ${
                      selectedStory?.id === story.id
                        ? "active"
                        : ""
                    }`}
                    onClick={() => chooseStory(story.id)}
                  >
                    <span className="learning-card-icon">
                      {story.icon}
                    </span>

                    <span className="learning-card-info">
                      <strong>{story.title}</strong>

                      <small>
                        Ниво {story.level} ·{" "}
                        {story.sentences?.length || 0}{" "}
                        {category === "words"
                          ? "зборови"
                          : "реченици"}
                      </small>
                    </span>

                    <span className="learning-card-arrow">
                      →
                    </span>
                  </button>
                ))
              )}
            </div>
          </aside>

          {/* CENTER READING AREA */}

          <div className="learning-main">
            <ReadingPlayer
              story={selectedStory}
              settings={settings}
              tts={tts}
            />
          </div>

          {/* RIGHT SETTINGS PANEL */}

          <aside
            className={`learning-settings-panel ${
              showSettings ? "is-visible" : ""
            }`}
          >
            <ReadingSettings
              settings={settings}
              setSettings={setSettings}
            />
          </aside>
        </div>

        {/* FOOTER */}

        <footer className="learning-footer">
          💚 Во ЛексиЛенд секое дете учи со свое темпо.
        </footer>
      </main>
    </div>
  );
}
