
import "../styles/GameSelection.css";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import ProfileButton from "../widgets/ProfileButton";
import { worldsData } from "../data/worldsData";
import { API } from "../data/api";
import HomeButton from "../widgets/HomeButton";
import LogoutButton from "../widgets/LogoutButton";
import Logo from "../widgets/Logo";

function GameSelection() {

    const navigate = useNavigate();

    const [worldAccess, setWorldAccess] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadWorldAccess = async () => {

            try {

                setLoading(true);

                const token = localStorage.getItem("token");
                const userId = localStorage.getItem("userId");

                if (!token || !userId) {
                    navigate("/login");
                    return;
                }

                const headers = {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                };

                const worldIds = Object.keys(worldsData);

                const results = await Promise.all(
                    worldIds.map(async (id) => {

                        try {

                            const response = await fetch(
                                `${API}/games/world/${id}/access?userId=${userId}`,
                                {
                                    method: "GET",
                                    headers
                                }
                            );

                            if (!response.ok) {
                                return [id, false];
                            }

                            const data = await response.json();

                            return [
                                id,
                                data.unlocked === true
                            ];

                        } catch (error) {

                            console.error(
                                `Error loading world ${id}:`,
                                error
                            );

                            return [id, false];
                        }

                    })
                );

                setWorldAccess(
                    Object.fromEntries(results)
                );

            } catch (error) {

                console.error(
                    "Error loading world access:",
                    error
                );

            } finally {

                setLoading(false);
            }
        };

        loadWorldAccess();

    }, [navigate]);

    return (

        <div className="game-selection">

            <header className="game-selection-header">

                <Logo />

                <div className="nav-icons-row">

                    <HomeButton />
                    <LogoutButton />
                    <ProfileButton />

                </div>

            </header>

            <section className="game-selection-intro">

                <h1>
                    Избери свет и{" "}
                    <span>
                        започни со авантурата!
                    </span>
                </h1>

                <p>
                    Во првиот свет те очекуваат
                    шест различни игри. Секоја игра
                    има три нивоа, а следното ниво
                    се отклучува кога успешно ќе го
                    завршиш претходното.
                </p>

            </section>

            <section className="game-grid">

                {Object.entries(worldsData)
                    .map(([id, world]) => {

                        const isLocked =
                            loading ||
                            worldAccess[id] !== true;

                        return (

                            <div
                                key={id}
                                className={
                                    `game-card game-${world.color} ${
                                        isLocked
                                            ? "locked"
                                            : ""
                                    }`
                                }
                                onClick={() => {

                                    if (!isLocked) {

                                        navigate(
                                            `/world/${id}`
                                        );
                                    }

                                }}
                            >

                                <div
                                    className="game-image"
                                    style={{
                                        backgroundImage:
                                            `url(${world.img})`
                                    }}
                                >

                                    <div className="game-overlay" />

                                    {isLocked && (

                                        <div className="lock-badge">

                                            <span>
                                                🔒
                                            </span>

                                        </div>

                                    )}

                                    {!isLocked && (

                                        <div className="progress-pill">

                                            6 игри · 3 нивоа

                                        </div>

                                    )}

                                    <div className="game-text">

                                        <h3>
                                            {world.name}
                                        </h3>

                                    </div>

                                </div>

                            </div>
                        );
                    })}

            </section>

            <footer>

                <div className="quote">

                    <p>
                        Секој чекор те прави подобар читател! 🌟
                    </p>

                </div>

            </footer>

        </div>
    );
}

export default GameSelection;
