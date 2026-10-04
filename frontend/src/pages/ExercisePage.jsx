import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/ExercisePage.css";

import Logo from "../widgets/Logo";
import HomeButton from "../widgets/HomeButton";
import LogoutButton from "../widgets/LogoutButton";
import ProfileButton from "../widgets/ProfileButton";
import { API } from "../data/api";

const TOTAL_TASKS = 10;
const TIME_PER_TASK = 10;

function ExercisePage() {
    const navigate = useNavigate();

    const {
        worldId,
        gamesId,
        gamesType,
        pinNumber
    } = useParams();

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const ageGroup =
        localStorage.getItem("ageGroup") || "AGE_5_7";

    const [exercise, setExercise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [taskNumber, setTaskNumber] = useState(1);
    const [countdown, setCountdown] =
        useState(TIME_PER_TASK);

    const [selectedAnswer, setSelectedAnswer] =
        useState(null);

    const [answered, setAnswered] =
        useState(false);

    const [wrongAnswers, setWrongAnswers] =
        useState([]);

    const [finished, setFinished] =
        useState(false);

    const intervalRef = useRef(null);
    const nextRef = useRef(null);

    const answeredRef = useRef(false);
    const correctCountRef = useRef(0);
    const wrongRef = useRef([]);

    const authHeaders = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    };

    /*
     * --------------------------------------------------
     * CLEAR TIMERS
     * --------------------------------------------------
     */

    const clearTimers = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (nextRef.current) {
            clearTimeout(nextRef.current);
            nextRef.current = null;
        }
    };

    /*
     * --------------------------------------------------
     * CLEANUP
     * --------------------------------------------------
     */

    useEffect(() => {
        return () => {
            clearTimers();
        };
    }, []);

    /*
     * --------------------------------------------------
     * LOAD ONE TASK
     * --------------------------------------------------
     */

    const loadExercise = async (number) => {
        try {
            setLoading(true);
            setError("");
            setExercise(null);

            answeredRef.current = false;

            setSelectedAnswer(null);
            setAnswered(false);

            const url =
                `${API}/exercises/` +
                `${gamesId}/` +
                `${gamesType}/` +
                `${pinNumber}/` +
                `${number}` +
                `?userId=${userId}`;

            console.log(
                "Loading exercise:",
                url
            );

            const response = await fetch(
                url,
                {
                    method: "GET",
                    headers: authHeaders
                }
            );

            if (
                response.status === 401 ||
                response.status === 403
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("userId");

                navigate("/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    "Не може да се вчита задачата."
                );
            }

            console.log(
                "Exercise loaded:",
                data
            );

            setExercise(data);

        } catch (err) {
            console.error(
                "Load exercise error:",
                err
            );

            setError(
                err.message ||
                "Не може да се вчита задачата."
            );

        } finally {
            setLoading(false);
        }
    };

    /*
     * --------------------------------------------------
     * START GAME
     * --------------------------------------------------
     */

    useEffect(() => {
        if (!userId || !token) {
            navigate("/login");
            return;
        }

        clearTimers();

        correctCountRef.current = 0;
        wrongRef.current = [];

        setWrongAnswers([]);
        setFinished(false);
        setTaskNumber(1);

        loadExercise(1);

        // intentionally only when game changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        gamesId,
        gamesType,
        pinNumber
    ]);

    /*
     * --------------------------------------------------
     * CONTENT
     * --------------------------------------------------
     */

    const getContent = () => {
        if (!exercise) {
            return {};
        }

        try {
            return typeof exercise.content === "string"
                ? JSON.parse(exercise.content)
                : exercise.content || {};
        } catch (err) {
            console.error(
                "Invalid exercise content:",
                err
            );

            return {};
        }
    };

    const content = getContent();

    const question =
        content.question ||
        "Одговори на прашањето";

    const answers =
        Array.isArray(content.options)
            ? content.options
            : [];

    const correctAnswer =
        content.answer ?? "";

    /*
     * --------------------------------------------------
     * SAVE TASK PROGRESS
     * --------------------------------------------------
     */

    const saveTaskProgress = async (isCorrect) => {
        if (!exercise) {
            return;
        }

        try {
            const response = await fetch(
                `${API}/exercise-progress`,
                {
                    method: "POST",
                    headers: authHeaders,

                    body: JSON.stringify({
                        userId: Number(userId),
                        exerciseId: Number(exercise.id),

                        score: isCorrect ? 1 : 0,

                        attempts: 1,

                        correct: isCorrect,

                        completed: true
                    })
                }
            );

            if (
                response.status === 401 ||
                response.status === 403
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("userId");

                navigate("/login");
                return;
            }

            if (!response.ok) {
                const data =
                    await response.json()
                        .catch(() => null);

                throw new Error(
                    data?.message ||
                    "Не може да се зачува напредокот."
                );
            }

            const data = await response.json();

            console.log(
                "Exercise progress saved:",
                data
            );

        } catch (err) {
            /*
             * Не ја прекинуваме играта ако
             * progress save не успее.
             */
            console.error(
                "Save progress error:",
                err
            );
        }
    };

    /*
     * --------------------------------------------------
     * HANDLE ANSWER
     * --------------------------------------------------
     */

    const handleAnswer = (
        answer,
        isTimeout = false
    ) => {
        if (
            answeredRef.current ||
            !exercise
        ) {
            return;
        }

        answeredRef.current = true;

        clearTimers();

        setAnswered(true);
        setSelectedAnswer(answer);

        const isCorrect =
            !isTimeout &&
            String(answer)
                .trim()
                .toLowerCase() ===
            String(correctAnswer)
                .trim()
                .toLowerCase();

        /*
         * CORRECT
         */

        if (isCorrect) {
            correctCountRef.current += 1;
        }

        /*
         * WRONG
         */

        if (!isCorrect) {
            const item = {
                taskNumber,
                question,

                userAnswer:
                    isTimeout
                        ? "Времето истече"
                        : String(answer),

                correctAnswer:
                    String(correctAnswer)
            };

            wrongRef.current = [
                ...wrongRef.current,
                item
            ];

            setWrongAnswers(
                wrongRef.current
            );
        }

        /*
         * SAVE TO DATABASE
         */

        saveTaskProgress(isCorrect);

        /*
         * NEXT TASK
         */

        nextRef.current = setTimeout(() => {
            if (taskNumber >= TOTAL_TASKS) {
                setFinished(true);
                return;
            }

            const nextTask =
                taskNumber + 1;

            setTaskNumber(nextTask);

            loadExercise(nextTask);

        }, 900);
    };

    /*
     * --------------------------------------------------
     * TIMER
     * --------------------------------------------------
     */

    useEffect(() => {
        if (
            loading ||
            !exercise ||
            answered ||
            finished
        ) {
            return;
        }

        let secondsLeft =
            TIME_PER_TASK;

        setCountdown(secondsLeft);

        intervalRef.current =
            setInterval(() => {
                secondsLeft -= 1;

                setCountdown(
                    Math.max(
                        0,
                        secondsLeft
                    )
                );

                if (secondsLeft <= 0) {
                    clearInterval(
                        intervalRef.current
                    );

                    intervalRef.current = null;

                    handleAnswer(
                        null,
                        true
                    );
                }

            }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(
                    intervalRef.current
                );

                intervalRef.current = null;
            }
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        exercise,
        loading,
        answered,
        finished
    ]);

    /*
     * --------------------------------------------------
     * BACK TO WORLD
     * --------------------------------------------------
     */

    const handleBack = () => {
        clearTimers();

        navigate(
            `/world/${worldId}`
        );
    };

    /*
     * --------------------------------------------------
     * RESTART
     * --------------------------------------------------
     */

    const restart = () => {
        clearTimers();

        correctCountRef.current = 0;
        wrongRef.current = [];

        setWrongAnswers([]);
        setFinished(false);
        setTaskNumber(1);

        loadExercise(1);
    };

    /*
     * --------------------------------------------------
     * HEADER
     * --------------------------------------------------
     */

    const Header = () => (
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
     * --------------------------------------------------
     * FINISHED
     * --------------------------------------------------
     */

    if (finished) {
        const score =
            correctCountRef.current;

        const passed =
            score >= 8;

        return (
            <div className="exercise-page">

                <Header />

                <main className="exercise-container">

                    <div
                        className={
                            `exercise-result ${
                                passed
                                    ? "result-success"
                                    : "result-failed"
                            }`
                        }
                    >

                        <div className="result-icon">
                            {passed
                                ? "🎉"
                                : "💪"}
                        </div>

                        <h1>
                            {passed
                                ? "Браво!"
                                : "Одличен обид!"}
                        </h1>

                        <p>
                            {passed
                                ? "Успешно ја заврши мисијата!"
                                : "Обиди се повторно за да ја завршиш мисијата."}
                        </p>

                        <div className="result-score">
                            {score}/{TOTAL_TASKS}
                        </div>

                        <div className="result-stats">

                            <div>
                                <strong>
                                    {score}
                                </strong>

                                <span>
                                    ТОЧНИ
                                </span>
                            </div>

                            <div>
                                <strong>
                                    {wrongAnswers.length}
                                </strong>

                                <span>
                                    ПОГРЕШНИ
                                </span>
                            </div>

                        </div>

                        {wrongAnswers.length > 0 && (
                            <div className="wrong-review">

                                <h2>
                                    Преглед на грешките
                                </h2>

                                {wrongAnswers.map(
                                    (item, index) => (
                                        <div
                                            className="wrong-review-item"
                                            key={`${item.taskNumber}-${index}`}
                                        >

                                            <strong>
                                                Задача{" "}
                                                {item.taskNumber}
                                            </strong>

                                            <div>
                                                {item.question}
                                            </div>

                                            <div className="review-answer wrong">
                                                Твој одговор:{" "}
                                                {item.userAnswer}
                                            </div>

                                            <div className="review-answer correct">
                                                Точен одговор:{" "}
                                                {item.correctAnswer}
                                            </div>

                                        </div>
                                    )
                                )}

                            </div>
                        )}

                        <div className="result-buttons">

                            <button
                                className="continue-btn"
                                onClick={handleBack}
                            >
                                🗺️ Патека
                            </button>

                            {!passed && (
                                <button
                                    className="continue-btn"
                                    onClick={restart}
                                >
                                    🔄 Обиди се повторно
                                </button>
                            )}

                        </div>

                    </div>

                </main>

            </div>
        );
    }

    /*
     * --------------------------------------------------
     * ERROR
     * --------------------------------------------------
     */

    if (error) {
        return (
            <div className="exercise-page">

                <Header />

                <main className="exercise-container">

                    <button
                        className="back-btn"
                        onClick={handleBack}
                    >
                        ← Назад
                    </button>

                    <div className="exercise-error">

                        <div className="loading-icon">
                            ⚠️
                        </div>

                        <h2>
                            Се појави проблем
                        </h2>

                        <p>
                            {error}
                        </p>

                        <button
                            onClick={() =>
                                loadExercise(taskNumber)
                            }
                        >
                            Обиди се повторно
                        </button>

                    </div>

                </main>

            </div>
        );
    }

    /*
     * --------------------------------------------------
     * LOADING
     * --------------------------------------------------
     */

    if (
        loading ||
        !exercise
    ) {
        return (
            <div className="exercise-page">

                <Header />

                <main className="exercise-container">

                    <button
                        className="back-btn"
                        onClick={handleBack}
                    >
                        ← Назад
                    </button>

                    <div className="exercise-loading">

                        <div className="loading-icon">
                            🧩
                        </div>

                        <h2>
                            Се вчитува задачата...
                        </h2>

                        <p>
                            Подготви се за следниот предизвик!
                        </p>

                    </div>

                </main>

            </div>
        );
    }

    /*
     * --------------------------------------------------
     * MAIN GAME
     * --------------------------------------------------
     */

    return (
        <div className="exercise-page">

            <Header />

            <main className="exercise-container">

                <div className="exercise-top">

                    <button
                        className="back-btn"
                        onClick={handleBack}
                    >
                        ← Назад
                    </button>

                    <div className="exercise-task-number">
                        Задача{" "}
                        {taskNumber}/{TOTAL_TASKS}
                    </div>

                    <div className="exercise-timer">
                        ⏱️ {countdown}
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
                        МИСИЈА {pinNumber}
                    </div>

                    <h2>
                        {question}
                    </h2>

                    {answers.length > 0 ? (

                        <div className="exercise-answers">

                            {answers.map(
                                (answer, index) => {

                                    const isSelected =
                                        selectedAnswer === answer;

                                    const isCorrect =
                                        answered &&
                                        String(answer)
                                            .trim()
                                            .toLowerCase() ===
                                        String(correctAnswer)
                                            .trim()
                                            .toLowerCase();

                                    const isWrongSelected =
                                        answered &&
                                        isSelected &&
                                        !isCorrect;

                                    return (
                                        <button
                                            key={`${answer}-${index}`}
                                            className={
                                                "exercise-answer" +
                                                (isSelected
                                                    ? " selected"
                                                    : "") +
                                                (isCorrect
                                                    ? " correct"
                                                    : "") +
                                                (isWrongSelected
                                                    ? " wrong"
                                                    : "")
                                            }
                                            disabled={answered}
                                            onClick={() =>
                                                handleAnswer(
                                                    answer
                                                )
                                            }
                                        >
                                            {answer}
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

                </div>

            </main>

        </div>
    );
}

export default ExercisePage;