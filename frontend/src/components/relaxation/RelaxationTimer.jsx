
import React from "react";

export default function RelaxationTimer({
    timeLeft,
}) {
    return (
        <div className="exercise-timer">

            <div className="timer-circle">

                <span>
                    {timeLeft}
                </span>

                <small>
                    секунди
                </small>

            </div>

        </div>
    );
}
