import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/Progress.css";

import ProfileButton from "../widgets/ProfileButton";
import HomeButton from "../widgets/HomeButton";
import LogoutButton from "../widgets/LogoutButton";
import Logo from "../widgets/Logo";

import { API } from "../data/api";

const TOTAL_TASKS = 10;


/*
 * ==================================================
 * GAME DATA
 * ==================================================
 */

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


/*
 * ==================================================
 * COMPONENT
 * ==================================================
 */

function Progress() {

    const navigate = useNavigate();

    const userId =
        localStorage.getItem("userId");

    const token =
        localStorage.getItem("token");

    const userName =
        localStorage.getItem("userName") ||
        "детето";


    /*
     * ==================================================
     * STATE
     * ==================================================
     */

    const [progress, setProgress] =
        useState([]);

    const [summary, setSummary] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [selectedReview, setSelectedReview] =
        useState(null);


    /*
     * ==================================================
     * LOAD PROGRESS
     * ==================================================
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


                /*
                 * ------------------------------------------
                 * TASK PROGRESS
                 * ------------------------------------------
                 */

                const progressResponse =
                    await fetch(
                        `${API}/exercise-progress/user/${userId}`,
                        {
                            method: "GET",
                            headers
                        }
                    );


                /*
                 * ------------------------------------------
                 * SUMMARY
                 * ------------------------------------------
                 */

                const summaryResponse =
                    await fetch(
                        `${API}/exercise-progress/user/${userId}/summary`,
                        {
                            method: "GET",
                            headers
                        }
                    );


                /*
                 * ------------------------------------------
                 * AUTH
                 * ------------------------------------------
                 */

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


                /*
                 * ------------------------------------------
                 * READ PROGRESS
                 * ------------------------------------------
                 */

                const progressData =
                    progressResponse.ok
                        ? await progressResponse.json()
                        : [];


                /*
                 * ------------------------------------------
                 * READ SUMMARY
                 * ------------------------------------------
                 */

                const summaryData =
                    summaryResponse.ok
                        ? await summaryResponse.json()
                        : [];


                /*
                 * ------------------------------------------
                 * NORMALIZE
                 * ------------------------------------------
                 */

                const normalizedProgress =
                    Array.isArray(progressData)
                        ? progressData
                        : [];


                const normalizedSummary =
                    Array.isArray(summaryData)
                        ? summaryData
                        : [];


                setProgress(
                    normalizedProgress
                );


                setSummary(
                    normalizedSummary
                );


                /*
                 * ------------------------------------------
                 * DEBUG
                 * ------------------------------------------
                 */

                console.log(
                    "================================="
                );

                console.log(
                    "PROGRESS FROM BACKEND:"
                );

                console.log(
                    normalizedProgress
                );

                console.log(
                    "SUMMARY FROM BACKEND:"
                );

                console.log(
                    normalizedSummary
                );

                console.log(
                    "================================="
                );


            } catch (error) {

                console.error(
                    "Progress loading error:",
                    error
                );

                setProgress([]);

                setSummary([]);

            } finally {

                setLoading(false);

            }

        };


        loadProgress();

    }, [
        userId,
        token,
        navigate
    ]);


    /*
     * ==================================================
     * NORMALIZE ATTEMPT
     * ==================================================
     *
     * Ова е многу важно.
     *
     * Backend може да врати:
     *
     * 1. attemptHistory
     *
     * или:
     *
     * 2. директно:
     *    question
     *    selectedAnswer
     *    correctAnswer
     *    correct
     *
     * Овој код ги поддржува и двата случаи.
     */

    const normalizeAttempt = (
        attempt,
        task,
        fallbackAttemptNumber = 1
    ) => {

        if (!attempt) {
            return null;
        }


        const correct =
            attempt.correct === true ||
            attempt.correct === "true";


        return {

            taskNumber:
                attempt.taskNumber ??
                task.taskNumber ??
                0,

            attemptNumber:
                attempt.attemptNumber ??
                fallbackAttemptNumber,

            question:
                attempt.question ??
                task.question ??
                "Задачата",

            selectedAnswer:
                attempt.selectedAnswer ??
                attempt.answer ??
                task.selectedAnswer ??
                "Нема одговор",

            correctAnswer:
                attempt.correctAnswer ??
                task.correctAnswer ??
                "Нема податок",

            correct,

            attemptedAt:
                attempt.attemptedAt ??
                attempt.createdAt ??
                task.attemptedAt ??
                task.createdAt ??
                null,

            timedOut:
                attempt.timedOut === true ||
                attempt.timedOut === "true"

        };

    };


    /*
     * ==================================================
     * GET ATTEMPTS FROM TASK
     * ==================================================
     */

    const getTaskAttempts = (task) => {

        /*
         * ------------------------------------------
         * CASE 1
         * Backend враќа attemptHistory
         * ------------------------------------------
         */

        if (
            Array.isArray(
                task.attemptHistory
            )
        ) {

            return task.attemptHistory
                .map(
                    (attempt, index) =>
                        normalizeAttempt(
                            attempt,
                            task,
                            index + 1
                        )
                )
                .filter(Boolean);

        }


        /*
         * ------------------------------------------
         * CASE 2
         * Backend враќа attempts како ARRAY
         * ------------------------------------------
         */

        if (
            Array.isArray(
                task.attempts
            )
        ) {

            return task.attempts
                .map(
                    (attempt, index) =>
                        normalizeAttempt(
                            attempt,
                            task,
                            index + 1
                        )
                )
                .filter(Boolean);

        }


        /*
         * ------------------------------------------
         * CASE 3
         * Backend враќа еден директен запис
         *
         * question
         * selectedAnswer
         * correctAnswer
         * correct
         * ------------------------------------------
         */

        if (

            task.question !== undefined ||
            task.selectedAnswer !== undefined ||
            task.correctAnswer !== undefined

        ) {

            const attempt =
                normalizeAttempt(
                    task,
                    task,
                    1
                );


            return attempt
                ? [attempt]
                : [];

        }


        /*
         * ------------------------------------------
         * NOTHING
         * ------------------------------------------
         */

        return [];

    };


    /*
     * ==================================================
     * CREATE ADVENTURES
     * ==================================================
     */

    const adventures = useMemo(() => {

        const grouped = {};


        /*
         * ==================================================
         * GROUP PROGRESS BY ADVENTURE
         * ==================================================
         */

        progress.forEach((item) => {

            const key =
                `${item.gamesId}-${item.gamesType}-${item.pinNumber}`;


            if (!grouped[key]) {

                grouped[key] = {

                    gamesId:
                        item.gamesId,

                    gamesType:
                        item.gamesType,

                    pinNumber:
                        item.pinNumber,

                    tasks: [],

                    attempts: 0

                };

            }


            grouped[key].tasks.push(item);


            /*
             * Ако backend има attempts како број
             */

            if (
                typeof item.attempts === "number"
            ) {

                grouped[key].attempts +=
                    item.attempts;

            }

            /*
             * Ако има attemptHistory
             */

            else if (
                Array.isArray(
                    item.attemptHistory
                )
            ) {

                grouped[key].attempts +=
                    item.attemptHistory.length;

            }

            /*
             * Инаку еден запис = еден обид
             */

            else {

                grouped[key].attempts += 1;

            }

        });


        /*
         * ==================================================
         * CREATE FROM SUMMARY
         * ==================================================
         */

        const result =
            summary.map((item) => {

                const key =
                    `${item.gamesId}-${item.gamesType}-${item.pinNumber}`;


                const group =
                    grouped[key];


                /*
                 * ------------------------------------------
                 * ALL ATTEMPTS
                 * ------------------------------------------
                 */

                const allAttempts =
                    group?.tasks
                        ?.flatMap((task) =>
                            getTaskAttempts(task)
                        )
                        || [];


                /*
                 * ------------------------------------------
                 * WRONG ATTEMPTS
                 * ------------------------------------------
                 */

                const wrongAnswers =
                    allAttempts
                        .filter(
                            (attempt) =>
                                attempt.correct === false
                        )
                        .sort((a, b) => {

                            const taskCompare =
                                Number(
                                    a.taskNumber || 0
                                ) -
                                Number(
                                    b.taskNumber || 0
                                );


                            if (
                                taskCompare !== 0
                            ) {

                                return taskCompare;

                            }


                            return (
                                Number(
                                    a.attemptNumber || 0
                                ) -
                                Number(
                                    b.attemptNumber || 0
                                )
                            );

                        });


                /*
                 * ------------------------------------------
                 * COMPLETED TASKS
                 * ------------------------------------------
                 */

                let completedTasks =
                    Number(
                        item.completedTasks || 0
                    );


                /*
                 * Ако summary нема completedTasks,
                 * пресметај од progress.
                 */

                if (
                    completedTasks === 0 &&
                    group?.tasks
                ) {

                    const completedTaskNumbers =
                        new Set(

                            group.tasks
                                .filter(
                                    (task) =>
                                        task.completed === true
                                )
                                .map(
                                    (task) =>
                                        task.taskNumber
                                )

                        );


                    completedTasks =
                        completedTaskNumbers.size;

                }


                /*
                 * ------------------------------------------
                 * TOTAL TASKS
                 * ------------------------------------------
                 */

                const totalTasks =
                    Number(
                        item.totalTasks ||
                        TOTAL_TASKS
                    );


                /*
                 * ------------------------------------------
                 * SCORE
                 * ------------------------------------------
                 */

                const score =
                    Number(
                        item.score || 0
                    );


                return {

                    id: key,

                    gamesId:
                        item.gamesId,

                    gamesType:
                        item.gamesType,

                    pinNumber:
                        item.pinNumber,

                    completedTasks,

                    totalTasks,

                    score,

                    passed:
                        item.passed === true,

                    completed:
                        item.completed === true,

                    attempts:
                        group?.attempts || 0,

                    wrongAnswers,

                    allAttempts

                };

            });


        /*
         * ==================================================
         * ADD GROUPS NOT PRESENT IN SUMMARY
         * ==================================================
         */

        Object.values(grouped)
            .forEach((group) => {

                const exists =
                    result.some((item) => {

                        return (

                            Number(item.gamesId) ===
                                Number(group.gamesId) &&

                            item.gamesType ===
                                group.gamesType &&

                            Number(item.pinNumber) ===
                                Number(group.pinNumber)

                        );

                    });


                if (exists) {
                    return;
                }


                /*
                 * ------------------------------------------
                 * UNIQUE COMPLETED TASKS
                 * ------------------------------------------
                 */

                const uniqueTaskNumbers =
                    new Set(

                        group.tasks
                            .filter(
                                (task) =>
                                    task.completed === true
                            )
                            .map(
                                (task) =>
                                    task.taskNumber
                            )

                    );


                /*
                 * ------------------------------------------
                 * SCORE
                 * ------------------------------------------
                 */

                const score =
                    group.tasks.filter(
                        (task) =>
                            task.completed === true &&
                            task.correct === true
                    ).length;


                /*
                 * ------------------------------------------
                 * COMPLETED
                 * ------------------------------------------
                 */

                const completed =
                    uniqueTaskNumbers.size >=
                    TOTAL_TASKS;


                /*
                 * ------------------------------------------
                 * ALL ATTEMPTS
                 * ------------------------------------------
                 */

                const allAttempts =
                    group.tasks
                        .flatMap((task) =>
                            getTaskAttempts(task)
                        );


                /*
                 * ------------------------------------------
                 * WRONG
                 * ------------------------------------------
                 */

                const wrongAnswers =
                    allAttempts
                        .filter(
                            (attempt) =>
                                attempt.correct === false
                        )
                        .sort((a, b) => {

                            const taskCompare =
                                Number(
                                    a.taskNumber || 0
                                ) -
                                Number(
                                    b.taskNumber || 0
                                );


                            if (
                                taskCompare !== 0
                            ) {

                                return taskCompare;

                            }


                            return (
                                Number(
                                    a.attemptNumber || 0
                                ) -
                                Number(
                                    b.attemptNumber || 0
                                )
                            );

                        });


                /*
                 * ------------------------------------------
                 * ADD
                 * ------------------------------------------
                 */

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
                        uniqueTaskNumbers.size,

                    totalTasks:
                        TOTAL_TASKS,

                    score,

                    passed:
                        completed &&
                        score >= 8,

                    completed,

                    attempts:
                        group.attempts,

                    wrongAnswers,

                    allAttempts

                });

            });


        /*
         * ==================================================
         * SORT
         * ==================================================
         */

        return result.sort(
            (a, b) =>
                Number(
                    a.pinNumber || 0
                ) -
                Number(
                    b.pinNumber || 0
                )
        );

    }, [progress, summary]);


    /*
     * ==================================================
     * SUMMARY NUMBERS
     * ==================================================
     */

    const completedGames =
        adventures.filter(
            (item) =>
                item.completed === true
        ).length;


    const totalScore =
        adventures.reduce(
            (sum, item) => {

                return (

                    sum +

                    Math.min(
                        TOTAL_TASKS,
                        Math.max(
                            0,
                            Number(
                                item.score || 0
                            )
                        )
                    )

                );

            },
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
     * ==================================================
     * OPEN REVIEW
     * ==================================================
     */

    const openReview = (item) => {

        console.log(
            "Opening review:",
            item
        );

        setSelectedReview(item);

    };


    /*
     * ==================================================
     * CLOSE REVIEW
     * ==================================================
     */

    const closeReview = () => {

        setSelectedReview(null);

    };


    /*
     * ==================================================
     * LOADING
     * ==================================================
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
     * ==================================================
     * MAIN PAGE
     * ==================================================
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


                {/* ==========================================
                    HERO
                ========================================== */}

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


                {/* ==========================================
                    SUMMARY
                ========================================== */}

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


                {/* ==========================================
                    TITLE
                ========================================== */}

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


                {/* ==========================================
                    EMPTY
                ========================================== */}

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

                        {adventures.map((item) => {

                            const game =
                                gameData[
                                    item.gamesType
                                ];


                            /*
                             * Ако gamesType не постои
                             * во gameData, прескокни.
                             */

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
                                            item.completedTasks ||
                                            0
                                        )
                                    )
                                );


                            const totalTasks =
                                Math.max(
                                    TOTAL_TASKS,
                                    Number(
                                        item.totalTasks ||
                                        TOTAL_TASKS
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
                                item.wrongAnswers?.length ||
                                Math.max(
                                    0,
                                    completedTasks -
                                    score
                                );


                            return (

                                <article
                                    className={
                                        `adventure-card ${game.theme}`
                                    }
                                    key={item.id}
                                >


                                    {/* ======================================
                                        CARD TOP
                                    ====================================== */}

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


                                    {/* ======================================
                                        TITLE
                                    ====================================== */}

                                    <div className="adventure-card-title">

                                        <h3>
                                            {game.name}
                                        </h3>

                                        <p>
                                            {game.description}
                                        </p>

                                    </div>


                                    {/* ======================================
                                        SCORE
                                    ====================================== */}

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

                                                {
                                                    item.attempts || 0
                                                }{" "}

                                                {
                                                    (item.attempts || 0) === 1
                                                        ? "обид"
                                                        : "обиди"
                                                }

                                            </span>

                                        </div>

                                    </div>


                                    {/* ======================================
                                        STATUS
                                    ====================================== */}

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
                                                            Успешно ја помина
                                                            авантурата.
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
                                                            Ти требаат најмалку
                                                            8/10.
                                                        </small>

                                                    </div>

                                                </>

                                            )}

                                        </div>

                                    </div>


                                    {/* ======================================
                                        BOTTOM
                                    ====================================== */}

                                    <div className="adventure-bottom">

                                        <span className="mistakes">

                                            {
                                                wrongCount === 0

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

                        })}

                    </section>

                )}


            </main>


            {/* ==================================================
                REVIEW MODAL
            ================================================== */}

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


                        {/* ==========================================
                            CLOSE
                        ========================================== */}

                        <button
                            className="review-close"
                            onClick={closeReview}
                        >
                            ×
                        </button>


                        {/* ==========================================
                            HEADER
                        ========================================== */}

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


                        {/* ==========================================
                            RESULT
                        ========================================== */}

                        <div className="review-result">

                            <div>

                                <small>
                                    РЕЗУЛТАТ
                                </small>

                                <strong>
                                    {
                                        Math.min(
                                            TOTAL_TASKS,
                                            Number(
                                                selectedReview.score ||
                                                0
                                            )
                                        )
                                    }/10
                                </strong>

                            </div>


                            <div>

                                <small>
                                    ПОГРЕШНИ
                                </small>

                                <strong>
                                    {
                                        selectedReview
                                            .wrongAnswers
                                            ?.length || 0
                                    }
                                </strong>

                            </div>

                        </div>


                        {/* ==================================================
                            WRONG ANSWERS / ATTEMPTS
                        ================================================== */}

                        {
                            selectedReview.wrongAnswers &&
                            selectedReview.wrongAnswers.length > 0
                                ? (

                                    <div className="mistakes-review">

                                        <h3>
                                            Да ги разгледаме задачите 💡
                                        </h3>

                                        <p className="review-intro">
                                            Еве ги задачите каде што
                                            детето направило грешка:
                                        </p>


                                        {
                                            selectedReview
                                                .wrongAnswers
                                                .map(
                                                    (wrong, index) => (

                                                        <div
                                                            className="mistake-item"
                                                            key={
                                                                `${wrong.taskNumber}-${wrong.attemptNumber}-${index}`
                                                            }
                                                        >


                                                            {/* NUMBER */}

                                                            <div className="mistake-number">

                                                                {wrong.taskNumber}

                                                            </div>


                                                            {/* CONTENT */}

                                                            <div className="mistake-content">


                                                                {/* QUESTION */}

                                                                <strong className="mistake-question">

                                                                    {
                                                                        wrong.question ||
                                                                        "Задачата"
                                                                    }

                                                                </strong>


                                                                {/* ATTEMPT */}

                                                                {
                                                                    wrong.attemptNumber && (

                                                                        <div
                                                                            style={{
                                                                                marginBottom:
                                                                                    "10px",
                                                                                fontSize:
                                                                                    "13px",
                                                                                opacity:
                                                                                    0.7
                                                                            }}
                                                                        >
                                                                            Обид{" "}
                                                                            {
                                                                                wrong.attemptNumber
                                                                            }
                                                                        </div>

                                                                    )
                                                                }


                                                                {/* DATE */}

                                                                {
                                                                    wrong.attemptedAt && (

                                                                        <div
                                                                            style={{
                                                                                marginBottom:
                                                                                    "10px",
                                                                                fontSize:
                                                                                    "12px",
                                                                                opacity:
                                                                                    0.65
                                                                            }}
                                                                        >

                                                                            {
                                                                                new Date(
                                                                                    wrong.attemptedAt
                                                                                ).toLocaleString(
                                                                                    "mk-MK"
                                                                                )
                                                                            }

                                                                        </div>

                                                                    )
                                                                }


                                                                {/* USER ANSWER */}

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
                                                                                wrong.selectedAnswer ||
                                                                                "Нема одговор"
                                                                            }

                                                                        </strong>

                                                                    </div>

                                                                </div>


                                                                {/* CORRECT ANSWER */}

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
                                                                                wrong.correctAnswer ||
                                                                                "Нема податок"
                                                                            }

                                                                        </strong>

                                                                    </div>

                                                                </div>

                                                            </div>

                                                        </div>

                                                    )
                                                )
                                        }

                                    </div>

                                )

                                : (

                                    <div className="perfect-review">

                                        <div>
                                            {
                                                Number(
                                                    selectedReview.score ||
                                                    0
                                                ) >= 8
                                                    ? "🏆"
                                                    : "📚"
                                            }
                                        </div>


                                        <h3>

                                            {
                                                Number(
                                                    selectedReview.score ||
                                                    0
                                                ) >= 8

                                                    ? "Одлична работа!"

                                                    : "Нема зачувани обиди"
                                            }

                                        </h3>


                                        <p>

                                            {
                                                Number(
                                                    selectedReview.score ||
                                                    0
                                                ) >= 8

                                                    ? "Нема погрешни одговори во оваа авантура."

                                                    : "За оваа авантура сè уште нема зачувана историја на задачите."
                                            }

                                        </p>

                                    </div>

                                )
                        }


                        {/* ==================================================
                            CLOSE BUTTON
                        ================================================== */}

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