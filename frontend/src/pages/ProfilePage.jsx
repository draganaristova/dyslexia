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


const MISSIONS = [
    {
        type: "MEMORY",
        name: "Меморија",
        icon: "🃏"
    },
    {
        type: "WORD_BUILDING",
        name: "Состави го зборот",
        icon: "🧩"
    },
    {
        type: "MISSING_LETTER",
        name: "Која буква недостасува",
        icon: "🔤"
    },
    {
        type: "RHYMES",
        name: "Најди ја римата",
        icon: "🎵"
    },
    {
        type: "SYLLABLES",
        name: "Слогови",
        icon: "👏"
    },
    {
        type: "SOUND_MANIPULATION",
        name: "Бриши и замени гласови",
        icon: "✂️"
    }
];


const LEVELS = {
    1: {
        title: "Мал истражувач",
        range: "5-7 години",
        emoji: "🌱"
    },
    2: {
        title: "Храбар читач",
        range: "7-10 години",
        emoji: "🚀"
    },
    3: {
        title: "Мајстор на зборови",
        range: "10-15 години",
        emoji: "👑"
    }
};


/*
 * Backend логиката:
 * <= 7  -> Level 1
 * <= 10 -> Level 2
 * > 10  -> Level 3
 */
function levelFromAge(age) {
    const numericAge = Number(age);

    if (!numericAge || numericAge <= 7) {
        return 1;
    }

    if (numericAge <= 10) {
        return 2;
    }

    return 3;
}


function dayKey(date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}


function calculateStreak(items) {
    const days = new Set();

    items.forEach((item) => {
        if (!item?.completedAt) return;

        const date = new Date(item.completedAt);

        if (Number.isNaN(date.getTime())) {
            return;
        }

        days.add(dayKey(date));
    });

    if (days.size === 0) {
        return 0;
    }

    const cursor = new Date();

    if (!days.has(dayKey(cursor))) {
        cursor.setDate(cursor.getDate() - 1);
    }

    let streak = 0;

    while (days.has(dayKey(cursor))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
}


export default function ProfilePage() {
    const navigate = useNavigate();

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    const [items, setItems] = useState([]);
    const [summaries, setSummaries] = useState([]);
    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [fontSize, setFontSize] = useState(16);
    const [letterSpacing, setLetterSpacing] = useState(0);
    const [theme, setTheme] = useState(
        localStorage.getItem("profileTheme") || "cream"
    );

    const settingsLoaded = useRef(false);


    const authHeaders = useMemo(() => ({
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    }), [token]);


    /*
     * =========================
     * LOAD PROFILE + PROGRESS
     * =========================
     */

    useEffect(() => {
        if (!userId || !token) {
            navigate("/login");
            return;
        }

        const loadData = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    profileRes,
                    progressRes,
                    summaryRes
                ] = await Promise.all([
                    fetch(
                        `${API}/profile/${userId}`,
                        {
                            method: "GET",
                            headers: authHeaders
                        }
                    ),

                    fetch(
                        `${API}/exercise-progress/user/${userId}`,
                        {
                            method: "GET",
                            headers: authHeaders
                        }
                    ),

                    fetch(
                        `${API}/exercise-progress/user/${userId}/summary`,
                        {
                            method: "GET",
                            headers: authHeaders
                        }
                    )
                ]);


                if (
                    profileRes.status === 401 ||
                    profileRes.status === 403 ||
                    progressRes.status === 401 ||
                    progressRes.status === 403 ||
                    summaryRes.status === 401 ||
                    summaryRes.status === 403
                ) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    navigate("/login");
                    return;
                }


                if (!profileRes.ok) {
                    throw new Error(
                        "Не може да се вчита профилот."
                    );
                }


                const profileData =
                    await profileRes.json();


                const progressData =
                    progressRes.ok
                        ? await progressRes.json()
                        : [];


                const summaryData =
                    summaryRes.ok
                        ? await summaryRes.json()
                        : [];


                setUser(profileData);

                setItems(
                    Array.isArray(progressData)
                        ? progressData
                        : []
                );

                setSummaries(
                    Array.isArray(summaryData)
                        ? summaryData
                        : []
                );


                setFontSize(
                    Number(profileData.fontSize ?? 16)
                );

                setLetterSpacing(
                    Number(profileData.letterSpacing ?? 0)
                );

                setTheme(
                    profileData.theme || "cream"
                );

                settingsLoaded.current = true;

            } catch (err) {
                console.error(
                    "Profile loading error:",
                    err
                );

                setError(
                    err.message ||
                    "Грешка при вчитување."
                );

            } finally {
                setLoading(false);
            }
        };


        loadData();

    }, [userId, token, navigate, authHeaders]);


    /*
     * =========================
     * SAVE SETTINGS
     * =========================
     */

    useEffect(() => {
        if (!settingsLoaded.current || !userId || !token) {
            return;
        }

        localStorage.setItem(
            "profileTheme",
            theme
        );

        const timer = setTimeout(() => {
            fetch(
                `${API}/profile/${userId}/settings`,
                {
                    method: "PUT",
                    headers: authHeaders,
                    body: JSON.stringify({
                        fontSize,
                        letterSpacing,
                        theme
                    })
                }
            ).catch((err) => {
                console.error(
                    "Settings save error:",
                    err
                );
            });
        }, 500);


        return () => clearTimeout(timer);

    }, [
        fontSize,
        letterSpacing,
        theme,
        userId,
        token,
        authHeaders
    ]);


    /*
     * =========================
     * SCREEN BACKGROUND
     * =========================
     */

    useEffect(() => {
        const color =
            THEMES[theme] || THEMES.cream;

        const root =
            document.getElementById("root");

        const previous = {
            html: document.documentElement.style.background,
            body: document.body.style.background,
            root: root
                ? root.style.background
                : ""
        };


        document.documentElement.style.background =
            color;

        document.body.style.background =
            color;

        if (root) {
            root.style.background =
                color;
        }


        return () => {
            document.documentElement.style.background =
                previous.html;

            document.body.style.background =
                previous.body;

            if (root) {
                root.style.background =
                    previous.root;
            }
        };
    }, [theme]);


    /*
     * =========================
     * CURRENT LEVEL
     * =========================
     */

    const level = levelFromAge(user?.age);

    const levelInfo =
        LEVELS[level];


    /*
     * =========================
     * CURRENT LEVEL MISSIONS
     * =========================
     */

    const missionData = useMemo(() => {
        return MISSIONS.map((mission) => {
            /*
             * summary endpoint користи pinNumber
             * како ниво/мисија.
             */
            const summary =
                summaries.find(
                    (item) =>
                        item.gamesType === mission.type &&
                        Number(item.pinNumber) === level
                );


            return {
                ...mission,

                tasks: summary
                    ? Number(summary.completedTasks || 0)
                    : 0,

                score: summary
                    ? Number(summary.score || 0)
                    : 0,

                passed:
                    summary?.passed === true,

                completed:
                    summary?.completed === true
            };
        });
    }, [summaries, level]);


    /*
     * =========================
     * STATISTICS
     * =========================
     */

    const stats = useMemo(() => {

        const passedMissions =
            missionData.filter(
                (mission) =>
                    mission.passed
            ).length;


        const totalTasks =
            items.length;


        const correctTasks =
            items.filter(
                (item) =>
                    item.correct === true
            ).length;


        const accuracy =
            totalTasks > 0
                ? Math.round(
                    (correctTasks / totalTasks) * 100
                )
                : 0;


        const perfectGame =
            missionData.some(
                (mission) =>
                    mission.tasks >= 10 &&
                    mission.score >= 10
            );


        const currentLevelProgress =
            Math.round(
                (passedMissions / MISSIONS.length) * 100
            );


        return {
            missionData,
            passedMissions,
            totalTasks,
            correctTasks,
            accuracy,
            perfectGame,
            streak: calculateStreak(items),
            currentLevelProgress
        };

    }, [items, missionData]);


    /*
     * =========================
     * BADGES
     * =========================
     */

    const badges = [
        {
            icon: "⭐",
            label: "Прв чекор",
            earned:
                stats.totalTasks >= 1
        },

        {
            icon: "📚",
            label: "10 решени задачи",
            earned:
                stats.totalTasks >= 10
        },

        {
            icon: "🔥",
            label: "3 дена по ред",
            earned:
                stats.streak >= 3
        },

        {
            icon: "🎯",
            label: "Совршена игра",
            earned:
                stats.perfectGame
        },

        {
            icon: "🏅",
            label: "3 поминати мисии",
            earned:
                stats.passedMissions >= 3
        },

        {
            icon: "🏆",
            label: "Сите 6 мисии",
            earned:
                stats.passedMissions >= 6
        }
    ];


    /*
     * =========================
     * USER NAME
     * =========================
     */

    const fullName = user
        ? `${user.name || ""} ${user.surname || ""}`.trim()
        : localStorage.getItem("userName") || "Играч";


    /*
     * =========================
     * PAGE STYLE
     * =========================
     */

    const pageStyle = {
        background:
            THEMES[theme] || THEMES.cream,

        fontSize:
            `${fontSize}px`,

        letterSpacing:
            `${letterSpacing}px`
    };


    /*
     * =========================
     * LOADING
     * =========================
     */

    if (loading) {
        return (
            <div
                className="profile-page"
                style={pageStyle}
            >
                <header className="profile-header">
                    <Logo />

                    <div className="nav-icons-row">
                        <HomeButton />
                        <LogoutButton />
                    </div>
                </header>

                <div className="profile-content">
                    <div className="profile-card profile-loading">
                        Се вчитуваат податоците... 🌟
                    </div>
                </div>
            </div>
        );
    }


    /*
     * =========================
     * ERROR
     * =========================
     */

    if (error) {
        return (
            <div
                className="profile-page"
                style={pageStyle}
            >
                <header className="profile-header">
                    <Logo />

                    <div className="nav-icons-row">
                        <HomeButton />
                        <LogoutButton />
                    </div>
                </header>

                <div className="profile-content">
                    <div className="profile-card profile-error">
                        <h2>Упс! 😕</h2>
                        <p>{error}</p>

                        <button
                            className="profile-retry-button"
                            onClick={() =>
                                window.location.reload()
                            }
                        >
                            Обиди се повторно
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div
            className="profile-page"
            style={pageStyle}
        >

            {/* =========================
                HEADER
            ========================= */}

            <header className="profile-header">
                <Logo />

                <div className="nav-icons-row">
                    <HomeButton />
                    <LogoutButton />
                </div>
            </header>


            <div className="profile-content">

                {/* =========================
                    HERO
                ========================= */}

                <section
                    className={`profile-hero hero-level-${level}`}
                >

                    <div className="hero-deco hero-deco-1">
                        ✨
                    </div>

                    <div className="hero-deco hero-deco-2">
                        ⭐
                    </div>

                    <div className="hero-deco hero-deco-3">
                        📖
                    </div>


                    <div className="hero-avatar-ring">
                        <div className="profile-avatar">
                            {user?.avatarEmoji || "🦊"}
                        </div>
                    </div>


                    <div className="hero-text">

                        <h1>
                            {fullName}
                        </h1>

                        <div className="hero-chips">

                            <span className="hero-chip">
                                {levelInfo.emoji} Ниво {level}: {levelInfo.title}
                            </span>

                            <span className="hero-chip hero-chip-light">
                                {user?.age || "-"} год. • {levelInfo.range}
                            </span>

                        </div>

                    </div>


                    <div className="profile-streak">

                        <span className="profile-streak-flame">
                            🔥
                        </span>

                        <div>
                            <strong>
                                {stats.streak}
                            </strong>

                            <p>
                                дена по ред
                            </p>
                        </div>

                    </div>

                </section>


                {/* =========================
                    STAT TILES
                ========================= */}

                <section className="stat-tiles">

                    <div className="stat-tile tile-green">
                        <span className="stat-icon">
                            ✅
                        </span>

                        <strong>
                            {stats.correctTasks}
                        </strong>

                        <p>
                            точни одговори
                        </p>
                    </div>


                    <div className="stat-tile tile-blue">
                        <span className="stat-icon">
                            🧠
                        </span>

                        <strong>
                            {stats.totalTasks}
                        </strong>

                        <p>
                            решени задачи
                        </p>
                    </div>


                    <div className="stat-tile tile-purple">
                        <span className="stat-icon">
                            🎯
                        </span>

                        <strong>
                            {stats.accuracy}%
                        </strong>

                        <p>
                            точност
                        </p>
                    </div>


                    <div className="stat-tile tile-coral">
                        <span className="stat-icon">
                            🗺️
                        </span>

                        <strong>
                            {stats.passedMissions}/6
                        </strong>

                        <p>
                            поминати мисии
                        </p>
                    </div>

                </section>


                {/* =========================
                    MISSIONS
                ========================= */}

                <section className="profile-card">

                    <h2>
                        Мојата авантура
                    </h2>

                    <p className="profile-card-sub">
                        Помини ги сите 6 мисии за Ниво {level} (
                        {stats.currentLevelProgress}%
                        ).
                    </p>


                    <div className="profile-progress-track">
                        <div
                            className="profile-progress-fill"
                            style={{
                                width:
                                    `${stats.currentLevelProgress}%`
                            }}
                        />
                    </div>


                    <div className="mission-list">

                        {stats.missionData.map(
                            (mission, index) => {

                                const percentage =
                                    Math.min(
                                        100,
                                        mission.tasks * 10
                                    );


                                return (
                                    <div
                                        key={mission.type}
                                        className={`mission-row ${
                                            mission.passed
                                                ? "mission-passed"
                                                : ""
                                        }`}
                                    >

                                        <span className="mission-icon">
                                            {mission.icon}
                                        </span>


                                        <div className="mission-info">

                                            <div className="mission-title">

                                                <strong>
                                                    {index + 1}. {mission.name}
                                                </strong>

                                                <span>
                                                    {mission.passed
                                                        ? "✓ Поминато"
                                                        : `${mission.tasks}/10 задачи`
                                                    }
                                                </span>

                                            </div>


                                            <div className="mission-bar">

                                                <div
                                                    className="mission-bar-fill"
                                                    style={{
                                                        width:
                                                            `${percentage}%`
                                                    }}
                                                />

                                            </div>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>

                </section>


                {/* =========================
                    BADGES
                ========================= */}

                <section className="profile-card">

                    <h2>
                        Достигнувања
                    </h2>


                    <div className="profile-badges-grid">

                        {badges.map(
                            (badge, index) => (

                                <div
                                    key={index}
                                    className={`profile-badge ${
                                        badge.earned
                                            ? "earned"
                                            : "locked"
                                    }`}
                                >

                                    <span className="profile-badge-icon">
                                        {badge.icon}
                                    </span>

                                    <span className="profile-badge-label">
                                        {badge.label}
                                    </span>

                                </div>

                            )
                        )}

                    </div>

                </section>


                {/* =========================
                    SETTINGS
                ========================= */}

                <section className="profile-card">

                    <h2>
                        Пристапни поставки
                    </h2>

                    <p className="profile-card-sub">
                        Прилагоди го екранот за полесно читање.
                    </p>


                    {/* FONT SIZE */}

                    <div className="profile-setting-row profile-setting-column">

                        <strong>
                            Големина на текст: {fontSize}px
                        </strong>

                        <input
                            type="range"
                            min="14"
                            max="24"
                            value={fontSize}
                            onChange={(e) =>
                                setFontSize(
                                    Number(e.target.value)
                                )
                            }
                            className="profile-slider"
                        />

                    </div>


                    {/* LETTER SPACING */}

                    <div className="profile-setting-row profile-setting-column">

                        <strong>
                            Растојание меѓу букви: {letterSpacing}px
                        </strong>

                        <input
                            type="range"
                            min="0"
                            max="4"
                            value={letterSpacing}
                            onChange={(e) =>
                                setLetterSpacing(
                                    Number(e.target.value)
                                )
                            }
                            className="profile-slider"
                        />

                    </div>


                    {/* THEME */}

                    <div className="profile-setting-row profile-setting-column">

                        <strong>
                            Боја на позадина
                        </strong>


                        <div className="profile-theme-row">

                            <button
                                type="button"
                                className={`profile-theme-swatch swatch-cream ${
                                    theme === "cream"
                                        ? "selected"
                                        : ""
                                }`}
                                onClick={() =>
                                    setTheme("cream")
                                }
                                aria-label="Кремава позадина"
                            />


                            <button
                                type="button"
                                className={`profile-theme-swatch swatch-white ${
                                    theme === "white"
                                        ? "selected"
                                        : ""
                                }`}
                                onClick={() =>
                                    setTheme("white")
                                }
                                aria-label="Бела позадина"
                            />


                            <button
                                type="button"
                                className={`profile-theme-swatch swatch-blue ${
                                    theme === "blue"
                                        ? "selected"
                                        : ""
                                }`}
                                onClick={() =>
                                    setTheme("blue")
                                }
                                aria-label="Сина позадина"
                            />


                            <button
                                type="button"
                                className={`profile-theme-swatch swatch-green ${
                                    theme === "green"
                                        ? "selected"
                                        : ""
                                }`}
                                onClick={() =>
                                    setTheme("green")
                                }
                                aria-label="Зелена позадина"
                            />

                        </div>

                    </div>

                </section>

            </div>

        </div>
    );
}