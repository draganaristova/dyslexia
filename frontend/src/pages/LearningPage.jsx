
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

    const [category, setCategory] = useState("all");

    const [selectedId, setSelectedId] = useState(
        learningTexts[0]?.id || null
    );

    const [settings, setSettings] = useState(loadSettings);

    const [showSettings, setShowSettings] = useState(false);

    const isLoggedIn = !!localStorage.getItem("token");

    const filteredTexts = learningTexts.filter((item) =>
        category === "all"
            ? true
            : item.category === category
    );

    const selectedStory =
        learningTexts.find((item) => item.id === selectedId) || null;

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

        const first = learningTexts.find((item) =>
            nextCategory === "all"
                ? true
                : item.category === nextCategory
        );

        setSelectedId(first?.id || null);
    };

    return (
        <div className="learning-page">

            {/* HEADER - ИСТ КАКО НА ДРУГИТЕ СТРАНИЦИ */}

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

                {/* INTRO */}

                <section className="learning-intro">

                    <h1>
                        Ајде да читаме!
                    </h1>

                    <p>
                        Избери приказна, слушај и читај со свое темпо.
                        Секоја реченица е нова мала победа! ⭐
                    </p>

                    <button
                        type="button"
                        className="learning-settings-toggle"
                        onClick={() => setShowSettings((prev) => !prev)}
                        aria-expanded={showSettings}
                    >
                        ⚙️ {showSettings ? "Затвори поставки" : "Поставки за читање"}
                    </button>

                </section>

                {/* LEARNING CONTENT */}

                <div className="learning-layout">

                    <aside className="learning-sidebar">

                        <h2>
                            Избери што ќе читаш
                        </h2>

                        <div className="learning-categories">

                            <button
                                type="button"
                                className={category === "all" ? "selected" : ""}
                                onClick={() => changeCategory("all")}
                            >
                                Сите
                            </button>

                            <button
                                type="button"
                                className={category === "story" ? "selected" : ""}
                                onClick={() => changeCategory("story")}
                            >
                                Приказни
                            </button>

                            <button
                                type="button"
                                className={category === "sentences" ? "selected" : ""}
                                onClick={() => changeCategory("sentences")}
                            >
                                Реченици
                            </button>

                        </div>

                        <div className="learning-story-list">

                            {filteredTexts.map((story) => (

                                <button
                                    type="button"
                                    key={story.id}
                                    className={`learning-story-card ${
                                        selectedId === story.id ? "active" : ""
                                    }`}
                                    onClick={() => chooseStory(story.id)}
                                >

                                    <span className="learning-card-icon">
                                        {story.icon}
                                    </span>

                                    <span className="learning-card-info">

                                        <strong>
                                            {story.title}
                                        </strong>

                                        <small>
                                            Ниво {story.level} ·{" "}
                                            {story.sentences.length} реченици
                                        </small>

                                    </span>

                                    <span className="learning-card-arrow">
                                        →
                                    </span>

                                </button>

                            ))}

                        </div>

                    </aside>

                    <div className="learning-main">

                        {showSettings && (

                            <ReadingSettings
                                settings={settings}
                                setSettings={setSettings}
                            />

                        )}

                        <ReadingPlayer
                            story={selectedStory}
                            settings={settings}
                            tts={tts}
                        />

                    </div>

                </div>

                <footer className="learning-footer">
                    💚 Во ЛексиЛенд секое дете учи со свое темпо.
                </footer>

            </main>

        </div>
    );
}
