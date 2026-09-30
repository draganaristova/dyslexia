import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/Progress.css";

import ProfileButton from "../widgets/ProfileButton";
import HomeButton from "../widgets/HomeButton";
import LogoutButton from "../widgets/LogoutButton";
import Logo from "../widgets/Logo";

const API = "http://localhost:8080/api";

const gameData = {
    RECOGNIZE_SOUND: {
        name: "Препознај го гласот",
        icon: "🔊",
        description: "Слушај внимателно и препознај го точниот глас.",
        theme: "sound"
    },

    MEMORY: {
        name: "Меморија",
        icon: "🃏",
        description: "Пронајди ги паровите и вежбај ја меморијата.",
        theme: "memory"
    },

    RHYMES: {
        name: "Рими",
        icon: "🎵",
        description: "Пронајди ги зборовите што се римуваат.",
        theme: "rhymes"
    },

    MISSING_LETTER: {
        name: "Најди ја буквата",
        icon: "🔤",
        description: "Откриј која буква недостасува.",
        theme: "letters"
    },

    WORD_BUILDING: {
        name: "Состави го зборот",
        icon: "🧩",
        description: "Состави го зборот од дадените букви.",
        theme: "words"
    },

    WHAT_CHANGED: {
        name: "Што се смени?",
        icon: "👀",
        description: "Внимавај добро и откриј што се променило.",
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

    const [loading, setLoading] =
        useState(true);

    const [selectedReview, setSelectedReview] =
        useState(null);


    useEffect(() => {

        if (!userId || !token) {

            navigate("/login");
            return;
        }

        loadProgress();

    }, [
        userId,
        token
    ]);


    const loadProgress = async () => {

        try {

            setLoading(true);

            const response = await fetch(
                `${API}/progress/user/${userId}`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem(
                    "token"
                );

                navigate("/login");
                return;
            }


            if (!response.ok) {

                throw new Error(
                    "Progress loading failed"
                );
            }


            const data =
                await response.json();


            if (Array.isArray(data)) {

                const sorted =
                    [...data].sort(
                        (a, b) =>
                            (a.pinNumber || 0) -
                            (b.pinNumber || 0)
                    );


                setProgress(
                    sorted
                );

            } else {

                setProgress([]);
            }

        } catch (error) {

            console.error(
                "Progress error:",
                error
            );

            setProgress([]);

        } finally {

            setLoading(false);
        }
    };


    /*
     * =====================================================
     * PARSE WRONG ANSWERS
     * =====================================================
     */

    const parseWrongAnswers = (item) => {

        if (!item?.wrongAnswers) {
            return [];
        }


        try {

            const result =
                typeof item.wrongAnswers === "string"
                    ? JSON.parse(
                        item.wrongAnswers
                    )
                    : item.wrongAnswers;


            return Array.isArray(result)
                ? result
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
     * =====================================================
     * LOADING
     * =====================================================
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
     * =====================================================
     * SUMMARY
     * =====================================================
     */

    const completedGames =
        progress.filter(
            item =>
                item.completed === true
        ).length;


    const totalScore =
        progress.reduce(
            (sum, item) =>
                sum +
                Math.min(
                    10,
                    Number(
                        item.score || 0
                    )
                ),
            0
        );


    const averageScore =
        progress.length > 0
            ? Math.round(
                totalScore /
                progress.length
            )
            : 0;


    return (

        <div className="progress-page">


            {/* HEADER */}

            <header className="home-header">

                <Logo />

                <div className="nav-icons-row">

                    <HomeButton />

                    <LogoutButton />

                    <ProfileButton />

                </div>

            </header>


            <main className="progress-main">


                {/* =================================================
                    HERO
                ================================================= */}

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


                {/* SUMMARY */}

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
                                {progress.length}
                            </strong>

                            <span>
                                одиграни авантури
                            </span>

                        </div>

                    </div>

                </section>


                {/* TITLE */}

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


                {/* EMPTY */}

                {progress.length === 0 ? (

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
                                navigate(
                                    "/world/1"
                                )
                            }
                        >
                            🎮 Започни ја авантурата
                        </button>

                    </section>

                ) : (

                    <section className="adventure-grid">

                        {progress.map(
                            (item) => {

                                const type =
                                    item.gamesType ||
                                    "RECOGNIZE_SOUND";


                                const game =
                                    gameData[type] ||
                                    gameData.RECOGNIZE_SOUND;


                                const score =
                                    Math.min(
                                        10,
                                        Math.max(
                                            0,
                                            Number(
                                                item.score || 0
                                            )
                                        )
                                    );


                                const total =
                                    Number(
                                        item.totalTasks || 10
                                    );


                                const percentage =
                                    Math.min(
                                        100,
                                        Math.round(
                                            (
                                                score /
                                                total
                                            ) * 100
                                        )
                                    );


                                const completed =
                                    item.completed === true;


                                const wrongAnswers =
                                    parseWrongAnswers(
                                        item
                                    );


                                return (

                                    <article
                                        className={
                                            `adventure-card ${game.theme}`
                                        }
                                        key={
                                            item.id ||
                                            `${item.gamesId}-${item.pinNumber}`
                                        }
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
                                                    {item.attempts || 1}{" "}
                                                    {(
                                                        item.attempts ||
                                                        1
                                                    ) === 1
                                                        ? "обид"
                                                        : "обиди"}

                                                </span>

                                            </div>

                                        </div>


                                        <div className="adventure-status">

                                            <div>

                                                {completed ? (

                                                    <>

                                                        <span className="status-check">
                                                            ✓
                                                        </span>

                                                        <div>

                                                            <strong>
                                                                Завршено!
                                                            </strong>

                                                            <small>
                                                                Следната авантура е отклучена.
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
                                                                Ти требаат 8/10 за отклучување.
                                                            </small>

                                                        </div>

                                                    </>

                                                )}

                                            </div>

                                        </div>


                                        <div className="adventure-bottom">

                                            <span className="mistakes">

                                                {wrongAnswers.length === 0
                                                    ? "🎉 Без грешки"
                                                    : `💡 ${wrongAnswers.length} ${
                                                        wrongAnswers.length === 1
                                                            ? "грешка"
                                                            : "грешки"
                                                    }`}

                                            </span>


                                            <button
                                                className="review-button"
                                                onClick={() =>
                                                    openReview(
                                                        item
                                                    )
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


            {/* =================================================
                REVIEW MODAL
            ================================================= */}

            {selectedReview && (

                <div
                    className="review-overlay"
                    onClick={
                        closeReview
                    }
                >

                    <div
                        className="review-modal"
                        onClick={
                            event =>
                                event.stopPropagation()
                        }
                    >

                        <button
                            className="review-close"
                            onClick={
                                closeReview
                            }
                        >
                            ×
                        </button>


                        <div className="review-heading">

                            <div className="review-game-icon">

                                {
                                    gameData[
                                        selectedReview.gamesType
                                    ]?.icon ||
                                    "🎮"
                                }

                            </div>


                            <div>

                                <span>
                                    АВАНТУРА{" "}
                                    {
                                        selectedReview.pinNumber
                                    }
                                </span>

                                <h2>
                                    {
                                        gameData[
                                            selectedReview.gamesType
                                        ]?.name ||
                                        "Игра"
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
                                    {
                                        Math.min(
                                            10,
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
                                            ?.length ||
                                        0
                                    }
                                </strong>

                            </div>

                        </div>


                        {(
                            selectedReview
                                .wrongAnswers
                                ?.length ||
                            0
                        ) === 0 ? (

                            <div className="perfect-review">

                                <div>
                                    🏆
                                </div>

                                <h3>
                                    Совршено!
                                </h3>

                                <p>
                                    Сите одговори се точни.
                                    Браво! 🎉
                                </p>

                            </div>

                        ) : (

                            <div className="mistakes-review">

                                <h3>
                                    Да ги разгледаме задачите 💡
                                </h3>

                                <p className="review-intro">
                                    Еве каде може уште малку
                                    да се вежба:
                                </p>


                                {selectedReview
                                    .wrongAnswers
                                    .map(
                                        (
                                            wrong,
                                            index
                                        ) => (

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

                        )}


                        <button
                            className="review-close-button"
                            onClick={
                                closeReview
                            }
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