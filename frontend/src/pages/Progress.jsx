import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/Progress.css";

import ProfileButton from "../widgets/ProfileButton";
import HomeButton from "../widgets/HomeButton";
import LogoutButton from "../widgets/LogoutButton";
import Logo from "../widgets/Logo";

import { API } from "../data/api";


const TOTAL_TASKS = 10;


const gameData = {

    MEMORY: {
        name: "Меморија",
        icon: "🃏",
        description:
            "Пронајди ги паровите и вежбај ја меморијата.",
        theme: "memory"
    },

    WORD_BUILDING: {
        name: "Состави го зборот",
        icon: "🧩",
        description:
            "Состави го зборот од дадените букви.",
        theme: "words"
    },

    MISSING_LETTER: {
        name: "Која буква недостасува",
        icon: "🔤",
        description:
            "Откриј која буква недостасува.",
        theme: "letters"
    },

    RHYMES: {
        name: "Најди ја римата",
        icon: "🎵",
        description:
            "Пронајди ги зборовите што се римуваат.",
        theme: "rhymes"
    },

    SYLLABLES: {
        name: "Слогови",
        icon: "👏",
        description:
            "Подели ги зборовите на слогови.",
        theme: "sound"
    },

    SOUND_MANIPULATION: {
        name: "Бриши и замени гласови",
        icon: "✂️",
        description:
            "Вежбај бришење и замена на гласови.",
        theme: "changed"
    }
};


function Progress() {

    const navigate = useNavigate();

    const userId =
        localStorage.getItem("userId");

    const token =
        localStorage.getItem("token");

    const userName =
        localStorage.getItem("userName") ||
        "детето";


    const [progress, setProgress] =
        useState([]);

    const [summary, setSummary] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [selectedReview, setSelectedReview] =
        useState(null);


    /*
     * =========================
     * LOAD DATA
     * =========================
     */

    useEffect(() => {

        if (!userId || !token) {
            navigate("/login");
            return;
        }


        const loadProgress = async () => {

            try {

                setLoading(true);


                const headers = {
                    Authorization:
                        `Bearer ${token}`,

                    "Content-Type":
                        "application/json"
                };


                const [
                    progressResponse,
                    summaryResponse
                ] = await Promise.all([

                    fetch(
                        `${API}/exercise-progress/user/${userId}`,
                        {
                            method: "GET",
                            headers
                        }
                    ),

                    fetch(
                        `${API}/exercise-progress/user/${userId}/summary`,
                        {
                            method: "GET",
                            headers
                        }
                    )

                ]);


                if (
                    progressResponse.status === 401 ||
                    progressResponse.status === 403 ||
                    summaryResponse.status === 401 ||
                    summaryResponse.status === 403
                ) {

                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");

                    navigate("/login");

                    return;
                }


                const progressData =
                    progressResponse.ok
                        ? await progressResponse.json()
                        : [];


                const summaryData =
                    summaryResponse.ok
                        ? await summaryResponse.json()
                        : [];


                setProgress(
                    Array.isArray(progressData)
                        ? progressData
                        : []
                );


                setSummary(
                    Array.isArray(summaryData)
                        ? summaryData
                        : []
                );

            }

            catch (error) {

                console.error(
                    "Progress error:",
                    error
                );

                setProgress([]);
                setSummary([]);

            }

            finally {

                setLoading(false);

            }

        };


        loadProgress();

    }, [userId, token, navigate]);


    /*
     * =========================
     * CONVERT TASK PROGRESS
     * INTO MISSION CARDS
     * =========================
     */

    const adventures = useMemo(() => {

        const grouped = {};


        progress.forEach((item) => {

            const key =
                `${item.gamesId}-${item.gamesType}-${item.pinNumber}`;


            if (!grouped[key]) {

                grouped[key] = {
                    gamesId: item.gamesId,
                    gamesType: item.gamesType,
                    pinNumber: item.pinNumber,
                    tasks: [],
                    attempts: 0
                };

            }


            grouped[key].tasks.push(item);


            grouped[key].attempts +=
                Number(item.attempts || 0);

        });


        /*
         * Summary има точни mission-level резултати.
         * Ги комбинираме со task-level progress.
         */

        const result =
            summary.map((item) => {

                const key =
                    `${item.gamesId}-${item.gamesType}-${item.pinNumber}`;

                const group =
                    grouped[key];


                return {

                    id: key,

                    gamesId:
                        item.gamesId,

                    gamesType:
                        item.gamesType,

                    pinNumber:
                        item.pinNumber,

                    completedTasks:
                        Number(
                            item.completedTasks || 0
                        ),

                    totalTasks:
                        Number(
                            item.totalTasks || TOTAL_TASKS
                        ),

                    score:
                        Number(
                            item.score || 0
                        ),

                    passed:
                        item.passed === true,

                    completed:
                        item.completed === true,

                    attempts:
                        group?.attempts || 0,

                    wrongAnswers:
                        []
                };

            });


        /*
         * Ако некој progress постои,
         * а summary поради некој reason нема запис,
         * го додаваме и него.
         */

        Object.values(grouped).forEach((group) => {

            const exists =
                result.some(
                    (item) =>
                        Number(item.gamesId) ===
                            Number(group.gamesId) &&
                        item.gamesType ===
                            group.gamesType &&
                        Number(item.pinNumber) ===
                            Number(group.pinNumber)
                );


            if (!exists) {

                const uniqueTasks =
                    new Set(
                        group.tasks.map(
                            (item) =>
                                item.taskNumber
                        )
                    );


                const score =
                    group.tasks.filter(
                        (item) =>
                            item.correct === true
                    ).length;


                const completed =
                    uniqueTasks.size >= TOTAL_TASKS;


                result.push({

                    id:
                        `${group.gamesId}-${group.gamesType}-${group.pinNumber}`,

                    gamesId:
                        group.gamesId,

                    gamesType:
                        group.gamesType,

                    pinNumber:
                        group.pinNumber,

                    completedTasks:
                        uniqueTasks.size,

                    totalTasks:
                        TOTAL_TASKS,

                    score,

                    passed:
                        completed &&
                        score >= 8,

                    completed,

                    attempts:
                        group.attempts,

                    wrongAnswers: []
                });

            }

        });


        return result.sort(
            (a, b) =>
                Number(a.pinNumber || 0) -
                Number(b.pinNumber || 0)
        );

    }, [progress, summary]);


    /*
     * =========================
     * SUMMARY NUMBERS
     * =========================
     */

    const completedGames =
        adventures.filter(
            (item) =>
                item.completed === true
        ).length;


    const totalScore =
        adventures.reduce(
            (sum, item) =>
                sum +
                Math.min(
                    TOTAL_TASKS,
                    Math.max(
                        0,
                        Number(item.score || 0)
                    )
                ),
            0
        );


    const averageScore =
        adventures.length > 0
            ? Math.round(
                totalScore /
                adventures.length
            )
            : 0;


    /*
     * =========================
     * REVIEW
     * =========================
     */

    const parseWrongAnswers = (item) => {

        if (!item?.wrongAnswers) {
            return [];
        }


        try {

            const parsed =
                typeof item.wrongAnswers === "string"
                    ? JSON.parse(
                        item.wrongAnswers
                    )
                    : item.wrongAnswers;


            return Array.isArray(parsed)
                ? parsed
                : [];

        } catch {

            return [];

        }

    };


    const openReview = (item) => {

        setSelectedReview({
            ...item,
            wrongAnswers:
                parseWrongAnswers(item)
        });

    };


    const closeReview = () => {
        setSelectedReview(null);
    };


    /*
     * =========================
     * LOADING
     * =========================
     */

    if (loading) {

        return (

            <div className="progress-page">

                <header className="home-header">

                    <Logo />

                    <div className="nav-icons-row">

                        <HomeButton />

                        <LogoutButton />

                        <ProfileButton />

                    </div>

                </header>


                <div className="progress-loading">

                    <div className="loading-stars">
                        ✨
                    </div>

                    <h2>
                        Го собираме твојот напредок...
                    </h2>

                    <p>
                        Само момент 😊
                    </p>

                </div>

            </div>

        );

    }


    /*
     * =========================
     * MAIN
     * =========================
     */

    return (

        <div className="progress-page">

            <header className="home-header">

                <Logo />

                <div className="nav-icons-row">

                    <HomeButton />

                    <LogoutButton />

                    <ProfileButton />

                </div>

            </header>


            <main className="progress-main">

                {/* =========================
                    HERO
                ========================= */}

                <section className="progress-hero">

                    <div className="hero-cloud cloud-one">
                        ☁️
                    </div>

                    <div className="hero-cloud cloud-two">
                        ☁️
                    </div>


                    <div className="hero-text">

                        <h1>
                            Напредок на {userName}
                        </h1>

                        <p>
                            Секој одговор е еден чекор
                            поблиску до следната авантура!
                        </p>

                    </div>


                    <div className="hero-trophy">
                        🏆
                    </div>

                </section>


                {/* =========================
                    SUMMARY
                ========================= */}

                <section className="progress-summary">

                    <div className="summary-box">

                        <span className="summary-icon">
                            🗺️
                        </span>

                        <div>

                            <strong>
                                {completedGames}
                            </strong>

                            <span>
                                завршени авантури
                            </span>

                        </div>

                    </div>


                    <div className="summary-box">

                        <span className="summary-icon">
                            ⭐
                        </span>

                        <div>

                            <strong>
                                {averageScore}/10
                            </strong>

                            <span>
                                просечен резултат
                            </span>

                        </div>

                    </div>


                    <div className="summary-box">

                        <span className="summary-icon">
                            🚀
                        </span>

                        <div>

                            <strong>
                                {adventures.length}
                            </strong>

                            <span>
                                одиграни авантури
                            </span>

                        </div>

                    </div>

                </section>


                {/* =========================
                    TITLE
                ========================= */}

                <div className="adventures-title">

                    <div>

                        <span>
                            ТВОЈАТА ПАТЕКА
                        </span>

                        <h2>
                            Авантури
                        </h2>

                    </div>


                    <div className="adventures-decoration">
                        ⭐ ✨ ⭐
                    </div>

                </div>


                {/* =========================
                    EMPTY
                ========================= */}

                {adventures.length === 0 ? (

                    <section className="empty-progress">

                        <h2>
                            Твојата авантура штотуку започнува!
                        </h2>

                        <p>
                            Оди на патеката и започни ја
                            првата игра. Кога ќе завршиш,
                            резултатот ќе се појави тука.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/world/1")
                            }
                        >
                            🎮 Започни ја авантурата
                        </button>

                    </section>

                ) : (

                    <section className="adventure-grid">

                        {adventures.map(
                            (item) => {

                                const game =
                                    gameData[
                                        item.gamesType
                                    ];


                                if (!game) {
                                    return null;
                                }


                                const score =
                                    Math.min(
                                        TOTAL_TASKS,
                                        Math.max(
                                            0,
                                            Number(
                                                item.score || 0
                                            )
                                        )
                                    );


                                const completedTasks =
                                    Math.min(
                                        TOTAL_TASKS,
                                        Math.max(
                                            0,
                                            Number(
                                                item.completedTasks || 0
                                            )
                                        )
                                    );


                                const totalTasks =
                                    Math.max(
                                        TOTAL_TASKS,
                                        Number(
                                            item.totalTasks || TOTAL_TASKS
                                        )
                                    );


                                const percentage =
                                    Math.round(
                                        (
                                            completedTasks /
                                            totalTasks
                                        ) * 100
                                    );


                                const wrongCount =
                                    Math.max(
                                        0,
                                        completedTasks - score
                                    );


                                return (

                                    <article
                                        className={`adventure-card ${game.theme}`}
                                        key={item.id}
                                    >

                                        <div className="adventure-card-top">

                                            <div className="adventure-number">

                                                <span>
                                                    АВАНТУРА
                                                </span>

                                                <strong>
                                                    {item.pinNumber}
                                                </strong>

                                            </div>


                                            <div className="adventure-icon">
                                                {game.icon}
                                            </div>

                                        </div>


                                        <div className="adventure-card-title">

                                            <h3>
                                                {game.name}
                                            </h3>

                                            <p>
                                                {game.description}
                                            </p>

                                        </div>


                                        <div className="adventure-score">

                                            <div className="score-medal">

                                                <span>
                                                    ⭐
                                                </span>

                                                <strong>
                                                    {score}
                                                </strong>

                                                <small>
                                                    /10
                                                </small>

                                            </div>


                                            <div className="score-details">

                                                <div className="score-label-row">

                                                    <span>
                                                        Напредок
                                                    </span>

                                                    <strong>
                                                        {percentage}%
                                                    </strong>

                                                </div>


                                                <div className="beautiful-progress">

                                                    <div
                                                        style={{
                                                            width:
                                                                `${percentage}%`
                                                        }}
                                                    />

                                                </div>


                                                <span className="attempts">

                                                    🔄{" "}
                                                    {item.attempts || 0}{" "}
                                                    {(item.attempts || 0) === 1
                                                        ? "обид"
                                                        : "обиди"}

                                                </span>

                                            </div>

                                        </div>


                                        <div className="adventure-status">

                                            <div>

                                                {item.passed ? (

                                                    <>
                                                        <span className="status-check">
                                                            ✓
                                                        </span>

                                                        <div>

                                                            <strong>
                                                                Завршено!
                                                            </strong>

                                                            <small>
                                                                Успешно ја помина авантурата.
                                                            </small>

                                                        </div>
                                                    </>

                                                ) : (

                                                    <>
                                                        <span className="status-practice">
                                                            🌱
                                                        </span>

                                                        <div>

                                                            <strong>
                                                                Продолжи да вежбаш
                                                            </strong>

                                                            <small>
                                                                Ти требаат најмалку 8/10.
                                                            </small>

                                                        </div>
                                                    </>

                                                )}

                                            </div>

                                        </div>


                                        <div className="adventure-bottom">

                                            <span className="mistakes">

                                                {wrongCount === 0
                                                    ? "🎉 Без грешки"
                                                    : `💡 ${wrongCount} ${
                                                        wrongCount === 1
                                                            ? "грешка"
                                                            : "грешки"
                                                    }`
                                                }

                                            </span>


                                            <button
                                                className="review-button"
                                                onClick={() =>
                                                    openReview(item)
                                                }
                                            >

                                                <span>
                                                    🔍
                                                </span>

                                                Прегледај

                                            </button>

                                        </div>

                                    </article>
                                );
                            }
                        )}

                    </section>
                )}


            </main>


            {/* =========================
                REVIEW MODAL
            ========================= */}

            {selectedReview && (

                <div
                    className="review-overlay"
                    onClick={closeReview}
                >

                    <div
                        className="review-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <button
                            className="review-close"
                            onClick={closeReview}
                        >
                            ×
                        </button>


                        <div className="review-heading">

                            <div className="review-game-icon">

                                {
                                    gameData[
                                        selectedReview.gamesType
                                    ]?.icon || "🎮"
                                }

                            </div>


                            <div>

                                <span>
                                    АВАНТУРА{" "}
                                    {selectedReview.pinNumber}
                                </span>

                                <h2>
                                    {
                                        gameData[
                                            selectedReview.gamesType
                                        ]?.name || "Игра"
                                    }
                                </h2>

                            </div>

                        </div>


                        <div className="review-result">

                            <div>

                                <small>
                                    РЕЗУЛТАТ
                                </small>

                                <strong>
                                    {Math.min(
                                        10,
                                        Number(
                                            selectedReview.score || 0
                                        )
                                    )}/10
                                </strong>

                            </div>


                            <div>

                                <small>
                                    ПОГРЕШНИ
                                </small>

                                <strong>
                                    {Math.max(
                                        0,
                                        Number(
                                            selectedReview.completedTasks || 0
                                        ) -
                                        Number(
                                            selectedReview.score || 0
                                        )
                                    )}
                                </strong>

                            </div>

                        </div>


                        {selectedReview.wrongAnswers?.length > 0 ? (

                            <div className="mistakes-review">

                                <h3>
                                    Да ги разгледаме задачите 💡
                                </h3>

                                <p className="review-intro">
                                    Еве каде може уште малку да се вежба:
                                </p>


                                {selectedReview.wrongAnswers.map(
                                    (wrong, index) => (

                                        <div
                                            className="mistake-item"
                                            key={
                                                `${wrong.taskNumber}-${index}`
                                            }
                                        >

                                            <div className="mistake-number">
                                                {wrong.taskNumber}
                                            </div>


                                            <div className="mistake-content">

                                                <strong className="mistake-question">
                                                    {wrong.question}
                                                </strong>


                                                <div className="answer-box your-answer">

                                                    <span>
                                                        ✕
                                                    </span>

                                                    <div>

                                                        <small>
                                                            Твој одговор
                                                        </small>

                                                        <strong>
                                                            {
                                                                wrong.selectedAnswer
                                                            }
                                                        </strong>

                                                    </div>

                                                </div>


                                                <div className="answer-box right-answer">

                                                    <span>
                                                        ✓
                                                    </span>

                                                    <div>

                                                        <small>
                                                            Точен одговор
                                                        </small>

                                                        <strong>
                                                            {
                                                                wrong.correctAnswer
                                                            }
                                                        </strong>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        ) : (

                            <div className="perfect-review">

                                <div>
                                    {Number(selectedReview.score || 0) >= 8
                                        ? "🏆"
                                        : "📚"
                                    }
                                </div>

                                <h3>
                                    Резултатот е зачуван!
                                </h3>

                                <p>
                                    Зачувани се твојот резултат,
                                    бројот на решени задачи и напредокот
                                    на авантурата.
                                </p>

                                <p>
                                    Деталните избори од секоја задача
                                    во моментов не се зачувуваат во
                                    базата.
                                </p>

                            </div>

                        )}


                        <button
                            className="review-close-button"
                            onClick={closeReview}
                        >
                            ✓ Готово
                        </button>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Progress;