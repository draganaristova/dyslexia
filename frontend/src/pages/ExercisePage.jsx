import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/ExercisePage.css";

import ProfileButton from "../widgets/ProfileButton";
import HomeButton from "../widgets/HomeButton";
import LogoutButton from "../widgets/LogoutButton";
import Logo from "../widgets/Logo";

const API = "http://localhost:8080/api";


const GAME_INFO = {

    RECOGNIZE_SOUND: {
        name: "Препознај го гласот",
        icon: "🔊",
        color: "coral"
    },

    MEMORY: {
        name: "Меморија",
        icon: "🃏",
        color: "yellow"
    },

    RHYMES: {
        name: "Рими",
        icon: "🎵",
        color: "blue"
    },

    MISSING_LETTER: {
        name: "Најди ја буквата",
        icon: "🔤",
        color: "purple"
    },

    WORD_BUILDING: {
        name: "Состави го зборот",
        icon: "🧩",
        color: "green"
    },

    WHAT_CHANGED: {
        name: "Што се смени?",
        icon: "👀",
        color: "pink"
    }

};


const GAME_TYPES = [
    "RECOGNIZE_SOUND",
    "MEMORY",
    "RHYMES",
    "MISSING_LETTER",
    "WORD_BUILDING",
    "WHAT_CHANGED"
];


function ExercisePage() {

    const navigate = useNavigate();

    const {
        worldId,
        gamesId,
        gamesType,
        pinNumber
    } = useParams();


    const userId =
        localStorage.getItem("userId");

    const token =
        localStorage.getItem("token");


    const [exercise, setExercise] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [taskNumber, setTaskNumber] =
        useState(1);

    const [correctAnswers, setCorrectAnswers] =
        useState(0);

    const [selectedAnswer, setSelectedAnswer] =
        useState(null);

    const [answerState, setAnswerState] =
        useState(null);

    const [shuffledOptions, setShuffledOptions] =
        useState([]);

    const [finished, setFinished] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [games, setGames] =
        useState([]);

    const [wrongAnswers, setWrongAnswers] =
        useState([]);

    const [countdown, setCountdown] =
        useState(null);


    const timeoutRef =
        useRef(null);

    const intervalRef =
        useRef(null);


    const correctAnswersRef =
        useRef(0);


    const finishingRef =
        useRef(false);


    const gameInfo =
        GAME_INFO[gamesType] ||
        GAME_INFO.RECOGNIZE_SOUND;


    /*
     * =====================================================
     * CLEANUP
     * =====================================================
     */

    useEffect(() => {

        return () => {

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

        };

    }, []);


    /*
     * =====================================================
     * RESET WHEN GAME CHANGES
     * =====================================================
     */

    useEffect(() => {

        if (!userId || !token) {

            navigate("/login");

            return;
        }


        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }


        correctAnswersRef.current = 0;

        finishingRef.current = false;


        setTaskNumber(1);

        setCorrectAnswers(0);

        setSelectedAnswer(null);

        setAnswerState(null);

        setShuffledOptions([]);

        setFinished(false);

        setExercise(null);

        setWrongAnswers([]);

        setCountdown(null);


        loadExercise(1);

    }, [
        gamesId,
        gamesType,
        pinNumber
    ]);


    /*
     * =====================================================
     * LOAD GAMES
     * =====================================================
     */

    useEffect(() => {

        if (!worldId || !userId || !token) {
            return;
        }

        loadGames();

    }, [
        worldId,
        userId,
        token
    ]);


    const loadGames = async () => {

        try {

            const response = await fetch(
                `${API}/games/world/${worldId}?userId=${userId}`,
                {
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

                localStorage.removeItem("token");

                navigate("/login");

                return;
            }


            if (!response.ok) {
                return;
            }


            const data =
                await response.json();


            if (Array.isArray(data)) {

                const sorted =
                    [...data].sort(
                        (a, b) =>
                            (a.orderIndex || 0) -
                            (b.orderIndex || 0)
                    );


                setGames(
                    sorted.slice(0, 6)
                );
            }

        } catch (error) {

            console.error(
                "Games loading error:",
                error
            );
        }
    };


    /*
     * =====================================================
     * LOAD EXERCISE
     * =====================================================
     */

    const loadExercise = async (
        requestedTaskNumber = 1
    ) => {

        try {

            setLoading(true);

            setSelectedAnswer(null);

            setAnswerState(null);

            setCountdown(null);


            const response = await fetch(
                `${API}/exercises/${gamesId}/${gamesType}/${pinNumber}/${requestedTaskNumber}?userId=${userId}`,
                {
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

                localStorage.removeItem("token");

                navigate("/login");

                return;
            }


            if (!response.ok) {

                throw new Error(
                    `Exercise ${requestedTaskNumber} not found`
                );
            }


            const data =
                await response.json();


            setExercise(data);

            prepareOptions(data);

        } catch (error) {

            console.error(
                "Exercise error:",
                error
            );

            setExercise(null);

        } finally {

            setLoading(false);
        }
    };


    /*
     * =====================================================
     * PREPARE OPTIONS
     * =====================================================
     */

    const prepareOptions = (data) => {

        try {

            const content =
                typeof data.content === "string"
                    ? JSON.parse(data.content)
                    : data.content;


            const options =
                Array.isArray(content?.options)
                    ? [...content.options]
                    : [];


            for (
                let i = options.length - 1;
                i > 0;
                i--
            ) {

                const j =
                    Math.floor(
                        Math.random() *
                        (i + 1)
                    );


                [
                    options[i],
                    options[j]
                ] = [
                    options[j],
                    options[i]
                ];
            }


            setShuffledOptions(
                options
            );

        } catch (error) {

            console.error(
                "Options error:",
                error
            );

            setShuffledOptions([]);
        }
    };


    /*
     * =====================================================
     * GET CONTENT
     * =====================================================
     */

    const getContent = () => {

        if (!exercise) {
            return {};
        }


        try {

            return typeof exercise.content === "string"
                ? JSON.parse(exercise.content)
                : exercise.content;

        } catch {

            return {};
        }
    };


    /*
     * =====================================================
     * REVIEW QUESTION
     * =====================================================
     */

    const getReviewQuestion = (
        content,
        number
    ) => {

        if (content?.question) {
            return content.question;
        }


        if (content?.word) {
            return `Збор: ${content.word}`;
        }


        if (Array.isArray(content?.letters)) {
            return `Букви: ${content.letters.join(" ")}`;
        }


        return `Задача ${number}`;
    };


    /*
     * =====================================================
     * NEXT TASK COUNTDOWN
     * =====================================================
     */

    const startNextTaskCountdown = (
        isCorrect,
        currentTaskNumber,
        currentContent
    ) => {

        if (timeoutRef.current) {

            clearTimeout(
                timeoutRef.current
            );

            timeoutRef.current = null;
        }


        if (intervalRef.current) {

            clearInterval(
                intervalRef.current
            );

            intervalRef.current = null;
        }


        if (currentTaskNumber >= 10) {

            finishGame(
                isCorrect,
                currentContent,
                currentTaskNumber
            );

            return;
        }


        let secondsLeft = 10;


        setCountdown(
            secondsLeft
        );


        intervalRef.current =
            setInterval(() => {

                secondsLeft -= 1;


                if (secondsLeft <= 0) {

                    setCountdown(0);

                    clearInterval(
                        intervalRef.current
                    );

                    intervalRef.current = null;

                    return;
                }


                setCountdown(
                    secondsLeft
                );

            }, 1000);


        timeoutRef.current =
            setTimeout(() => {

                if (intervalRef.current) {

                    clearInterval(
                        intervalRef.current
                    );

                    intervalRef.current = null;
                }


                setCountdown(null);


                const nextTask =
                    currentTaskNumber + 1;


                setTaskNumber(
                    nextTask
                );


                loadExercise(
                    nextTask
                );

            }, 10000);
    };


    /*
     * =====================================================
     * ANSWER
     * =====================================================
     */

    const handleAnswer = (
        answer
    ) => {

        if (answerState !== null) {
            return;
        }


        if (saving || finished) {
            return;
        }


        const content =
            getContent();


        const isCorrect =
            String(answer) ===
            String(content.correctAnswer);


        /*
         * =================================================
         * DEBUG LOGGER
         * =================================================
         */

        console.log(
            "========== ANSWER DEBUG =========="
        );

        console.log(
            "Task:",
            taskNumber
        );

        console.log(
            "User answer:",
            answer
        );

        console.log(
            "User answer type:",
            typeof answer
        );

        console.log(
            "Correct answer:",
            content.correctAnswer
        );

        console.log(
            "Correct answer type:",
            typeof content.correctAnswer
        );

        console.log(
            "isCorrect:",
            isCorrect
        );

        console.log(
            "Score BEFORE:",
            correctAnswersRef.current
        );

        console.log(
            "Wrong answers BEFORE:",
            wrongAnswers
        );

        console.log(
            "Full content:",
            content
        );

        console.log(
            "==================================="
        );


        setSelectedAnswer(
            answer
        );


        /*
         * =================================================
         * ТОЧЕН ОДГОВОР
         * =================================================
         */

        if (isCorrect) {

            setAnswerState(
                "correct"
            );


            correctAnswersRef.current =
                Math.min(
                    10,
                    correctAnswersRef.current + 1
                );


            console.log(
                "✅ CORRECT -> SCORE AFTER:",
                correctAnswersRef.current
            );


            setCorrectAnswers(
                correctAnswersRef.current
            );

        }


        /*
         * =================================================
         * ПОГРЕШЕН ОДГОВОР
         * =================================================
         */

        else {

            setAnswerState(
                "wrong"
            );


            console.log(
                "❌ WRONG -> score stays:",
                correctAnswersRef.current
            );


            const wrongItem = {

                taskNumber:
                    taskNumber,

                question:
                    getReviewQuestion(
                        content,
                        taskNumber
                    ),

                selectedAnswer:
                    String(answer),

                correctAnswer:
                    String(
                        content.correctAnswer
                    )
            };


            console.log(
                "ADDING WRONG ANSWER:",
                wrongItem
            );


            setWrongAnswers(
                previous => [
                    ...previous,
                    wrongItem
                ]
            );
        }


        console.log(
            "Score AFTER ANSWER HANDLER:",
            correctAnswersRef.current
        );


        /*
         * Премини на countdown.
         */

        startNextTaskCountdown(
            isCorrect,
            taskNumber,
            content
        );
    };


    /*
     * =====================================================
     * FINISH GAME
     * =====================================================
     */

    const finishGame = async (
        lastAnswerCorrect,
        lastContent,
        lastTaskNumber
    ) => {

        if (
            saving ||
            finishingRef.current
        ) {

            return;
        }


        finishingRef.current = true;

        setSaving(true);


        /*
         * =================================================
         * FINISH DEBUG
         * =================================================
         */

        console.log(
            "===================================="
        );

        console.log(
            "🏁 FINISH GAME - BEFORE SCORE"
        );

        console.log(
            "Correct answers REF:",
            correctAnswersRef.current
        );

        console.log(
            "Correct answers STATE:",
            correctAnswers
        );

        console.log(
            "Wrong answers STATE:",
            wrongAnswers
        );

        console.log(
            "Wrong answers COUNT:",
            wrongAnswers.length
        );

        console.log(
            "Last answer correct:",
            lastAnswerCorrect
        );

        console.log(
            "Last task:",
            lastTaskNumber
        );

        console.log(
            "Last content:",
            lastContent
        );

        console.log(
            "===================================="
        );


        const finalScore =
            Math.min(
                10,
                Math.max(
                    0,
                    correctAnswersRef.current
                )
            );


        let finalWrongAnswers =
            [...wrongAnswers];


        if (!lastAnswerCorrect) {

            const alreadyExists =
                finalWrongAnswers.some(
                    item =>
                        Number(item.taskNumber) ===
                        Number(lastTaskNumber)
                );


            if (!alreadyExists) {

                finalWrongAnswers.push({

                    taskNumber:
                        lastTaskNumber,

                    question:
                        getReviewQuestion(
                            lastContent,
                            lastTaskNumber
                        ),

                    selectedAnswer:
                        String(
                            selectedAnswer
                        ),

                    correctAnswer:
                        String(
                            lastContent.correctAnswer
                        )
                });


                console.log(
                    "➕ LAST WRONG ANSWER ADDED:",
                    finalWrongAnswers
                );
            }
        }


        /*
         * =================================================
         * FINAL DEBUG
         * =================================================
         */

        console.log(
            "===================================="
        );

        console.log(
            "FINAL SCORE:",
            finalScore
        );

        console.log(
            "FINAL WRONG ANSWERS:",
            finalWrongAnswers
        );

        console.log(
            "FINAL WRONG COUNT:",
            finalWrongAnswers.length
        );

        console.log(
            "EXPECTED SCORE FROM WRONGS:",
            10 - finalWrongAnswers.length
        );

        console.log(
            "===================================="
        );


        /*
         * =================================================
         * SAVE TO BACKEND
         * =================================================
         */

        try {

            const response =
                await fetch(
                    `${API}/progress`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({

                            userId:
                                Number(userId),

                            gamesId:
                                Number(gamesId),

                            pinNumber:
                                Number(pinNumber),

                            levelNumber:
                                Number(pinNumber),

                            gamesType:
                                gamesType,

                            score:
                                finalScore,

                            wrongAnswers:
                                JSON.stringify(
                                    finalWrongAnswers
                                )
                        })
                    }
                );


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem(
                    "token"
                );

                navigate(
                    "/login"
                );

                return;
            }


            if (!response.ok) {

                const error =
                    await response.text();

                console.error(
                    "Progress error:",
                    error
                );

                throw new Error(
                    "Progress save failed"
                );
            }


            const result =
                await response.json();


            console.log(
                "Progress saved:",
                result
            );


            setCorrectAnswers(
                finalScore
            );


            setWrongAnswers(
                finalWrongAnswers
            );


            setFinished(
                true
            );

        } catch (error) {

            console.error(
                "Save progress error:",
                error
            );


            setCorrectAnswers(
                finalScore
            );


            setWrongAnswers(
                finalWrongAnswers
            );


            setFinished(
                true
            );

        } finally {

            setSaving(false);
        }
    };


    /*
     * =====================================================
     * RESTART
     * =====================================================
     */

    const restartGame = () => {

        if (timeoutRef.current) {

            clearTimeout(
                timeoutRef.current
            );

            timeoutRef.current = null;
        }


        if (intervalRef.current) {

            clearInterval(
                intervalRef.current
            );

            intervalRef.current = null;
        }


        correctAnswersRef.current = 0;

        finishingRef.current = false;


        setTaskNumber(1);

        setCorrectAnswers(0);

        setSelectedAnswer(null);

        setAnswerState(null);

        setShuffledOptions([]);

        setFinished(false);

        setExercise(null);

        setWrongAnswers([]);

        setCountdown(null);


        loadExercise(1);
    };


    /*
     * =====================================================
     * NAVIGATION
     * =====================================================
     */

    const goBackToWorld = () => {

        navigate(
            `/world/${worldId}`
        );
    };


    const goToProgress = () => {

        navigate(
            "/progress"
        );
    };


    const getNextGame = () => {

        const nextPin =
            Number(pinNumber) + 1;


        if (nextPin > 6) {
            return null;
        }


        if (games.length < nextPin) {
            return null;
        }


        const nextGame =
            games[nextPin - 1];


        if (!nextGame) {
            return null;
        }


        const nextType =
            GAME_TYPES[nextPin - 1];


        return {

            game:
                nextGame,

            type:
                nextType,

            pin:
                nextPin
        };
    };


    const goToNextLevel = () => {

        const next =
            getNextGame();


        if (!next) {

            navigate(
                `/world/${worldId}`
            );

            return;
        }


        navigate(
            `/world/${worldId}/exercise/${next.game.id}/${next.type}/${next.pin}`
        );
    };


    /*
     * =====================================================
     * HEADER
     * =====================================================
     */

    const GlobalHeader = () => (

        <header className="home-header">

            <Logo />

            <div className="nav-icons-row">

                <HomeButton />

                <LogoutButton />

                <ProfileButton />

            </div>

        </header>
    );


    /*
     * =====================================================
     * LOADING
     * =====================================================
     */

    if (loading) {

        return (
            <div className="exercise-page">

                <GlobalHeader />

                <div className="exercise-loading">

                    <div className="loading-icon">
                        {gameInfo.icon}
                    </div>

                    <h2>
                        Се подготвува играта...
                    </h2>

                    <p>
                        Само момент! 🌈
                    </p>

                </div>

            </div>
        );
    }


    /*
     * =====================================================
     * ERROR
     * =====================================================
     */

    if (!exercise) {

        return (
            <div className="exercise-page">

                <GlobalHeader />

                <div className="exercise-error">

                    <div>
                        😕
                    </div>

                    <h2>
                        Упс!
                    </h2>

                    <p>
                        Не успеавме да ја најдеме
                        оваа задача.
                    </p>

                    <button
                        onClick={
                            goBackToWorld
                        }
                    >
                        ← Назад кон патеката
                    </button>

                </div>

            </div>
        );
    }


    /*
     * =====================================================
     * FINISHED
     * =====================================================
     */

    if (finished) {

        const passed =
            correctAnswers >= 8;


        const mistakeCount =
            10 - correctAnswers;


        return (
            <div className="exercise-page">

                <GlobalHeader />


                <div
                    className={
                        `exercise-finished ${
                            passed
                                ? "finished-success"
                                : "finished-try"
                        }`
                    }
                >

                    <div className="finished-icon-wrapper">

                        <div className="finished-icon">

                            {passed
                                ? "🎉"
                                : "💪"}

                        </div>

                    </div>


                    <h1>

                        {passed
                            ? "Браво!"
                            : "Одличен обид!"}

                    </h1>


                    <p className="finished-message">

                        {passed
                            ? "Успешно ја заврши авантурата!"
                            : "Ти требаат најмалку 8 поени за да го отклучиш следното ниво."}

                    </p>


                    <div className="finished-score">

                        <span>
                            Твој резултат
                        </span>

                        <strong>
                            {correctAnswers}/10
                        </strong>

                    </div>


                    <div className="finished-mistakes">

                        <span>
                            Погрешни
                        </span>

                        <strong>
                            {mistakeCount}
                        </strong>

                    </div>


                    <div className="finished-buttons">

                        <button
                            className="finish-world-button"
                            onClick={
                                goBackToWorld
                            }
                        >
                            🗺️ Патека
                        </button>


                        <button
                            className="finish-progress-button"
                            onClick={
                                goToProgress
                            }
                        >
                            ⭐ Мој напредок
                        </button>


                        {!passed && (

                            <button
                                className="finish-next-button"
                                onClick={
                                    restartGame
                                }
                            >
                                🔄 Играј од почеток
                            </button>

                        )}


                        {passed && (

                            <button
                                className="finish-next-button"
                                onClick={
                                    goToNextLevel
                                }
                            >
                                Следна авантура →
                            </button>

                        )}

                    </div>

                </div>

            </div>
        );
    }


    /*
     * =====================================================
     * CURRENT TASK
     * =====================================================
     */

    const content =
        getContent();


    const question =
        content.question ||
        "Избери го точниот одговор.";


    const hasOptions =
        shuffledOptions.length > 0;


    return (
        <div className="exercise-page">

            <GlobalHeader />


            <div className="exercise-container">


                <div
                    className={
                        `exercise-topbar ${gameInfo.color}`
                    }
                >

                    <button
                        className="exercise-back"
                        onClick={
                            goBackToWorld
                        }
                    >
                        ←
                    </button>


                    <div className="game-title">

                        <span className="game-title-icon">
                            {gameInfo.icon}
                        </span>


                        <div>

                            <strong>
                                {gameInfo.name}
                            </strong>

                            <span>
                                Авантура {pinNumber}
                            </span>

                        </div>

                    </div>


                    <div className="task-counter">

                        {taskNumber}/10

                    </div>

                </div>


                <div className="exercise-progress">

                    <div
                        className="exercise-progress-fill"
                        style={{
                            width:
                                `${taskNumber * 10}%`
                        }}
                    />

                </div>


                <div className="exercise-card">

                    <div className="question-number">

                        Задача {taskNumber}

                    </div>


                    <h1 className="exercise-question">

                        {question}

                    </h1>


                    {content.emoji && (

                        <div className="exercise-emoji">

                            {content.emoji}

                        </div>

                    )}


                    {content.word && (

                        <div className="big-word">

                            {content.word}

                        </div>

                    )}


                    {content.letters && (

                        <div className="letters-display">

                            {content.letters.map(
                                (
                                    letter,
                                    index
                                ) => (

                                    <span
                                        key={index}
                                    >
                                        {letter}
                                    </span>

                                )
                            )}

                        </div>

                    )}


                    {hasOptions ? (

                        <div className="answer-grid">

                            {shuffledOptions.map(
                                (
                                    option,
                                    index
                                ) => {

                                    const isSelected =
                                        selectedAnswer ===
                                        option;


                                    let answerClass =
                                        "answer-option";


                                    if (
                                        isSelected &&
                                        answerState ===
                                            "correct"
                                    ) {

                                        answerClass +=
                                            " answer-correct";
                                    }


                                    if (
                                        isSelected &&
                                        answerState ===
                                            "wrong"
                                    ) {

                                        answerClass +=
                                            " answer-wrong";
                                    }


                                    return (

                                        <button
                                            key={
                                                `${option}-${index}`
                                            }
                                            className={
                                                answerClass
                                            }
                                            onClick={() =>
                                                handleAnswer(
                                                    option
                                                )
                                            }
                                            disabled={
                                                answerState !==
                                                null
                                            }
                                        >

                                            <span className="option-number">

                                                {String.fromCharCode(
                                                    65 + index
                                                )}

                                            </span>


                                            <span className="option-text">

                                                {option}

                                            </span>

                                        </button>

                                    );
                                }
                            )}

                        </div>

                    ) : (

                        <div className="no-options">

                            Нема достапни одговори.

                        </div>

                    )}


                    {answerState ===
                        "correct" && (

                        <div className="answer-feedback feedback-correct">

                            <span>
                                🎉
                            </span>


                            <div>

                                <strong>
                                    Точно!
                                </strong>


                                <p>
                                    Браво!
                                </p>

                            </div>

                        </div>
                    )}


                    {answerState ===
                        "wrong" && (

                        <div className="answer-feedback feedback-wrong">

                            <span>
                                💭
                            </span>


                            <div>

                                <strong>
                                    Неточно!
                                </strong>


                                <p>
                                    Точниот одговор е:{" "}
                                    <b>
                                        {content.correctAnswer}
                                    </b>
                                </p>

                            </div>

                        </div>
                    )}


                    {countdown !== null &&
                        countdown > 0 && (

                        <div className="next-task-countdown">

                            ⏳ Следна задача за{" "}

                            <strong>
                                {countdown}
                            </strong>{" "}

                            секунди...

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}


export default ExercisePage;
