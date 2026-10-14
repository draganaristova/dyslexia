
import React from "react";

export default function RelaxationIntro({
    onStart,
    onBack,
}) {
    return (
        <div className="relaxation-intro-wrapper">

            <button
                className="relaxation-back"
                onClick={onBack}
                aria-label="Назад"
            >
                ←
            </button>

            <div className="relaxation-intro">

                <div className="relaxation-leaf">
                    🌿
                </div>

                <h1>
                    Време е за мала пауза!
                </h1>

                <p className="relaxation-intro-text">
                    По учењето и решавањето задачи,
                    време е малку да го раздвижиме
                    телото и да го освежиме умот.
                </p>

                <p className="relaxation-intro-text">
                    Следи го нашиот лик и прави ги
                    движењата заедно со него.
                </p>

                <div className="relaxation-info">

                    <div>
                        <span>🧘</span>
                        <span>5 вежби</span>
                    </div>

                    <div>
                        <span>⏱️</span>
                        <span>30 сек. по вежба</span>
                    </div>

                    <div>
                        <span>🌿</span>
                        <span>Кратка пауза</span>
                    </div>

                </div>

                <button
                    className="relaxation-start-button"
                    onClick={onStart}
                >
                    Почнуваме!
                </button>

            </div>

        </div>
    );
}
