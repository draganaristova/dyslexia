import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/ExercisePage.css";
import Logo from "../widgets/Logo";
import HomeButton from "../widgets/HomeButton";
import LogoutButton from "../widgets/LogoutButton";
import ProfileButton from "../widgets/ProfileButton";
import { API } from "../data/api";
import { worldsData } from "../data/worldsData";

const TOTAL_TASKS = 10;
const MIN_CORRECT_ANSWERS = 8;
const NORMAL_TIME = 30;
const MEMORY_TIME_BY_LEVEL = {
    1: 30,
    2: 30,
    3: 50,
};

const GAME_TYPES = [
    "MEMORY",
    "WORD_BUILDING",
    "MISSING_LETTER",
    "RHYMES",
    "SYLLABLES",
    "SOUND_MANIPULATION",
];

function shuffleArray(array) {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] = [
            shuffled[j],
            shuffled[i],
        ];
    }

    return shuffled;
}

export default function ExercisePage() {
    const navigate = useNavigate();

    const {
        worldId,
        gamesId,
        gamesType,
        pinNumber,
    } = useParams();

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const missionRunIdRef = useRef(crypto.randomUUID());
    const [exercise, setExercise] = useState(null);
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentTask, setCurrentTask] = useState(1);
    const [score, setScore] = useState(0);
    const [finalScore, setFinalScore] = useState(null);
    const [wrongAnswers, setWrongAnswers] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [finished, setFinished] = useState(false);
    const [saving, setSaving] = useState(false);
    const [missingLetterCompleted, setMissingLetterCompleted,] = useState(false);
    const [rhymeFeedback, setRhymeFeedback] = useState(null);
    const [syllableFeedback, setSyllableFeedback,] = useState(null);
    const [soundFeedback, setSoundFeedback] = useState(null);
    const [timeLeft, setTimeLeft] = useState(NORMAL_TIME);
    const [memoryCards, setMemoryCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [memoryBusy, setMemoryBusy] = useState(false);
    const [wordLetters, setWordLetters] = useState([]);
    const [selectedLetterIndexes, setSelectedLetterIndexes,] = useState([]);
    const [worldGames, setWorldGames] = useState([]);
    const [worldGamesLoading, setWorldGamesLoading,] = useState(true);
    const [worldGamesError, setWorldGamesError] = useState("");
    const timerRef = useRef(null);
    const timeoutHandledRef = useRef(false);
    const rhymeTimeoutRef = useRef(null);
    const syllableTimeoutRef = useRef(null);
    const soundTimeoutRef = useRef(null);
    const taskTimeoutRef = useRef(null);
    const memoryTimeoutRef = useRef(null);
    const wordTimeoutRef = useRef(null);
    const answerLockedRef = useRef(false);
    const navigationLockedRef = useRef(false);
    const isMemoryGame = gamesType === "MEMORY";
    const isWordBuildingGame = gamesType === "WORD_BUILDING";
    const isMissingLetterGame = gamesType === "MISSING_LETTER";
    const isRhymesGame = gamesType === "RHYMES";
    const isSyllablesGame = gamesType === "SYLLABLES";
    const isSoundManipulationGame = gamesType === "SOUND_MANIPULATION";
    const resultScore = finalScore ?? score;
    const passed = finished && resultScore >= MIN_CORRECT_ANSWERS;
    const isLastMission = worldGames.length === 6 && Number(worldGames[5].id) === Number(gamesId);
    const adventureCompleted = passed && isLastMission;
    const nextWorldId = Number(worldId) + 1;
    const hasNextAdventure = Boolean(worldsData[nextWorldId]);

    const clearTimers = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        [
            rhymeTimeoutRef,
            syllableTimeoutRef,
            soundTimeoutRef,
            taskTimeoutRef,
            memoryTimeoutRef,
            wordTimeoutRef,
        ].forEach(ref => {
            if (ref.current) {
                clearTimeout(ref.current);
                ref.current = null;
            }
        });
    };

    useEffect(() => {
        let cancelled = false;

        const loadWorldGames = async () => {
            setWorldGamesLoading(true);
            setWorldGamesError("");
            setWorldGames([]);

            try {
                if (!token || !userId) {
                    throw new Error("Најави се повторно.");
                }

                const response = await fetch(
                    `${API}/games/world/${Number(worldId)}?userId=${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Не може да се вчитаат игрите од светот."
                    );
                }

                const data = await response.json();

                if (!Array.isArray(data) || data.length < 6) {
                    throw new Error(
                        "Не може да се одреди последната игра."
                    );
                }

                const games = data.slice(0, 6);

                if (
                    !games.some(
                        game =>
                            Number(game.id) === Number(gamesId)
                    )
                ) {
                    throw new Error(
                        "Тековната игра не е пронајдена."
                    );
                }

                if (!cancelled) {
                    setWorldGames(games);
                }
            } catch (err) {
                if (!cancelled) {
                    setWorldGamesError(
                        err.message || "Настана грешка."
                    );
                }
            } finally {
                if (!cancelled) {
                    setWorldGamesLoading(false);
                }
            }
        };

        loadWorldGames();

        return () => {
            cancelled = true;
        };
    }, [worldId, gamesId, userId, token]);

    useEffect(() => {
        let cancelled = false;

        const loadExercise = async () => {
            try {
                setLoading(true);
                setError("");
                setExercise(null);
                setContent(null);

                setSelectedAnswer(null);
                setAnswered(false);
                setMissingLetterCompleted(false);

                setRhymeFeedback(null);
                setSyllableFeedback(null);
                setSoundFeedback(null);

                setFlippedCards([]);
                setMatchedPairs([]);
                setMemoryCards([]);
                setMemoryBusy(false);

                setWordLetters([]);
                setSelectedLetterIndexes([]);

                answerLockedRef.current = false;
                timeoutHandledRef.current = false;

                const url =
                    `${API}/exercises/` +
                    `${gamesId}/${gamesType}/` +
                    `${pinNumber}/${currentTask}` +
                    `?userId=${userId}`;

                const response = await fetch(url, {
                    headers: token
                        ? {
                              Authorization: `Bearer ${token}`,
                          }
                        : {},
                });

                if (!response.ok) {
                    const responseText = await response.text();

                    throw new Error(
                        responseText ||
                            `HTTP ${response.status}`
                    );
                }

                const data = await response.json();

                if (cancelled) {
                    return;
                }

                let parsedContent;

                try {
                    parsedContent =
                        typeof data.content === "string"
                            ? JSON.parse(data.content)
                            : data.content || {};
                } catch (parseError) {
                    console.error(
                        "Content parse error:",
                        parseError
                    );

                    throw new Error(
                        "Содржината на задачата не може да се прочита."
                    );
                }

                setExercise(data);
                setContent(parsedContent);

                const level =
                    Number(data.levelNumber) ||
                    Number(pinNumber) ||
                    1;

                const exerciseType =
                    data.gamesType || gamesType;

                const taskTime =
                    exerciseType === "MEMORY"
                        ? MEMORY_TIME_BY_LEVEL[level] ||
                          MEMORY_TIME_BY_LEVEL[1]
                        : NORMAL_TIME;

                setTimeLeft(taskTime);

                if (
                    exerciseType === "MEMORY" &&
                    Array.isArray(parsedContent.cards)
                ) {
                    setMemoryCards(
                        shuffleArray(parsedContent.cards)
                    );
                }

                if (
                    exerciseType === "WORD_BUILDING" &&
                    Array.isArray(parsedContent.letters)
                ) {
                    setWordLetters(
                        shuffleArray(parsedContent.letters)
                    );
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("Load exercise error:", err);

                    setError(
                        err.message ||
                            "Не можеше да се вчита задачата."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadExercise();

        return () => {
            cancelled = true;
            clearTimers();
        };
    }, [
        gamesId,
        gamesType,
        pinNumber,
        currentTask,
        userId,
        token,
    ]);

    const saveTaskProgress = async ({
        correct,
        selected,
        timedOut = false,
    }) => {
        if (!exercise) {
            return;
        }

        try {
            setSaving(true);

            let correctAnswer = content?.answer || "";

            if (isMemoryGame && !correctAnswer) {
                correctAnswer = "Сите парови";
            }

            const payload = {
                userId: Number(userId),
                exerciseId: exercise.id,
                missionRunId: missionRunIdRef.current,
                taskNumber: currentTask,
                question: content?.question || "",
                selectedAnswer: selected || (timedOut ? "Времето истече" : ""),
                correctAnswer,
                score: correct ? 1 : 0,
                correct: Boolean(correct),
                completed: true,
                timedOut: Boolean(timedOut),
            };

            const response = await fetch(
                `${API}/exercise-progress`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token
                            ? {
                                  Authorization:
                                      `Bearer ${token}`,
                              }
                            : {}),
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const text = await response.text();

                throw new Error(
                    text || `HTTP ${response.status}`
                );
            }
        } catch (err) {
            console.error("Error saving attempt:", err);

            throw new Error(
                "Одговорот не се зачува. Провери ја врската и обиди се повторно."
            );
        } finally {
            setSaving(false);
        }
    };

    const addWrongAnswer = ({
        selected,
        timedOut = false,
    }) => {
        let correctAnswer = content?.answer || "";

        if (isMemoryGame && !correctAnswer) {
            correctAnswer = "Пронајди ги сите парови";
        }

        setWrongAnswers(previous => [
            ...previous,
            {
                taskNumber: currentTask,
                question: content?.question || "",
                selectedAnswer:
                    selected ||
                    (timedOut
                        ? "Времето истече"
                        : "Нема одговор"),
                correctAnswer,
            },
        ]);
    };

    const completeOrAdvance = newScore => {
        if (currentTask >= TOTAL_TASKS) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            setFinalScore(newScore);
            setFinished(true);
            return;
        }

        setCurrentTask(previous => previous + 1);
    };

    const recordAnswer = async ({
        correct,
        selected,
        timedOut = false,
        delay = 500,
        setFeedback = null,
        timeoutRef = taskTimeoutRef,
        missingLetterSuccess = false,
    }) => {
        if (
            answered ||
            saving ||
            finished ||
            answerLockedRef.current
        ) {
            return;
        }

        answerLockedRef.current = true;
        setAnswered(true);
        setSelectedAnswer(selected);

        if (setFeedback) {
            setFeedback(correct);
        }

        if (missingLetterSuccess) {
            setMissingLetterCompleted(true);
        }

        const newScore = score + (correct ? 1 : 0);

        try {
            await saveTaskProgress({
                correct,
                selected,
                timedOut,
            });
        } catch (err) {
            setError(err.message);
            return;
        }

        if (correct) {
            setScore(newScore);
        } else {
            addWrongAnswer({
                selected,
                timedOut,
            });
        }

        if (currentTask >= TOTAL_TASKS && delay === 500) {
            completeOrAdvance(newScore);
            return;
        }

        timeoutRef.current = setTimeout(() => {
            if (currentTask < TOTAL_TASKS) {
                if (setFeedback) {
                    setFeedback(null);
                }

                setMissingLetterCompleted(false);
                setSelectedAnswer(null);
            }

            completeOrAdvance(newScore);
        }, delay);
    };

    const finishTask = answer =>
        recordAnswer(answer);

    const handleRhymesAnswer = answer => {
        if (rhymeFeedback !== null) {
            return;
        }

        return recordAnswer({
            correct:
                String(answer) === String(content?.answer),
            selected: answer,
            delay: 3000,
            setFeedback: setRhymeFeedback,
            timeoutRef: rhymeTimeoutRef,
        });
    };

    const handleSyllablesAnswer = answer => {
        if (syllableFeedback !== null) {
            return;
        }

        return recordAnswer({
            correct:
                String(answer) === String(content?.answer),
            selected: answer,
            delay: 3000,
            setFeedback: setSyllableFeedback,
            timeoutRef: syllableTimeoutRef,
        });
    };

    const handleSoundManipulationAnswer = answer => {
        if (soundFeedback !== null) {
            return;
        }

        return recordAnswer({
            correct:
                String(answer) === String(content?.answer),
            selected: answer,
            delay: 3000,
            setFeedback: setSoundFeedback,
            timeoutRef: soundTimeoutRef,
        });
    };

    const handleAnswer = async answer => {
        if (
            answered ||
            saving ||
            finished ||
            answerLockedRef.current
        ) {
            return;
        }

        if (isRhymesGame) {
            await handleRhymesAnswer(answer);
            return;
        }

        if (isSyllablesGame) {
            await handleSyllablesAnswer(answer);
            return;
        }

        if (isSoundManipulationGame) {
            await handleSoundManipulationAnswer(answer);
            return;
        }

        const correct =
            String(answer) === String(content?.answer);

        if (isMissingLetterGame && correct) {
            await recordAnswer({
                correct: true,
                selected: answer,
                delay: 3000,
                missingLetterSuccess: true,
            });

            return;
        }

        await finishTask({
            correct,
            selected: answer,
            timedOut: false,
        });
    };

    const handleWordLetterClick = index => {
        if (
            answered ||
            saving ||
            finished ||
            answerLockedRef.current ||
            wordTimeoutRef.current
        ) {
            return;
        }

        if (selectedLetterIndexes.includes(index)) {
            return;
        }

        const newIndexes = [
            ...selectedLetterIndexes,
            index,
        ];

        setSelectedLetterIndexes(newIndexes);

        const builtWord = newIndexes
            .map(itemIndex => wordLetters[itemIndex])
            .join("");

        if (newIndexes.length === wordLetters.length) {
            const correct =
                builtWord === String(content?.answer || "");

            setSelectedAnswer(builtWord);

            wordTimeoutRef.current = setTimeout(() => {
                wordTimeoutRef.current = null;

                finishTask({
                    correct,
                    selected: builtWord,
                    timedOut: false,
                });
            }, 250);
        }
    };

    const removeLastWordLetter = () => {
        if (
            answered ||
            saving ||
            finished ||
            answerLockedRef.current ||
            wordTimeoutRef.current ||
            selectedLetterIndexes.length === 0
        ) {
            return;
        }

        setSelectedLetterIndexes(previous =>
            previous.slice(0, -1)
        );
    };

    const resetWord = () => {
        if (
            answered ||
            saving ||
            finished ||
            answerLockedRef.current ||
            wordTimeoutRef.current
        ) {
            return;
        }

        setSelectedLetterIndexes([]);
    };

    const handleMemoryCardClick = async card => {
        if (
            answered ||
            saving ||
            finished ||
            answerLockedRef.current ||
            memoryBusy
        ) {
            return;
        }

        if (
            flippedCards.includes(card.id) ||
            matchedPairs.includes(card.pairId)
        ) {
            return;
        }

        if (flippedCards.length >= 2) {
            return;
        }

        const newFlippedCards = [
            ...flippedCards,
            card.id,
        ];

        setFlippedCards(newFlippedCards);

        if (newFlippedCards.length === 1) {
            return;
        }

        const firstCard = memoryCards.find(
            item => item.id === newFlippedCards[0]
        );

        const secondCard = memoryCards.find(
            item => item.id === newFlippedCards[1]
        );

        if (!firstCard || !secondCard) {
            return;
        }

        setMemoryBusy(true);

        if (firstCard.pairId === secondCard.pairId) {
            const newMatchedPairs = [
                ...matchedPairs,
                firstCard.pairId,
            ];

            setMatchedPairs(newMatchedPairs);

            memoryTimeoutRef.current = setTimeout(async () => {
                setFlippedCards([]);
                setMemoryBusy(false);

                const totalPairs = new Set(
                    memoryCards.map(item => item.pairId)
                ).size;

                if (newMatchedPairs.length >= totalPairs) {
                    await finishTask({
                        correct: true,
                        selected:
                            "Сите парови се пронајдени",
                        timedOut: false,
                    });
                }
            }, 500);

            return;
        }

        memoryTimeoutRef.current = setTimeout(() => {
            setFlippedCards([]);
            setMemoryBusy(false);
        }, 850);
    };

    useEffect(() => {
        if (
            loading ||
            error ||
            finished ||
            answered ||
            !content
        ) {
            return;
        }

        timeoutHandledRef.current = false;

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(() => {
            setTimeLeft(previous => {
                if (previous <= 1) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }

                    return 0;
                }

                return previous - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [
        loading,
        error,
        finished,
        answered,
        content,
        currentTask,
    ]);

    useEffect(() => {
        if (
            timeLeft !== 0 ||
            loading ||
            error ||
            finished ||
            answered ||
            !content ||
            answerLockedRef.current
        ) {
            return;
        }

        if (timeoutHandledRef.current) {
            return;
        }

        timeoutHandledRef.current = true;

        finishTask({
            correct: false,
            selected: "Времето истече",
            timedOut: true,
        });
    }, [
        timeLeft,
        loading,
        error,
        finished,
        answered,
        content,
    ]);

    const goBackToWorld = () => {
        clearTimers();
        navigate(`/world/${worldId}`);
    };

    const goBackToWorlds = () => {
        clearTimers();
        navigate("/gameselection");
    };

    const retryMission = () => {
        clearTimers();
        window.location.reload();
    };

    const resetMissionState = () => {
        clearTimers();  
        missionRunIdRef.current = crypto.randomUUID();
        timeoutHandledRef.current = false;
        answerLockedRef.current = false;

        setCurrentTask(1);
        setScore(0);
        setFinalScore(null);
        setWrongAnswers([]);

        setSelectedAnswer(null);
        setAnswered(false);
        setFinished(false);
        setSaving(false);

        setMissingLetterCompleted(false);
        setRhymeFeedback(null);
        setSyllableFeedback(null);
        setSoundFeedback(null);

        setMemoryCards([]);
        setFlippedCards([]);
        setMatchedPairs([]);
        setMemoryBusy(false);

        setWordLetters([]);
        setSelectedLetterIndexes([]);

        setTimeLeft(NORMAL_TIME);
    };

    const goToNextAdventure = () => {
        if (
            !adventureCompleted ||
            saving ||
            worldGamesLoading ||
            worldGamesError ||
            !hasNextAdventure ||
            navigationLockedRef.current
        ) {
            return;
        }

        navigationLockedRef.current = true;

        clearTimers();
        navigate(`/world/${nextWorldId}`);
    };

    const goToNextMission = () => {
        if (
            !passed ||
            saving ||
            worldGamesLoading ||
            worldGamesError ||
            navigationLockedRef.current
        ) {
            return;
        }

        if (isLastMission) {
            goToNextAdventure();
            return;
        }

        const currentIndex = worldGames.findIndex(
            game =>
                Number(game.id) === Number(gamesId)
        );

        if (currentIndex === -1) {
            alert(
                "Тековната игра не е пронајдена во светот."
            );
            return;
        }

        const nextGame = worldGames[currentIndex + 1];

        if (!nextGame) {
            return;
        }

        const nextType =
            nextGame.gamesType ||
            GAME_TYPES[currentIndex + 1];

        if (!nextType) {
            alert(
                "Следната игра нема дефиниран тип."
            );
            return;
        }

        navigationLockedRef.current = true;

        resetMissionState();

        navigate(
            `/world/${worldId}/exercise/${nextGame.id}/${nextType}/${pinNumber}`
        );

        navigationLockedRef.current = false;
    };

    const Header = () => (
        <header className="exercise-header">
            <Logo />

            <div className="exercise-header-actions">
                <HomeButton />
                <ProfileButton />
                <LogoutButton />
            </div>
        </header>
    );

    const renderFeedback = (feedback, classPrefix) => {
        if (feedback === null) {
            return null;
        }

        return (
            <div
                className={`${classPrefix}-feedback ${
                    feedback ? "success" : "error"
                }`}
            >
                <span>{feedback ? "✓" : "✕"}</span>

                <strong>
                    {feedback
                        ? "Точно! 🎉"
                        : "Не е точно ❌"}
                </strong>
            </div>
        );
    };

    const renderFeedbackOptions = ({
        feedback,
        classPrefix,
        optionsClass,
        onAnswer,
        showOptionNumber = true,
    }) => {
        if (!Array.isArray(content?.options)) {
            return null;
        }

        return (
            <div className={`answer-options ${optionsClass}`}>
                {content.options.map((option, index) => {
                    const isSelected =
                        String(selectedAnswer) ===
                        String(option);

                    const isCorrect =
                        String(option) ===
                        String(content?.answer);

                    let optionClass = "answer-option";

                    if (feedback !== null) {
                        if (isCorrect) {
                            optionClass +=
                                ` ${classPrefix}-correct`;
                        } else if (isSelected) {
                            optionClass +=
                                ` ${classPrefix}-wrong`;
                        }
                    } else if (isSelected) {
                        optionClass += " selected";
                    }

                    return (
                        <button
                            key={index}
                            type="button"
                            className={optionClass}
                            onClick={() => onAnswer(option)}
                            disabled={
                                answered ||
                                saving ||
                                feedback !== null
                            }
                        >
                            {showOptionNumber && (
                                <span className="option-number">
                                    {String.fromCharCode(
                                        65 + index
                                    )}
                                </span>
                            )}

                            <span>{option}</span>
                        </button>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="exercise-page">
                <Header />

                <main className="exercise-loading">
                    <div className="loading-spinner">
                        ⏳
                    </div>

                    <h2>
                        Ја подготвуваме задачата...
                    </h2>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="exercise-page">
                <Header />

                <main className="exercise-error">
                    <div className="error-card">
                        <div className="error-icon">
                            ⚠️
                        </div>

                        <h2>
                            Не може да се продолжи
                        </h2>

                        <p>{error}</p>

                        <button
                            className="back-world-btn"
                            onClick={goBackToWorld}
                        >
                            ← Назад кон игрите
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    if (finished) {
        const percentage = Math.round(
            (resultScore / TOTAL_TASKS) * 100
        );

        return (
            <div className="exercise-page">
                <Header />

                <main className="exercise-finished">
                    <div className="finished-card">
                        <div className="finished-top">
                            <span>
                                {adventureCompleted
                                    ? "Авантурата е завршена"
                                    : "Мисијата е завршена"}
                            </span>
                        </div>

                        <h1>
                            {adventureCompleted
                                ? "Честитки! 🎉"
                                : passed
                                  ? "Браво! 🎉"
                                  : resultScore >= 5
                                    ? "Одличен труд! ⭐"
                                    : "Супер обид! 🌟"}
                        </h1>

                        <p className="finished-message">
                            {adventureCompleted
                                ? hasNextAdventure
                                    ? "Ја помина оваа авантура! 🌟 Подготви се за нови забавни предизвици!"
                                    : "Ја помина оваа авантура и ги заврши сите светови! Браво за твојот труд! 🏆"
                                : passed
                                  ? "Одлично ја заврши мисијата! Следната авантура те чека!"
                                  : "Убаво се потруди! 💚 Ајде да ја извежбаме мисијата уште еднаш. Со 8 точни одговори ќе ја отклучиш следната авантура!"}
                        </p>

                        <div className="result-score">
                            <strong>
                                {resultScore}
                            </strong>

                            <span>
                                / {TOTAL_TASKS}
                            </span>
                        </div>

                        <div className="result-percent">
                            {percentage}%
                        </div>

                        <div className="result-stats">
                            <div className="result-stat correct">
                                <span>✓</span>

                                <div>
                                    <strong>
                                        {resultScore}
                                    </strong>

                                    <small>
                                        Точни
                                    </small>
                                </div>
                            </div>

                            <div className="result-stat wrong">
                                <span>×</span>

                                <div>
                                    <strong>
                                        {TOTAL_TASKS -
                                            resultScore}
                                    </strong>

                                    <small>
                                        Неточни
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div className="finished-actions">
                            <button
                                className="finished-secondary-btn"
                                onClick={
                                    adventureCompleted
                                        ? goBackToWorlds
                                        : goBackToWorld
                                }
                            >
                                {adventureCompleted
                                    ? "🌍 Назад кон световите"
                                    : "← Назад кон игрите"}
                            </button>

                            {!passed ? (
                                <button
                                    className="finished-primary-btn"
                                    disabled={saving}
                                    onClick={retryMission}
                                >
                                    🌟 Обиди се повторно
                                </button>
                            ) : worldGamesLoading ? (
                                <button
                                    className="finished-primary-btn"
                                    disabled
                                >
                                    Се подготвува продолжението...
                                </button>
                            ) : worldGamesError ? (
                                <span role="alert">
                                    {worldGamesError} Врати се
                                    кон игрите и обиди се
                                    повторно.
                                </span>
                            ) : adventureCompleted ? (
                                hasNextAdventure && (
                                    <button
                                        className="finished-primary-btn"
                                        disabled={saving}
                                        onClick={
                                            goToNextAdventure
                                        }
                                    >
                                        🚀 Следна авантура
                                    </button>
                                )
                            ) : (
                                <button
                                    className="finished-primary-btn"
                                    disabled={saving}
                                    onClick={goToNextMission}
                                >
                                    🚀 Следна мисија
                                </button>
                            )}
                        </div>
                    </div>

                    {wrongAnswers.length > 0 && (
                        <div className="mistakes-card">
                            <h2>
                                Ајде да ги погледнеме задачите
                            </h2>

                            <p className="mistakes-subtitle">
                                Еве ги задачите што можеш
                                повторно да ги вежбаш.
                            </p>

                            <div className="mistakes-list">
                                {wrongAnswers.map(item => (
                                    <div
                                        className="mistake-item"
                                        key={item.taskNumber}
                                    >
                                        <div className="mistake-number">
                                            {item.taskNumber}
                                        </div>

                                        <div className="mistake-content">
                                            <strong>
                                                {item.question}
                                            </strong>

                                            <div className="mistake-answers">
                                                <span className="your-answer">
                                                    Твој одговор:{" "}
                                                    {
                                                        item.selectedAnswer
                                                    }
                                                </span>

                                                <span className="correct-answer">
                                                    Точен одговор:{" "}
                                                    {
                                                        item.correctAnswer
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        );
    }

    const builtWord = selectedLetterIndexes
        .map(index => wordLetters[index])
        .join("");

    const missingLetterParts = String(
        content?.word || ""
    ).split("");

    return (
        <div className="exercise-page">
            <Header />

            <main className="exercise-main">
                <div className="exercise-topbar">
                    <button
                        className="exercise-back-btn"
                        onClick={goBackToWorld}
                    >
                        ← Назад
                    </button>

                    <div className="task-progress">
                        Задача{" "}
                        <strong>
                            {currentTask}
                        </strong>
                        /{TOTAL_TASKS}
                    </div>

                    <div
                        className={`timer ${
                            timeLeft <= 10
                                ? "timer-warning"
                                : ""
                        }`}
                    >
                        ⏱️ {timeLeft}
                    </div>
                </div>

                <section className="exercise-title">
                    <div className="mission-label">
                        МИСИЈА {pinNumber}
                    </div>

                    <h1>
                        {content?.question || "Задача"}
                    </h1>
                </section>

                {isWordBuildingGame && (
                    <section className="word-building-game">
                        <div className="word-building-answer-card">
                            <div className="answer-label">
                                Твојот збор
                            </div>

                            <div className="word-building-slots">
                                {wordLetters.map((_, index) => {
                                    const selectedIndex =
                                        selectedLetterIndexes[
                                            index
                                        ];

                                    const letter =
                                        selectedIndex !== undefined
                                            ? wordLetters[
                                                  selectedIndex
                                              ]
                                            : "";

                                    return (
                                        <div
                                            key={index}
                                            className={`word-slot ${
                                                letter
                                                    ? "filled"
                                                    : ""
                                            }`}
                                        >
                                            {letter}
                                        </div>
                                    );
                                })}
                            </div>

                            {builtWord && (
                                <div className="built-word-preview">
                                    {builtWord}
                                </div>
                            )}
                        </div>

                        <div className="word-building-description">
                            <div className="description-emoji">
                                {content?.emoji || "💡"}
                            </div>

                            <div className="description-content">
                                <span>
                                    Погоди го зборот:
                                </span>

                                <strong>
                                    {content?.description ||
                                        "Размисли кој збор одговара на описот."}
                                </strong>
                            </div>
                        </div>

                        <div className="word-building-letters">
                            {wordLetters.map((letter, index) => (
                                <button
                                    key={`${letter}-${index}`}
                                    type="button"
                                    className={`word-letter ${
                                        selectedLetterIndexes.includes(
                                            index
                                        )
                                            ? "used"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleWordLetterClick(
                                            index
                                        )
                                    }
                                    disabled={
                                        answered ||
                                        saving ||
                                        selectedLetterIndexes.includes(
                                            index
                                        )
                                    }
                                >
                                    {letter}
                                </button>
                            ))}
                        </div>

                        <div className="word-building-actions">
                            <button
                                type="button"
                                className="word-action-btn secondary"
                                onClick={removeLastWordLetter}
                                disabled={
                                    answered ||
                                    saving ||
                                    selectedLetterIndexes.length ===
                                        0
                                }
                            >
                                ← Избриши
                            </button>

                            <button
                                type="button"
                                className="word-action-btn reset"
                                onClick={resetWord}
                                disabled={
                                    answered ||
                                    saving ||
                                    selectedLetterIndexes.length ===
                                        0
                                }
                            >
                                ↺ Почни повторно
                            </button>
                        </div>
                    </section>
                )}

                {isMemoryGame && (
                    <section className="memory-game">
                        <div className="memory-instruction">
                            🧠 Пронајди ги сите парови!
                        </div>

                        <div className="memory-board">
                            {memoryCards.map(card => {
                                const isFlipped =
                                    flippedCards.includes(
                                        card.id
                                    );

                                const isMatched =
                                    matchedPairs.includes(
                                        card.pairId
                                    );

                                return (
                                    <button
                                        key={card.id}
                                        type="button"
                                        className={`memory-card ${
                                            isFlipped || isMatched
                                                ? "flipped"
                                                : ""
                                        } ${
                                            isMatched
                                                ? "matched"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleMemoryCardClick(
                                                card
                                            )
                                        }
                                        disabled={
                                            answered ||
                                            saving ||
                                            memoryBusy ||
                                            isMatched
                                        }
                                    >
                                        <div className="memory-card-inner">
                                            <div className="memory-card-front">
                                                ?
                                            </div>

                                            <div className="memory-card-back">
                                                <img
                                                    src={`/images/memory/${card.image}.png`}
                                                    alt={
                                                        card.label ||
                                                        card.image ||
                                                        "Слика"
                                                    }
                                                    onError={event => {
                                                        event.currentTarget.style.display =
                                                            "none";
                                                    }}
                                                />

                                                <span>
                                                    {card.label}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                )}

                {isMissingLetterGame && (
                    <section className="missing-letter-game">
                        <div className="missing-letter-word-card">
                            <div className="missing-letter-label">
                                🔤 Пронајди ја буквата
                            </div>

                            <div className="missing-letter-word">
                                {missingLetterParts.map(
                                    (character, index) => {
                                        if (character === "_") {
                                            return (
                                                <span
                                                    key={index}
                                                    className={
                                                        missingLetterCompleted
                                                            ? "missing-letter-character completed-letter"
                                                            : "missing-letter-blank"
                                                    }
                                                >
                                                    {missingLetterCompleted
                                                        ? content?.answer
                                                        : "?"}
                                                </span>
                                            );
                                        }

                                        return (
                                            <span
                                                key={index}
                                                className="missing-letter-character"
                                            >
                                                {character}
                                            </span>
                                        );
                                    }
                                )}
                            </div>

                            {missingLetterCompleted && (
                                <div className="missing-letter-success">
                                    🎉 Браво!
                                </div>
                            )}
                        </div>

                        {!missingLetterCompleted &&
                            Array.isArray(content?.options) && (
                                <div className="answer-options missing-letter-options">
                                    {content.options.map(
                                        (option, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                className={`answer-option missing-letter-option ${
                                                    selectedAnswer ===
                                                    option
                                                        ? "selected"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    handleAnswer(
                                                        option
                                                    )
                                                }
                                                disabled={
                                                    answered ||
                                                    saving
                                                }
                                            >
                                                <span className="missing-option-letter">
                                                    {option}
                                                </span>
                                            </button>
                                        )
                                    )}
                                </div>
                            )}
                    </section>
                )}

                {isRhymesGame && (
                    <section className="normal-exercise rhymes-exercise">
                        {renderFeedbackOptions({
                            feedback: rhymeFeedback,
                            classPrefix: "rhyme",
                            optionsClass: "rhymes-options",
                            onAnswer: handleRhymesAnswer,
                            showOptionNumber: false,
                        })}

                        {renderFeedback(
                            rhymeFeedback,
                            "rhyme"
                        )}
                    </section>
                )}

                {isSyllablesGame && (
                    <section className="normal-exercise syllables-exercise">
                        {renderFeedbackOptions({
                            feedback: syllableFeedback,
                            classPrefix: "syllable",
                            optionsClass: "syllables-options",
                            onAnswer: handleSyllablesAnswer,
                        })}

                        {renderFeedback(
                            syllableFeedback,
                            "syllable"
                        )}
                    </section>
                )}

                {isSoundManipulationGame && (
                    <section className="normal-exercise sound-manipulation-exercise">
                        {renderFeedbackOptions({
                            feedback: soundFeedback,
                            classPrefix: "sound",
                            optionsClass: "sound-options",
                            onAnswer:
                                handleSoundManipulationAnswer,
                        })}

                        {renderFeedback(
                            soundFeedback,
                            "sound"
                        )}
                    </section>
                )}

                {!isMemoryGame &&
                    !isWordBuildingGame &&
                    !isMissingLetterGame &&
                    !isRhymesGame &&
                    !isSyllablesGame &&
                    !isSoundManipulationGame && (
                        <section className="normal-exercise">
                            <div className="question-card">
                                {content?.question}
                            </div>

                            {Array.isArray(content?.options) && (
                                <div className="answer-options">
                                    {content.options.map(
                                        (option, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                className={`answer-option ${
                                                    selectedAnswer ===
                                                    option
                                                        ? "selected"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    handleAnswer(
                                                        option
                                                    )
                                                }
                                                disabled={
                                                    answered ||
                                                    saving
                                                }
                                            >
                                                <span className="option-number">
                                                    {String.fromCharCode(
                                                        65 + index
                                                    )}
                                                </span>

                                                <span>
                                                    {option}
                                                </span>
                                            </button>
                                        )
                                    )}
                                </div>
                            )}
                        </section>
                    )}
            </main>
        </div>
    );
}