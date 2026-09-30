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

    const [exercise, setExercise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [taskNumber, setTaskNumber] = useState(1);
    const [countdown, setCountdown] = useState(TIME_PER_TASK);

    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answered, setAnswered] = useState(false);

    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [wrongAnswers, setWrongAnswers] = useState([]);

    const [finished, setFinished] = useState(false);
    const [saving, setSaving] = useState(false);

    const intervalRef = useRef(null);
    const timeoutRef = useRef(null);
    const wrongAnswersRef = useRef([]);
    const finishingRef = useRef(false);

    /*
     * ---------------------------------------------------------
     * LOAD EXERCISE
     * ---------------------------------------------------------
     */

    const loadExercise = async (currentTaskNumber) => {
        try {
            setLoading(true);
            setError("");
            setExercise(null);

            const url =
                `${API}/exercises/` +
                `${gamesId}/` +
                `${gamesType}/` +
                `${pinNumber}/` +
                `${currentTaskNumber}` +
                `?userId=${userId}`;

            console.log("FETCH EXERCISE:", url);

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            console.log("EXERCISE RESPONSE STATUS:", response.status);

            const data = await response.json();

            console.log("FULL EXERCISE:", data);
            console.log("EXERCISE CONTENT:", data?.content);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    "Не може да се вчита задачата."
                );
            }

            setExercise(data);

        } catch (err) {
            console.error("EXERCISE LOAD ERROR:", err);

            setError(
                err.message ||
                "Не може да се вчита задачата."
            );
        } finally {
            setLoading(false);
        }
    };

    /*
     * ---------------------------------------------------------
     * LOAD FIRST / NEXT TASK
     * ---------------------------------------------------------
     */

    useEffect(() => {
        if (!gamesId || !gamesType || !pinNumber || !userId) {
            setError("Недостасуваат податоци за задачата.");
            setLoading(false);
            return;
        }

        loadExercise(taskNumber);
    }, [
        gamesId,
        gamesType,
        pinNumber,
        taskNumber
    ]);

    /*
     * ---------------------------------------------------------
     * TIMER
     * ---------------------------------------------------------
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

        setCountdown(TIME_PER_TASK);

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        let secondsLeft = TIME_PER_TASK;

        intervalRef.current = setInterval(() => {
            secondsLeft -= 1;

            if (secondsLeft >= 0) {
                setCountdown(secondsLeft);
            }

            if (secondsLeft <= 0) {
                clearInterval(intervalRef.current);
            }
        }, 1000);

        timeoutRef.current = setTimeout(() => {
            clearInterval(intervalRef.current);

            if (!answered && !finishingRef.current) {
                handleAnswer(null, true);
            }
        }, TIME_PER_TASK * 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [
        exercise,
        loading,
        answered,
        finished,
        taskNumber
    ]);

    /*
     * ---------------------------------------------------------
     * HELPERS
     * ---------------------------------------------------------
     */

    const getContent = () => {
        if (!exercise) {
            return {};
        }

        if (typeof exercise.content === "string") {
            try {
                return JSON.parse(exercise.content);
            } catch (e) {
                console.error(
                    "CONTENT JSON PARSE ERROR:",
                    e
                );

                return {};
            }
        }

        return exercise.content || {};
    };

    const content = getContent();

    console.log("PARSED CONTENT:", content);

    /*
     * ---------------------------------------------------------
     * QUESTION
     * ---------------------------------------------------------
     */

    const getQuestion = () => {
        return (
            content.question ||
            content.questionText ||
            content.text ||
            content.prompt ||
            content.title ||
            "Одговори на прашањето"
        );
    };

    /*
     * ---------------------------------------------------------
     * ANSWERS
     * ---------------------------------------------------------
     */

    const getAnswers = () => {
        if (Array.isArray(content.answers)) {
            return content.answers;
        }

        if (Array.isArray(content.options)) {
            return content.options;
        }

        if (Array.isArray(content.choices)) {
            return content.choices;
        }

        if (Array.isArray(content.possibleAnswers)) {
            return content.possibleAnswers;
        }

        return [];
    };

    /*
     * ---------------------------------------------------------
     * CORRECT ANSWER
     * ---------------------------------------------------------
     */

    const getCorrectAnswer = () => {
        return (
            content.correctAnswer ??
            content.correct ??
            content.correctOption ??
            content.answer ??
            content.solution ??
            null
        );
    };

    /*
     * ---------------------------------------------------------
     * NORMALIZE ANSWER
     * ---------------------------------------------------------
     */

    const normalizeAnswer = (answer) => {
        if (answer === null || answer === undefined) {
            return "";
        }

        if (typeof answer === "object") {
            return (
                answer.value ??
                answer.text ??
                answer.label ??
                answer.answer ??
                JSON.stringify(answer)
            );
        }

        return String(answer);
    };

    /*
     * ---------------------------------------------------------
     * CHECK ANSWER
     * ---------------------------------------------------------
     */

    const isCorrectAnswer = (answer) => {
        const correct = getCorrectAnswer();

        if (
            correct === null ||
            correct === undefined
        ) {
            console.warn(
                "NO CORRECT ANSWER FOUND IN CONTENT:",
                content
            );

            return false;
        }

        const userValue =
            normalizeAnswer(answer).trim().toLowerCase();

        const correctValue =
            normalizeAnswer(correct).trim().toLowerCase();

        return userValue === correctValue;
    };

    /*
     * ---------------------------------------------------------
     * FINISH GAME
     * ---------------------------------------------------------
     */

    const finishGame = async (finalWrongAnswers) => {
        if (finishingRef.current) {
            return;
        }

        finishingRef.current = true;

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        const finalScore =
            TOTAL_TASKS -
            finalWrongAnswers.length;

        const safeScore =
            Math.max(
                0,
                Math.min(
                    TOTAL_TASKS,
                    finalScore
                )
            );

        console.log(
            "FINAL WRONG ANSWERS:",
            finalWrongAnswers
        );

        console.log(
            "FINAL SCORE:",
            safeScore
        );

        setSaving(true);

        try {
            const response = await fetch(
                `${API}/progress`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        userId: Number(userId),
                        gamesId: Number(gamesId),
                        gamesType: gamesType,
                        pinNumber: Number(pinNumber),
                        score: safeScore,
                        wrongAnswers:
                            JSON.stringify(
                                finalWrongAnswers
                            )
                    })
                }
            );

            const data = await response.json();

            console.log(
                "SAVE PROGRESS RESPONSE:",
                data
            );

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    "Не може да се зачува напредокот."
                );
            }

            setCorrectAnswers(safeScore);
            setWrongAnswers(finalWrongAnswers);
            setFinished(true);

        } catch (err) {
            console.error(
                "SAVE PROGRESS ERROR:",
                err
            );

            setError(
                err.message ||
                "Не може да се зачува напредокот."
            );

            finishingRef.current = false;
        } finally {
            setSaving(false);
        }
    };

    /*
     * ---------------------------------------------------------
     * ANSWER
     * ---------------------------------------------------------
     */

    const handleAnswer = (
        answer,
        isTimeout = false
    ) => {
        if (
            answered ||
            finished ||
            finishingRef.current
        ) {
            return;
        }

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setAnswered(true);

        const correct =
            !isTimeout &&
            isCorrectAnswer(answer);

        let updatedWrongAnswers =
            [...wrongAnswersRef.current];

        if (!correct) {
            const wrongItem = {
                taskNumber: taskNumber,
                question: getQuestion(),
                userAnswer:
                    isTimeout
                        ? "Времето истече"
                        : normalizeAnswer(answer),
                correctAnswer:
                    normalizeAnswer(
                        getCorrectAnswer()
                    )
            };

            updatedWrongAnswers = [
                ...updatedWrongAnswers,
                wrongItem
            ];

            wrongAnswersRef.current =
                updatedWrongAnswers;

            setWrongAnswers(
                updatedWrongAnswers
            );
        }

        if (correct) {
            setCorrectAnswers(
                prev => prev + 1
            );
        }

        /*
         * Last task
         */

        if (taskNumber >= TOTAL_TASKS) {
            finishGame(
                updatedWrongAnswers
            );
            return;
        }

        /*
         * Next task
         */

        setTimeout(() => {
            setSelectedAnswer(null);
            setAnswered(false);
            setCountdown(TIME_PER_TASK);

            setTaskNumber(
                prev => prev + 1
            );
        }, 700);
    };

    /*
     * ---------------------------------------------------------
     * BACK
     * ---------------------------------------------------------
     */

    const handleBack = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        navigate(`/world/${worldId}`);
    };

    /*
     * ---------------------------------------------------------
     * FINISHED SCREEN
     * ---------------------------------------------------------
     */

    if (finished) {
        const score =
            TOTAL_TASKS -
            wrongAnswers.length;

        return (
            <div className="exercise-page">

                <header className="home-header">
                    <Logo />

                    <div className="nav-icons-row">
                        <HomeButton />
                        <LogoutButton />
                        <ProfileButton />
                    </div>
                </header>

                <main className="exercise-container">

                    <button
                        className="back-btn"
                        onClick={handleBack}
                    >
                        ← Назад
                    </button>

                    <div className="exercise-result">

                        <div className="result-icon">
                            {score >= 8
                                ? "🎉"
                                : "💪"}
                        </div>

                        <h1>
                            {score >= 8
                                ? "Одлично!"
                                : "Браво за трудот!"}
                        </h1>

                        <p>
                            Ја заврши задачата!
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
                                            key={index}
                                        >

                                            <div className="review-number">
                                                Задача{" "}
                                                {item.taskNumber}
                                            </div>

                                            <div className="review-question">
                                                <strong>
                                                    Прашање:
                                                </strong>

                                                <span>
                                                    {item.question}
                                                </span>
                                            </div>

                                            <div className="review-answer wrong">
                                                <strong>
                                                    Твој одговор:
                                                </strong>

                                                <span>
                                                    {item.userAnswer ||
                                                        "Нема одговор"}
                                                </span>
                                            </div>

                                            <div className="review-answer correct">
                                                <strong>
                                                    Точен одговор:
                                                </strong>

                                                <span>
                                                    {item.correctAnswer ||
                                                        "—"}
                                                </span>
                                            </div>

                                        </div>
                                    )
                                )}

                            </div>
                        )}

                        <button
                            className="continue-btn"
                            onClick={handleBack}
                        >
                            Продолжи
                        </button>

                    </div>

                </main>

            </div>
        );
    }

    /*
     * ---------------------------------------------------------
     * ERROR
     * ---------------------------------------------------------
     */

    if (error) {
        return (
            <div className="exercise-page">

                <header className="home-header">
                    <Logo />

                    <div className="nav-icons-row">
                        <HomeButton />
                        <LogoutButton />
                        <ProfileButton />
                    </div>
                </header>

                <main className="exercise-container">

                    <button
                        className="back-btn"
                        onClick={handleBack}
                    >
                        ← Назад
                    </button>

                    <div className="exercise-error">

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
     * ---------------------------------------------------------
     * LOADING
     * ---------------------------------------------------------
     */

    if (loading || !exercise) {
        return (
            <div className="exercise-page">

                <header className="home-header">
                    <Logo />

                    <div className="nav-icons-row">
                        <HomeButton />
                        <LogoutButton />
                        <ProfileButton />
                    </div>
                </header>

                <main className="exercise-container">

                    <button
                        className="back-btn"
                        onClick={handleBack}
                    >
                        ← Назад
                    </button>

                    <div className="exercise-loading">
                        Се вчитува задачата...
                    </div>

                </main>

            </div>
        );
    }

    /*
     * ---------------------------------------------------------
     * MAIN EXERCISE
     * ---------------------------------------------------------
     */

    const answers = getAnswers();
    const question = getQuestion();

    return (
        <div className="exercise-page">

            <header className="home-header">

                <Logo />

                <div className="nav-icons-row">
                    <HomeButton />
                    <LogoutButton />
                    <ProfileButton />
                </div>

            </header>

            <main className="exercise-container">

                <div className="exercise-top">

                    <button
                        className="back-btn"
                        onClick={handleBack}
                    >
                        ← Назад
                    </button>

                    <div className="exercise-task-number">
                        Задача {taskNumber}/{TOTAL_TASKS}
                    </div>

                    <div className="exercise-timer">
                        ⏱️ {countdown}
                    </div>

                </div>

                <div className="exercise-card">

                    <h2>
                        {question}
                    </h2>

                    {answers.length > 0 ? (

                        <div className="exercise-answers">

                            {answers.map(
                                (answer, index) => {

                                    const answerText =
                                        normalizeAnswer(
                                            answer
                                        );

                                    const isSelected =
                                        selectedAnswer ===
                                        answerText;

                                    const isCorrect =
                                        answered &&
                                        isCorrectAnswer(
                                            answer
                                        );

                                    return (
                                        <button
                                            key={index}
                                            className={`
                                                exercise-answer
                                                ${isSelected
                                                    ? "selected"
                                                    : ""}
                                                ${isCorrect
                                                    ? "correct"
                                                    : ""}
                                            `}
                                            disabled={answered}
                                            onClick={() => {
                                                setSelectedAnswer(
                                                    answerText
                                                );

                                                handleAnswer(
                                                    answer
                                                );
                                            }}
                                        >
                                            {answerText}
                                        </button>
                                    );
                                }
                            )}

                        </div>

                    ) : (

                        <div className="exercise-no-answers">

                            <p>
                                Нема достапни одговори за оваа задача.
                            </p>

                            <pre>
                                {JSON.stringify(
                                    content,
                                    null,
                                    2
                                )}
                            </pre>

                        </div>

                    )}

                    {saving && (
                        <div className="exercise-saving">
                            Се зачувува резултатот...
                        </div>
                    )}

                </div>

            </main>

        </div>
    );
}

export default ExercisePage;