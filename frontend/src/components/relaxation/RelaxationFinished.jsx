import React from "react";

export default function RelaxationFinished({
    totalExercises,
    onBack,
    onRestart,
}) {
    const totalSeconds = totalExercises * 30;

    const duration =
        `${Math.floor(totalSeconds / 60)}:` +
        `${String(totalSeconds % 60).padStart(2, "0")}`;

    return (
        <div className="relaxation-finished">

            <div className="finished-icon">
                🎉
            </div>

            <h1>
                Браво!
            </h1>

            <p>
                Ја заврши твојата пауза!
            </p>

            <div className="finished-stats">

                <div>
                    <strong>
                        {totalExercises}
                    </strong>

                    <span>
                        вежби
                    </span>
                </div>

                <div>
                    <strong>
                        {duration}
                    </strong>

                    <span>
                        минути вежбање
                    </span>
                </div>

                <div>
                    <strong>
                        100%
                    </strong>

                    <span>
                        завршено
                    </span>
                </div>

            </div>

            <p className="finished-message">
                Одлична работа! Сега си подготвен/а
                за нови предизвици. 🌟
            </p>

            <div className="finished-buttons">

                <button
                    className="relaxation-start-button"
                    onClick={onRestart}
                >
                    Повторно
                </button>

                <button
                    className="relaxation-back-button"
                    onClick={onBack}
                >
                    Назад
                </button>

            </div>

        </div>
    );
}
