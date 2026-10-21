import React from "react";

export default function RelaxationCountdown({
    countdown,
}) {
    return (
        <div className="relaxation-countdown">

            <div className="relaxation-small-title">
                ПОДГОТВИ СЕ
            </div>

            <h1>
                Почнуваме за...
            </h1>

            <div className="big-countdown">
                {countdown}
            </div>

            <p>
                Намести се удобно и подготви се
                за кратко раздвижување. 🌿
            </p>

        </div>
    );
}
