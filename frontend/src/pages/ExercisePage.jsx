import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/ExercisePage.css";
import Logo from "../widgets/Logo";
import HomeButton from "../widgets/HomeButton";
import LogoutButton from "../widgets/LogoutButton";
import ProfileButton from "../widgets/ProfileButton";
import { API } from "../data/api";

const TOTAL_TASKS = 10;
const NORMAL_TIME = 30;
const MEMORY_TIME_BY_LEVEL = {
    1: 30,
    2: 30,
    3: 50,
};

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
    const [rhymeFeedback, setRhymeFeedback,] = useState(null);
    const rhymeTimeoutRef = useRef(null);
    const [syllableFeedback, setSyllableFeedback,] = useState(null);
    const syllableTimeoutRef = useRef(null);
    const [soundFeedback, setSoundFeedback,] = useState(null);
    const soundTimeoutRef = useRef(null);
    const [timeLeft, setTimeLeft] = useState(NORMAL_TIME);
    const timerRef = useRef(null);
    const timeoutHandledRef = useRef(false);
    const [memoryCards, setMemoryCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [memoryBusy, setMemoryBusy] = useState(false);
    const [wordLetters, setWordLetters] = useState([]);
    const [selectedLetterIndexes, setSelectedLetterIndexes,] = useState([]);
    const isMemoryGame = gamesType === "MEMORY";
    const isWordBuildingGame = gamesType === "WORD_BUILDING";
    const isMissingLetterGame = gamesType === "MISSING_LETTER";
    const isRhymesGame = gamesType === "RHYMES";
    const isSyllablesGame = gamesType === "SYLLABLES";
    const isSoundManipulationGame = gamesType === "SOUND_MANIPULATION";

    const getMemoryTime = () => {
        const level = Number(pinNumber) || 1;

        return (MEMORY_TIME_BY_LEVEL[level] || MEMORY_TIME_BY_LEVEL[1]);
    };


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

                if (rhymeTimeoutRef.current) {

                    clearTimeout(rhymeTimeoutRef.current);
                    rhymeTimeoutRef.current = null;
                }

                setSyllableFeedback(null);

                if (syllableTimeoutRef.current) {

                    clearTimeout(syllableTimeoutRef.current);
                    syllableTimeoutRef.current = null;
                }

                setSoundFeedback(null);

                if (soundTimeoutRef.current) {

                    clearTimeout(soundTimeoutRef.current);
                    soundTimeoutRef.current = null;
                }

                setFlippedCards([]);
                setMatchedPairs([]);
                setMemoryCards([]);
                setMemoryBusy(false);


                setWordLetters([]);
                setSelectedLetterIndexes([]);

                timeoutHandledRef.current = false;

                const url =
                    `${API}/exercises/` +
                    `${gamesId}/` +
                    `${gamesType}/` +
                    `${pinNumber}/` +
                    `${currentTask}` +
                    `?userId=${userId}`;


                console.log("Loading exercise:", url);

                const response =
                    await fetch(
                        url,
                        {
                            headers: token
                                ? {
                                    Authorization:
                                        `Bearer ${token}`,
                                }
                                : {},
                        }
                    );


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

                setExercise(data);

                let parsedContent = {};

                try {

                    parsedContent =
                        typeof data.content ===
                            "string"
                            ? JSON.parse(
                                data.content
                            )
                            : data.content ||
                            {};

                } catch (parseError) {

                    console.error("Content parse error:", parseError);
                    throw new Error("Содржината на задачата не може да се прочита.");
                }

                setContent(parsedContent);
                console.log("USER AGE:", data.userAge);
                console.log("AGE GROUP:", data.ageGroup);
                console.log("LEVEL:", data.levelNumber);
                console.log("WORLD:", data.worldNumber);
                console.log("CONTENT:", parsedContent);

                const level = Number(data.levelNumber) || Number(pinNumber) || 1;

                const taskTime =
                    data.gamesType === "MEMORY"
                        ? (
                            MEMORY_TIME_BY_LEVEL[
                                level
                            ] ||
                            MEMORY_TIME_BY_LEVEL[1]
                        )
                        : NORMAL_TIME;


                setTimeLeft(taskTime);

                if (
                    data.gamesType === "MEMORY" && Array.isArray(parsedContent.cards)
                ) {

                    setMemoryCards(shuffleArray(parsedContent.cards));
                }

                if (
                    data.gamesType ===
                        "WORD_BUILDING" &&
                    Array.isArray(
                        parsedContent.letters
                    )
                ) {

                    setWordLetters(shuffleArray(parsedContent.letters));
                }

            } catch (err) {

                if (!cancelled) {

                    console.error("Load exercise error:", err);
                    setError(err.message || "Не можеше да се вчита задачата.");
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


            if (timerRef.current) {

                clearInterval(timerRef.current);
                timerRef.current = null;
            }


            if (rhymeTimeoutRef.current) {

                clearTimeout(rhymeTimeoutRef.current);
                rhymeTimeoutRef.current = null;
            }


            if (syllableTimeoutRef.current) {

                clearTimeout(syllableTimeoutRef.current);
                syllableTimeoutRef.current = null;
            }


            if (soundTimeoutRef.current) {

                clearTimeout(soundTimeoutRef.current);
                soundTimeoutRef.current = null;
            }
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

            if (
                gamesType === "MEMORY" && !correctAnswer
            ) {
                correctAnswer = "Сите парови";
            }


            const payload = {

                userId: Number(userId),
                exerciseId: exercise.id,
                taskNumber: currentTask,
                question: content?.question || "",
                selectedAnswer: selected || (timedOut ? "Времето истече" : ""),
                correctAnswer,
                score: correct ? 1 : 0,
                correct: Boolean(correct),
                completed: true,
                timedOut: Boolean(timedOut),
            };


            const response =
                await fetch(
                    `${API}/exercise-progress`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

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
                throw new Error(text || `HTTP ${response.status}`
                );
            }

            const savedData = await response.json();
            console.log("Progress saved:", savedData); 

        } catch (err) {

            console.error(
                "Error saving attempt:",
                err
            );

        } finally {
            setSaving(false);
        }
    };


    const finishTask = async ({
        correct,
        selected,
        timedOut = false,
    }) => {

        if (answered) {
            return;
        }


        setAnswered(true);
        const newScore = score + (correct ? 1 : 0);

        if (correct) {
            setScore(newScore);

        } else {

            let correctAnswer = content?.answer || "";

            if (
                gamesType === "MEMORY" && !correctAnswer
            ) {
                correctAnswer = "Пронајди ги сите парови";
            }


            setWrongAnswers(
                previous => [
                    ...previous,

                    {
                        taskNumber: currentTask,
                        question: content?.question || "",
                        selectedAnswer: selected || (timedOut ? "Времето истече" : "Нема одговор"),
                        correctAnswer,
                    },
                ]
            );
        }

        await saveTaskProgress({
            correct,
            selected,
            timedOut,
        });


        if (
            currentTask >= TOTAL_TASKS
        ) {

            setFinalScore(newScore);
            setFinished(true);

            if (timerRef.current) {

                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            return;
        }

        setTimeout(() => {
            setCurrentTask(previous => previous + 1);
        }, 500);
    };


    const handleRhymesAnswer =
        async answer => {

            if (
                answered ||
                saving ||
                rhymeFeedback !== null
            ) {
                return;
            }


            const correct = String(answer) === String(content?.answer);
            setSelectedAnswer(answer);
            setAnswered(true);
            setRhymeFeedback(correct);

            const newScore = score + (correct ? 1 : 0);

            if (correct) {
                setScore(newScore);
            } else {
                setWrongAnswers(
                    previous => [
                        ...previous,

                        {
                            taskNumber: currentTask,
                            question: content?.question || "",
                            selectedAnswer: answer,
                            correctAnswer: content?.answer || "",
                        },
                    ]
                );
            }


            await saveTaskProgress({
                correct,
                selected: answer,
                timedOut: false,
            });


            rhymeTimeoutRef.current =
                setTimeout(() => {

                    if (
                        currentTask >= TOTAL_TASKS
                    ) {
                        setFinalScore(newScore);
                        setFinished(true);
                        return;
                    }


                    setRhymeFeedback(null);
                    setSelectedAnswer(null);
                    setCurrentTask(previous => previous + 1);
                }, 3000);
        };

    const handleSyllablesAnswer =
        async answer => {

            if (
                answered ||
                saving ||
                syllableFeedback !== null
            ) {
                return;
            }


            const correct = String(answer) === String(content?.answer);
            setSelectedAnswer(answer);
            setAnswered(true);
            setSyllableFeedback(correct);

            const newScore = score + (correct ? 1 : 0);

            if (correct) {
                setScore(newScore);
            } else {

                setWrongAnswers(
                    previous => [
                        ...previous,

                        {
                            taskNumber: currentTask,
                            question: content?.question || "",
                            selectedAnswer: answer,
                            correctAnswer: content?.answer || "",
                        },
                    ]
                );
            }


            await saveTaskProgress({
                correct,
                selected: answer,
                timedOut: false,
            });


            syllableTimeoutRef.current =
                setTimeout(() => {

                    if (
                        currentTask >= TOTAL_TASKS
                    ) {
                        setFinalScore( newScore);
                        setFinished(true);
                        return;
                    }

                    setSyllableFeedback(null);
                    setSelectedAnswer(null);
                    setCurrentTask(previous => previous + 1);
                }, 3000);
        };


    const handleSoundManipulationAnswer =
        async answer => {

            if (
                answered ||
                saving ||
                soundFeedback !== null
            ) {
                return;
            }


            const correct = String(answer) === String(content?.answer);
            setSelectedAnswer(answer);
            setAnswered(true);
            setSoundFeedback(correct);
            const newScore = score + (correct ? 1 : 0);

            if (correct) {
                setScore(newScore);

            } else {
                setWrongAnswers(
                    previous => [
                        ...previous,

                        {
                            taskNumber:
                                currentTask,

                            question:
                                content?.question ||
                                "",

                            selectedAnswer:
                                answer,

                            correctAnswer:
                                content?.answer ||
                                "",
                        },
                    ]
                );
            }


            await saveTaskProgress({
                correct,
                selected: answer,
                timedOut: false,
            });


            soundTimeoutRef.current =
                setTimeout(() => {

                    if (
                        currentTask >= TOTAL_TASKS
                    ) {

                        setFinalScore(newScore);
                        setFinished(true);
                        return;
                    }


                    setSoundFeedback(null);
                    setSelectedAnswer(null);
                    setCurrentTask(previous => previous + 1);
                }, 3000);
        };

    const handleAnswer =
        async answer => {

            if (
                answered || saving
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

            setSelectedAnswer(answer);
            const correct = String(answer) === String(content?.answer);

            if (
                isMissingLetterGame &&
                correct
            ) {

                setMissingLetterCompleted(true);
                setAnswered(true);
                const newScore = score + 1;

                setScore(newScore);

                await saveTaskProgress({
                    correct: true,
                    selected: answer,
                    timedOut: false,
                });


                setTimeout(() => {

                    if (
                        currentTask >= TOTAL_TASKS
                    ) {

                        setFinalScore(newScore);
                        setFinished(true);
                        return;
                    }


                    setMissingLetterCompleted(false);
                    setSelectedAnswer(null);
                    setAnswered(false);
                    setCurrentTask(previous => previous + 1);
                }, 3000);

                return;
            }


            await finishTask({
                correct,
                selected: answer,
                timedOut: false,
            });
        };



    const handleWordLetterClick =
        index => {

            if (
                answered ||
                saving
            ) {
                return;
            }


            if (
                selectedLetterIndexes.includes(
                    index
                )
            ) {
                return;
            }


            const newIndexes = [
                ...selectedLetterIndexes,
                index,
            ];

            setSelectedLetterIndexes(newIndexes);

            const builtWord =
                newIndexes
                    .map(
                        itemIndex =>
                            wordLetters[
                                itemIndex
                            ]
                    )
                    .join("");


            if (
                newIndexes.length === wordLetters.length
            ) {

                const correct = builtWord === String(content?.answer || "");
                setSelectedAnswer(builtWord);
                setTimeout(() => {
                    finishTask({
                        correct,
                        selected: builtWord,
                        timedOut: false,
                    });

                }, 250);
            }
        };


    const removeLastWordLetter =
        () => {

            if (
                answered ||
                saving ||
                selectedLetterIndexes.length ===
                0
            ) {
                return;
            }


            setSelectedLetterIndexes(
                previous =>
                    previous.slice(
                        0,
                        -1
                    )
            );
        };


    const resetWord = () => {

        if (
            answered ||
            saving
        ) {
            return;
        }


        setSelectedLetterIndexes(
            []
        );
    };


    const handleMemoryCardClick =
        async card => {

            if (
                answered ||
                saving ||
                memoryBusy
            ) {
                return;
            }


            if (
                flippedCards.includes(
                    card.id
                ) ||
                matchedPairs.includes(
                    card.pairId
                )
            ) {
                return;
            }


            if (
                flippedCards.length >=
                2
            ) {
                return;
            }


            const newFlippedCards = [
                ...flippedCards,
                card.id,
            ];


            setFlippedCards(newFlippedCards);


            if (
                newFlippedCards.length === 1
            ) {
                return;
            }


            const firstCard =
                memoryCards.find(
                    item =>
                        item.id ===
                        newFlippedCards[0]
                );


            const secondCard =
                memoryCards.find(
                    item =>
                        item.id ===
                        newFlippedCards[1]
                );


            if (
                !firstCard || !secondCard
            ) {
                return;
            }


            setMemoryBusy(true);


            if (
                firstCard.pairId === secondCard.pairId
            ) {

                const newMatchedPairs =
                    [
                        ...matchedPairs,
                        firstCard.pairId,
                    ];


                setMatchedPairs(
                    newMatchedPairs
                );


                setTimeout(
                    async () => {

                        setFlippedCards(
                            []
                        );


                        setMemoryBusy(
                            false
                        );


                        const totalPairs =
                            new Set(
                                memoryCards.map(
                                    item =>
                                        item.pairId
                                )
                            ).size;


                        if (
                            newMatchedPairs.length >= totalPairs
                        ) {

                            await finishTask(
                                {
                                    correct: true,
                                    selected: "Сите парови се пронајдени",
                                    timedOut: false,
                                }
                            );
                        }

                    },
                    500
                );


                return;
            }

            setTimeout(() => {

                setFlippedCards(
                    []
                );

                setMemoryBusy(
                    false
                );

            }, 850);
        };


    useEffect(() => {

        if (
            loading ||
            finished ||
            answered ||
            !content
        ) {
            return;
        }


        timeoutHandledRef.current =
            false;


        if (timerRef.current) {

            clearInterval(
                timerRef.current
            );
        }


        timerRef.current =
            setInterval(() => {

                setTimeLeft(
                    previous => {

                        if (
                            previous <=
                            1
                        ) {

                            if (
                                timerRef.current
                            ) {

                                clearInterval(
                                    timerRef.current
                                );

                                timerRef.current =
                                    null;
                            }


                            return 0;
                        }


                        return (
                            previous - 1
                        );
                    }
                );

            }, 1000);


        return () => {

            if (
                timerRef.current
            ) {

                clearInterval(
                    timerRef.current
                );

                timerRef.current =
                    null;
            }

        };

    }, [
        loading,
        finished,
        answered,
        content,
        currentTask,
    ]);


    useEffect(() => {

        if (
            timeLeft !== 0 ||
            loading ||
            finished ||
            answered ||
            !content
        ) {
            return;
        }


        if (
            timeoutHandledRef.current
        ) {
            return;
        }


        timeoutHandledRef.current =
            true;


        finishTask({
            correct: false,

            selected:
                "Времето истече",

            timedOut: true,
        });

    }, [
        timeLeft,
        loading,
        finished,
        answered,
        content,
    ]);


    const goBackToWorld = () => {

        navigate(
            `/world/${worldId}`
        );
    };


    const goToNextMission = async () => {
        try {
            if (!token || !userId) {
                navigate("/login");
                return;
            }

            const response = await fetch(
                `${API}/games/world/${Number(worldId)}?userId=${userId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Не може да се вчитаат игрите од светот.");
            }

            const data = await response.json();
            if (!Array.isArray(data)) {
                throw new Error("Серверот не врати валидна листа на игри.");
            }

            const games = data.slice(0, 6);
            const currentIndex = games.findIndex(
                game => Number(game.id) === Number(gamesId)
            );

            if (currentIndex === -1) {
                throw new Error("Тековната игра не е пронајдена во светот.");
            }

            const nextGame = games[currentIndex + 1];

            if (!nextGame) {
                navigate(`/world/${worldId}`);
                return;
            }

            const gameTypes = [
                "MEMORY",
                "WORD_BUILDING",
                "MISSING_LETTER",
                "RHYMES",
                "SYLLABLES",
                "SOUND_MANIPULATION",
            ];
            const nextType = nextGame.gamesType || gameTypes[currentIndex + 1];

            if (!nextType) {
                throw new Error("Следната игра нема дефиниран тип.");
            }

            if (timerRef.current) clearInterval(timerRef.current);
            if (rhymeTimeoutRef.current) clearTimeout(rhymeTimeoutRef.current);
            if (syllableTimeoutRef.current) clearTimeout(syllableTimeoutRef.current);
            if (soundTimeoutRef.current) clearTimeout(soundTimeoutRef.current);

            timerRef.current = null;
            rhymeTimeoutRef.current = null;
            syllableTimeoutRef.current = null;
            soundTimeoutRef.current = null;
            timeoutHandledRef.current = false;

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

            navigate(`/world/${worldId}/exercise/${nextGame.id}/${nextType}/${pinNumber}`);
        } catch (err) {
            console.error("Next mission error:", err);
            alert(err.message || "Не може да се отвори следната мисија.");
        }
    };


    if (loading) {

        return (

            <div className="exercise-page">

                <header className="exercise-header">

                    <Logo />

                    <div className="exercise-header-actions">

                        <HomeButton />
                        <ProfileButton />
                        <LogoutButton />

                    </div>

                </header>


                <main className="exercise-loading">

                    <div className="loading-spinner">
                        ⏳
                    </div>

                    <h2>
                        Ја подготвуваме
                        задачата...
                    </h2>

                </main>

            </div>
        );
    }


    if (error) {

        return (

            <div className="exercise-page">

                <header className="exercise-header">

                    <Logo />

                    <div className="exercise-header-actions">

                        <HomeButton />
                        <ProfileButton />
                        <LogoutButton />

                    </div>

                </header>


                <main className="exercise-error">

                    <div className="error-card">

                        <div className="error-icon">
                            ⚠️
                        </div>

                        <h2>
                            Не можеше да се
                            вчита задачата
                        </h2>

                        <p>
                            {error}
                        </p>

                        <button
                            className="back-world-btn"
                            onClick={
                                goBackToWorld
                            }
                        >
                            ← Назад кон игрите
                        </button>

                    </div>

                </main>

            </div>
        );
    }



    if (finished) {

        const resultScore =
            finalScore ?? score;


        const percentage =
            Math.round(
                (
                    resultScore /
                    TOTAL_TASKS
                ) *
                100
            );


        return (

            <div className="exercise-page">

                <header className="exercise-header">

                    <Logo />

                    <div className="exercise-header-actions">

                        <HomeButton />
                        <ProfileButton />
                        <LogoutButton />

                    </div>

                </header>


                <main className="exercise-finished">

                    <div className="finished-card">

                        <div className="finished-top">
                            <span>
                                Мисијата е завршена
                            </span>
                        </div>


                        <h1>
                            {resultScore >= 8
                                ? "Браво! 🎉"
                                : resultScore >= 5
                                    ? "Одличен труд! ⭐"
                                    : "Супер обид! 🌟"}
                        </h1>


                        <p className="finished-message">
                            {resultScore >= 8
                                ? "Одлично ја заврши мисијата!"
                                : resultScore >= 5
                                    ? "Супер! Уште малку вежбање и ќе бидеш уште подобар."
                                    : "Браво што се обиде! Секое вежбање те прави посилен."}
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

                                <span>
                                    ✓
                                </span>

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

                                <span>
                                    ×
                                </span>

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
                                    goBackToWorld
                                }
                            >
                                ← Назад кон игрите
                            </button>

                            <button
                                className="finished-primary-btn"
                                onClick={goToNextMission}
                            >
                                🚀 Следна мисија
                            </button>

                        </div>

                    </div>


                    {wrongAnswers.length >
                        0 && (

                        <div className="mistakes-card">

                            <h2>
                                Ајде да ги
                                погледнеме
                                задачите
                            </h2>

                            <p className="mistakes-subtitle">
                                Еве ги задачите
                                што можеш
                                повторно да ги
                                вежбаш.
                            </p>


                            <div className="mistakes-list">

                                {wrongAnswers.map(
                                    item => (

                                        <div
                                            className="mistake-item"
                                            key={
                                                item.taskNumber
                                            }
                                        >

                                            <div className="mistake-number">
                                                {
                                                    item.taskNumber
                                                }
                                            </div>


                                            <div className="mistake-content">

                                                <strong>
                                                    {
                                                        item.question
                                                    }
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

                                    )
                                )}

                            </div>

                        </div>

                    )}

                </main>

            </div>
        );
    }


    const builtWord =
        selectedLetterIndexes
            .map(
                index =>
                    wordLetters[index]
            )
            .join("");



    const missingLetterWord =
        String(
            content?.word || ""
        );


    const missingLetterParts =
        missingLetterWord.split("");


    return (

        <div className="exercise-page">

            <header className="exercise-header">

                <Logo />

                <div className="exercise-header-actions">

                    <HomeButton />
                    <ProfileButton />
                    <LogoutButton />

                </div>

            </header>


            <main className="exercise-main">


                {}

                <div className="exercise-topbar">

                    <button
                        className="exercise-back-btn"
                        onClick={
                            goBackToWorld
                        }
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


                {}

                <section className="exercise-title">

                    <div className="mission-label">
                        МИСИЈА {pinNumber}
                    </div>

                    <h1>
                        {content?.question ||
                            "Задача"}
                    </h1>

                </section>


                {}

                {isWordBuildingGame && (

                    <section className="word-building-game">

                        <div className="word-building-answer-card">

                            <div className="answer-label">
                                Твојот збор
                            </div>


                            <div className="word-building-slots">

                                {wordLetters.map(
                                    (
                                        _,
                                        index
                                    ) => {

                                        const selectedIndex =
                                            selectedLetterIndexes[
                                                index
                                            ];


                                        const letter =
                                            selectedIndex !==
                                                undefined
                                                ? wordLetters[
                                                    selectedIndex
                                                ]
                                                : "";


                                        return (

                                            <div
                                                key={
                                                    index
                                                }
                                                className={`word-slot ${
                                                    letter
                                                        ? "filled"
                                                        : ""
                                                }`}
                                            >
                                                {
                                                    letter
                                                }
                                            </div>

                                        );
                                    }
                                )}

                            </div>


                            {builtWord && (

                                <div className="built-word-preview">
                                    {builtWord}
                                </div>

                            )}

                        </div>


                        <div className="word-building-description">

                            <div className="description-emoji">
                                {content?.emoji ||
                                    "💡"}
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

                            {wordLetters.map(
                                (
                                    letter,
                                    index
                                ) => (

                                    <button
                                        key={
                                            `${letter}-${index}`
                                        }
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

                                )
                            )}

                        </div>


                        <div className="word-building-actions">

                            <button
                                type="button"
                                className="word-action-btn secondary"
                                onClick={
                                    removeLastWordLetter
                                }
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
                                onClick={
                                    resetWord
                                }
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


                {}

                {isMemoryGame && (

                    <section className="memory-game">

                        <div className="memory-instruction">
                            🧠 Пронајди ги сите
                            парови!
                        </div>


                        <div className="memory-board">

                            {memoryCards.map(
                                card => {

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
                                            key={
                                                card.id
                                            }
                                            type="button"
                                            className={`memory-card ${
                                                isFlipped ||
                                                isMatched
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
                                                        onError={e => {
                                                            e.currentTarget.style.display =
                                                                "none";
                                                        }}
                                                    />

                                                    <span>
                                                        {
                                                            card.label
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                        </button>
                                    );
                                }
                            )}

                        </div>

                    </section>

                )}


                {}

                {isMissingLetterGame && (

                    <section className="missing-letter-game">

                        <div className="missing-letter-word-card">

                            <div className="missing-letter-label">
                                🔤 Пронајди ја буквата
                            </div>


                            <div className="missing-letter-word">

                                {missingLetterParts.map(
                                    (
                                        character,
                                        index
                                    ) => {

                                        if (
                                            character ===
                                            "_"
                                        ) {

                                            return (

                                                <span
                                                    key={
                                                        index
                                                    }
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
                                                key={
                                                    index
                                                }
                                                className="missing-letter-character"
                                            >
                                                {
                                                    character
                                                }
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


                        {!missingLetterCompleted && (

                            <>
                                {Array.isArray(
                                    content?.options
                                ) && (

                                    <div className="answer-options missing-letter-options">

                                        {content.options.map(
                                            (
                                                option,
                                                index
                                            ) => (

                                                <button
                                                    key={
                                                        index
                                                    }
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
                                                        {
                                                            option
                                                        }
                                                    </span>

                                                </button>

                                            )
                                        )}

                                    </div>

                                )}
                            </>

                        )}

                    </section>

                )}


                {}

                {isRhymesGame && (

                    <section className="normal-exercise rhymes-exercise">

                        {Array.isArray(
                            content?.options
                        ) && (

                            <div className="answer-options rhymes-options">

                                {content.options.map(
                                    (
                                        option,
                                        index
                                    ) => {

                                        const isSelected =
                                            String(
                                                selectedAnswer
                                            ) ===
                                            String(
                                                option
                                            );


                                        const isCorrect =
                                            String(option) ===
                                            String(content?.answer);


                                        let optionClass =
                                            "answer-option";


                                        if (
                                            rhymeFeedback !==
                                            null
                                        ) {

                                            if (
                                                isCorrect
                                            ) {

                                                optionClass +=
                                                    " rhyme-correct";

                                            } else if (
                                                isSelected &&
                                                !isCorrect
                                            ) {

                                                optionClass +=
                                                    " rhyme-wrong";
                                            }

                                        } else if (
                                            isSelected
                                        ) {

                                            optionClass +=
                                                " selected";
                                        }


                                        return (

                                            <button
                                                key={
                                                    index
                                                }
                                                type="button"
                                                className={
                                                    optionClass
                                                }
                                                onClick={() =>
                                                    handleRhymesAnswer(
                                                        option
                                                    )
                                                }
                                                disabled={
                                                    answered ||
                                                    saving ||
                                                    rhymeFeedback !==
                                                    null
                                                }
                                            >

                                                <span>
                                                    {
                                                        option
                                                    }
                                                </span>

                                            </button>

                                        );
                                    }
                                )}

                            </div>

                        )}


                        {rhymeFeedback !== null && (

                            <div
                                className={`rhyme-feedback ${
                                    rhymeFeedback
                                        ? "success"
                                        : "error"
                                }`}
                            >

                                {rhymeFeedback ? (

                                    <>
                                        <span>
                                            ✓
                                        </span>

                                        <strong>
                                            Точно! 🎉
                                        </strong>
                                    </>

                                ) : (

                                    <>
                                        <span>
                                            ✕
                                        </span>

                                        <strong>
                                            Не е точно ❌
                                        </strong>
                                    </>

                                )}

                            </div>

                        )}

                    </section>

                )}


                {}

                {isSyllablesGame && (

                    <section className="normal-exercise syllables-exercise">

                        {Array.isArray(
                            content?.options
                        ) && (

                            <div className="answer-options syllables-options">

                                {content.options.map(
                                    (
                                        option,
                                        index
                                    ) => {

                                        const isSelected =
                                            String(
                                                selectedAnswer
                                            ) ===
                                            String(
                                                option
                                            );


                                        const isCorrect =
                                            String(
                                                option
                                            ) ===
                                            String(
                                                content?.answer
                                            );


                                        let optionClass =
                                            "answer-option";


                                        if (
                                            syllableFeedback !==
                                            null
                                        ) {

                                            if (
                                                isCorrect
                                            ) {

                                                optionClass +=
                                                    " syllable-correct";

                                            } else if (
                                                isSelected &&
                                                !isCorrect
                                            ) {

                                                optionClass +=
                                                    " syllable-wrong";
                                            }

                                        } else if (
                                            isSelected
                                        ) {

                                            optionClass +=
                                                " selected";
                                        }


                                        return (

                                            <button
                                                key={
                                                    index
                                                }
                                                type="button"
                                                className={
                                                    optionClass
                                                }
                                                onClick={() =>
                                                    handleSyllablesAnswer(
                                                        option
                                                    )
                                                }
                                                disabled={
                                                    answered ||
                                                    saving ||
                                                    syllableFeedback !==
                                                    null
                                                }
                                            >

                                                <span className="option-number">
                                                    {String.fromCharCode(
                                                        65 +
                                                        index
                                                    )}
                                                </span>

                                                <span>
                                                    {
                                                        option
                                                    }
                                                </span>

                                            </button>

                                        );
                                    }
                                )}

                            </div>

                        )}


                        {syllableFeedback !== null && (

                            <div
                                className={`syllable-feedback ${
                                    syllableFeedback
                                        ? "success"
                                        : "error"
                                }`}
                            >

                                {syllableFeedback ? (

                                    <>
                                        <span>
                                            ✓
                                        </span>

                                        <strong>
                                            Точно! 🎉
                                        </strong>
                                    </>

                                ) : (

                                    <>
                                        <span>
                                            ✕
                                        </span>

                                        <strong>
                                            Не е точно ❌
                                        </strong>
                                    </>

                                )}

                            </div>

                        )}

                    </section>

                )}


                {}

                {isSoundManipulationGame && (

                    <section className="normal-exercise sound-manipulation-exercise">

                        {Array.isArray(
                            content?.options
                        ) && (

                            <div className="answer-options sound-options">

                                {content.options.map(
                                    (
                                        option,
                                        index
                                    ) => {

                                        const isSelected =
                                            String(
                                                selectedAnswer
                                            ) ===
                                            String(
                                                option
                                            );


                                        const isCorrect =
                                            String(
                                                option
                                            ) ===
                                            String(
                                                content?.answer
                                            );


                                        let optionClass =
                                            "answer-option";


                                        if (
                                            soundFeedback !==
                                            null
                                        ) {

                                            if (
                                                isCorrect
                                            ) {

                                                optionClass +=
                                                    " sound-correct";

                                            } else if (
                                                isSelected &&
                                                !isCorrect
                                            ) {

                                                optionClass +=
                                                    " sound-wrong";
                                            }

                                        } else if (
                                            isSelected
                                        ) {

                                            optionClass +=
                                                " selected";
                                        }


                                        return (

                                            <button
                                                key={
                                                    index
                                                }
                                                type="button"
                                                className={
                                                    optionClass
                                                }
                                                onClick={() =>
                                                    handleSoundManipulationAnswer(
                                                        option
                                                    )
                                                }
                                                disabled={
                                                    answered ||
                                                    saving ||
                                                    soundFeedback !==
                                                    null
                                                }
                                            >

                                                <span className="option-number">
                                                    {String.fromCharCode(
                                                        65 +
                                                        index
                                                    )}
                                                </span>

                                                <span>
                                                    {
                                                        option
                                                    }
                                                </span>

                                            </button>

                                        );
                                    }
                                )}

                            </div>

                        )}


                        {soundFeedback !== null && (

                            <div
                                className={`sound-feedback ${
                                    soundFeedback
                                        ? "success"
                                        : "error"
                                }`}
                            >

                                {soundFeedback ? (

                                    <>
                                        <span>
                                            ✓
                                        </span>

                                        <strong>
                                            Точно! 🎉
                                        </strong>
                                    </>

                                ) : (

                                    <>
                                        <span>
                                            ✕
                                        </span>

                                        <strong>
                                            Не е точно ❌
                                        </strong>
                                    </>

                                )}

                            </div>

                        )}

                    </section>

                )}


                {}

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


                            {Array.isArray(
                                content?.options
                            ) && (

                                <div className="answer-options">

                                    {content.options.map(
                                        (
                                            option,
                                            index
                                        ) => (

                                            <button
                                                key={
                                                    index
                                                }
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
                                                        65 +
                                                        index
                                                    )}
                                                </span>

                                                <span>
                                                    {
                                                        option
                                                    }
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