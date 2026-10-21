import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/RelaxationPage.css";
import relaxationExercises from "../data/relaxationExercises";
import { normalizeGender } from "../data/relaxationVideos";
import { API } from "../data/api";
import RelaxationIntro from "../components/relaxation/RelaxationIntro";
import RelaxationCountdown from "../components/relaxation/RelaxationCountdown";
import RelaxationExercise from "../components/relaxation/RelaxationExercise";
import RelaxationFinished from "../components/relaxation/RelaxationFinished";
import ProfileButton from "../widgets/ProfileButton";
import HomeButton from "../widgets/HomeButton";
import LogoutButton from "../widgets/LogoutButton";
import Logo from "../widgets/Logo";

const EXERCISE_DURATION = 30;
const PREP_DURATION = 10;
const START_COUNTDOWN = 15;

export default function RelaxationPage() {

    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState("");
    const [phase, setPhase] = useState("intro");
    const [countdown, setCountdown] = useState(START_COUNTDOWN);
    const [currentExercise, setCurrentExercise] = useState(0);
    const [timeLeft, setTimeLeft] = useState(EXERCISE_DURATION);
    const exercises = relaxationExercises;
    const exercise = exercises[currentExercise];
    const gender = normalizeGender(profile?.gender);
    const sessionProgress =
        phase === "finished"
            ? 100
            : exercises.length > 0
                ? Math.min(
                    100,
                    Math.max(
                        0,
                        (
                            currentExercise +
                            (
                                phase === "exercise"
                                    ? (EXERCISE_DURATION - timeLeft)
                                        / EXERCISE_DURATION
                                    : 0
                            )
                        ) / exercises.length * 100
                    )
                )
                : 0;

 
    useEffect(() => {

        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!userId || !token) {
            navigate("/login", { replace: true });
            return;
        }

        const controller = new AbortController();
        async function loadProfile() {

            try {

                setProfileLoading(true);
                setProfileError("");

                const response = await fetch(
                    `${API}/profile/${encodeURIComponent(userId)}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        signal: controller.signal
                    }
                );

                if (response.status === 401 || response.status === 403) {
                    navigate("/login", { replace: true });
                    return;
                }

                if (!response.ok) {
                    throw new Error(
                        "Не може да се вчита корисничкиот профил."
                    );
                }

                const data = await response.json();

                if (!controller.signal.aborted) {
                    setProfile(data);
                }

            } catch (error) {

                if (
                    error.name !== "AbortError" &&
                    !controller.signal.aborted
                ) {
                    setProfileError(error.message);
                }

            } finally {

                if (!controller.signal.aborted) {
                    setProfileLoading(false);
                }

            }
        }

        loadProfile();

        return () => controller.abort();

    }, [navigate]);

    useEffect(() => {

        if (phase !== "countdown") return;

        if (countdown <= 0) {

            setCurrentExercise(0);
            setTimeLeft(EXERCISE_DURATION);
            setPhase("exercise");

            return;
        }

        const timer = setTimeout(() => {
            setCountdown(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);

    }, [phase, countdown]);

    useEffect(() => {

        if (phase !== "exercise" || !exercise) return;

        if (timeLeft <= 0) {

            const isLastExercise =
                currentExercise >= exercises.length - 1;

            if (isLastExercise) {

                setPhase("finished");

            } else {

                setCurrentExercise(prev => prev + 1);
                setTimeLeft(PREP_DURATION);
                setPhase("transition");

            }

            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);

    }, [
        phase,
        timeLeft,
        currentExercise,
        exercises.length,
        exercise
    ]);

    useEffect(() => {

        if (phase !== "transition") return;

        if (timeLeft <= 0) {

            setTimeLeft(EXERCISE_DURATION);
            setPhase("exercise");

            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);

    }, [phase, timeLeft]);

    const startRelaxation = () => {

        setCurrentExercise(0);
        setTimeLeft(EXERCISE_DURATION);
        setCountdown(START_COUNTDOWN);
        setPhase("countdown");

    };

    const goBack = () => {
        navigate(-1);
    };

    const renderHeader = () => (
        <header className="relaxation-header-main">

            <div className="relaxation-logo">
                <Logo />
            </div>

            <div className="relaxation-header-buttons">
                <ProfileButton />
                <HomeButton />
                <LogoutButton />
            </div>

        </header>
    );

    let content;

    if (profileLoading) {

        content = (
            <div className="relaxation-transition">
                <h2>Се вчитува профилот...</h2>
            </div>
        );

    } else if (profileError || !gender) {

        content = (
            <div className="relaxation-transition">

                <h2>Потребна е проверка на профилот</h2>

                <p>
                    {profileError ||
                        "Полот не е препознаен во профилот."}
                </p>

                <button
                    className="relaxation-back-button"
                    onClick={goBack}
                >
                    Назад
                </button>

            </div>
        );

    } else if (phase === "intro") {

        content = (
            <RelaxationIntro
                onStart={startRelaxation}
                onBack={goBack}
            />
        );

    } else if (phase === "countdown") {

        content = (
            <RelaxationCountdown
                countdown={countdown}
            />
        );

    } else if (phase === "transition") {

        content = (
            <div className="relaxation-transition">

                <div className="transition-icon">
                    🌿
                </div>

                <h2>Одлично!</h2>

                <p>
                    Подготви се за следната вежба
                </p>

                <h1>
                    {exercise?.name}
                </h1>

                <div className="transition-countdown">
                    {timeLeft}
                </div>

                <span>
                    Уште малку и продолжуваме! ✨
                </span>

            </div>
        );

    } else if (phase === "finished") {

        content = (
            <RelaxationFinished
                totalExercises={exercises.length}
                onBack={goBack}
                onRestart={startRelaxation}
            />
        );

    } else if (phase === "exercise" && exercise) {

        content = (
            <RelaxationExercise
                exercise={exercise}
                gender={gender}
                currentExercise={currentExercise}
                totalExercises={exercises.length}
                sessionProgress={sessionProgress}
                timeLeft={timeLeft}
                onExit={goBack}
            />
        );

    } else {

        content = (
            <RelaxationIntro
                onStart={startRelaxation}
                onBack={goBack}
            />
        );

    }

    return (
        <div className="relaxation-page">

            {renderHeader()}

            <main className="relaxation-content">
                {content}
            </main>

        </div>
    );
}
