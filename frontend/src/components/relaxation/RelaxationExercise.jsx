
import React, { useEffect, useState } from "react";
import RelaxationTimer from "./RelaxationTimer";
import { getExerciseVideo } from "../../data/relaxationVideos";

export default function RelaxationExercise({
    exercise,
    gender,
    currentExercise,
    totalExercises,
    sessionProgress,
    timeLeft,
    onExit,
}) {
    const videoSrc = getExerciseVideo(exercise.type, gender);
    const [videoError, setVideoError] = useState(false);

    useEffect(() => {
        setVideoError(false);
    }, [videoSrc]);

    return (
        <div className="relaxation-page-section">
            <div className="relaxation-workout">

                <div className="relaxation-header">
                    <button
                        type="button"
                        className="relaxation-exit"
                        onClick={onExit}
                        aria-label="Излези од вежбите"
                    >
                        ✕
                    </button>

                    <div className="exercise-counter">
                        {currentExercise + 1} / {totalExercises}
                    </div>
                </div>

                <div
                    className="session-progress"
                    role="progressbar"
                    aria-valuenow={Math.round(sessionProgress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                >
                    <div
                        className="session-progress-fill"
                        style={{ width: `${sessionProgress}%` }}
                    />
                </div>

                {/* VIDEO AND TIMER IN THE SAME ROW */}
                <div className="relaxation-video-stage">

                    <div className="exercise-animation exercise-video-container">
                        {videoSrc && !videoError ? (
                            <video
                                key={videoSrc}
                                className="relaxation-video"
                                src={videoSrc}
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="auto"
                                onError={() => setVideoError(true)}
                            />
                        ) : (
                            <div className="exercise-video-unavailable">
                                <span>🎬</span>
                                <strong>Видеото сè уште не е достапно</strong>
                                <p>Видеото за оваа вежба не е пронајдено.</p>
                            </div>
                        )}
                    </div>

                    <aside className="relaxation-floating-timer">
                        <span className="floating-timer-label">
                            Преостанато време
                        </span>

                        <RelaxationTimer timeLeft={timeLeft} />

                        <span className="floating-timer-hint">
                            Движи се полека 🌿
                        </span>
                    </aside>

                </div>

                <p className="exercise-instruction">
                    {exercise.instruction}
                </p>

                <div className="exercise-bottom">
                    Следи го примерот и движи се полека. 🌿
                </div>

            </div>
        </div>
    );
}
