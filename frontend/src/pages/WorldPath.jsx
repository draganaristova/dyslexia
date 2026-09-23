import "../styles/WorldPath.css";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import ProfileButton from "../widgets/ProfileButton";
import { worldsData, exerciseTypes } from "../data/worldsData";
import HomeButton from "../widgets/HomeButton";
import LogoutButton from "../widgets/LogoutButton";
import Logo from "../widgets/Logo";
import { API } from "../data/api";

function WorldPath() {
    const { worldId } = useParams();
    const navigate = useNavigate();

    const world = worldsData[worldId];

    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /*
     * Ги земаме мисиите/игрите од backend.
     */
    useEffect(() => {
        const fetchGames = async () => {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");
                const userId = localStorage.getItem("userId");

                console.log("WORLD TOKEN:", token);
                console.log("WORLD USER ID:", userId);

                if (!token) {
                    setError("Сесијата е истечена. Најавете се повторно.");
                    setLoading(false);
                    return;
                }

                if (!userId) {
                    setError("Не е пронајден корисникот.");
                    setLoading(false);
                    return;
                }

                const response = await fetch(
                    `${API}/games/world/${worldId}?userId=${userId}`,
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );

                if (response.status === 401 || response.status === 403) {
                    setError("Немате дозвола за пристап. Најавете се повторно.");
                    setLoading(false);
                    return;
                }

                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }

                const data = await response.json();

                console.log("Games from backend:", data);

                setGames(data);

            } catch (error) {
                console.error("Error loading games:", error);
                setError("Не може да се вчитаат игрите.");
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, [worldId]);

    /*
     * Ако светот не постои.
     */
    if (!world) {
        return (
            <div className="world-path">
                <p>Светот не постои.</p>

                <button onClick={() => navigate("/gameselection")}>
                    Назад
                </button>
            </div>
        );
    }

    /*
     * Loading
     */
    if (loading) {
        return (
            <div className="world-path">
                <header className="world-path-header">
                    <Logo />

                    <div className="right-nav-group">
                        <button
                            className="back-btn"
                            onClick={() => navigate("/gameselection")}
                        >
                            Назад
                        </button>

                        <div className="nav-icons-row">
                            <HomeButton />
                            <LogoutButton />
                            <ProfileButton />
                        </div>
                    </div>
                </header>

                <div className="world-loading">
                    <h2>Се подготвува авантурата... 🌟</h2>
                    <p>Ве молиме почекајте.</p>
                </div>
            </div>
        );
    }

    /*
     * Error
     */
    if (error) {
        return (
            <div className="world-path">
                <header className="world-path-header">
                    <Logo />

                    <div className="right-nav-group">
                        <button
                            className="back-btn"
                            onClick={() => navigate("/gameselection")}
                        >
                            Назад
                        </button>

                        <div className="nav-icons-row">
                            <HomeButton />
                            <LogoutButton />
                            <ProfileButton />
                        </div>
                    </div>
                </header>

                <div className="world-error">
                    <h2>Упс! 😕</h2>
                    <p>{error}</p>

                    <button
                        onClick={() => window.location.reload()}
                    >
                        Обиди се повторно
                    </button>
                </div>
            </div>
        );
    }

    /*
     * Колку мисии се завршени.
     *
     * Backend ни враќа pinsDone.
     * Ако нема податоци, користиме 0.
     */
    const completedPins =
        games.length > 0 && games[0].pinsDone !== undefined
            ? games[0].pinsDone
            : world.pinsDone || 0;

    return (
        <div className="world-path">

            {/* HEADER */}
            <header className="world-path-header">

                <Logo />

                <div className="right-nav-group">

                    <button
                        className="back-btn"
                        onClick={() => navigate("/gameselection")}
                    >
                        Назад
                    </button>

                    <div className="nav-icons-row">
                        <HomeButton />
                        <LogoutButton />
                        <ProfileButton />
                    </div>

                </div>

            </header>


            {/* WORLD TITLE */}
            <div className="world-title-row">

                <h1>{world.name}</h1>

                <span className={`world-progress pin-${world.color}`}>
                    {completedPins}/6 мисии
                </span>

            </div>


            {/* WORLD MAP */}
            <div className={`world-map-frame frame-${world.color}`}>

                <img
                    src={world.img}
                    alt={world.name}
                    className="world-bg"
                />


                {/* PINS */}

                {world.positions.slice(0, 6).map((pos, i) => {

                    const pinNumber = i + 1;

                    /*
                     * Го земаме типот на игра од worldsData.
                     *
                     * Пример:
                     * 1 → MEMORY_CARDS
                     * 2 → MISSING_LETTERS
                     * итн.
                     */
                    const exerciseTypeKey =
                        world.typeOrder?.[i];

                    const exercise =
                        exerciseTypes?.[exerciseTypeKey];


                    /*
                     * Ако backend веќе ни дал
                     * податоци за оваа мисија.
                     */
                    const backendGame = games[i];


                    /*
                     * Одредување статус:
                     *
                     * completed
                     * current
                     * locked
                     */
                    let status = "locked";

                    if (pinNumber <= completedPins) {
                        status = "completed";
                    } else if (pinNumber === completedPins + 1) {
                        status = "current";
                    }


                    /*
                     * Ако немаме exercise type,
                     * користиме fallback.
                     */
                    const exerciseIcon =
                        exercise?.icon || "⭐";

                    const exerciseType =
                        exercise?.type || "PICTURE_WORD";


                    /*
                     * Клик на мисијата.
                     */
                    const handlePinClick = () => {

                        if (status === "locked") {
                            return;
                        }

                        navigate(
                            `/world/${worldId}/exercise/${exerciseType}`
                        );
                    };


                    return (
                        <button
                            key={pinNumber}

                            className={`pin pin-${world.color} pin-${status}`}

                            style={{
                                top: pos.top,
                                left: pos.left
                            }}

                            disabled={status === "locked"}

                            onClick={handlePinClick}

                            title={
                                backendGame?.name ||
                                exercise?.name ||
                                `Мисија ${pinNumber}`
                            }
                        >

                            {/* БРОЈ НА ПИНОТ */}
                            <span className="pin-number">
                                {pinNumber}
                            </span>


                            {/* ИКОНА */}
                            <span className="pin-icon">

                                {status === "locked"
                                    ? "🔒"
                                    : status === "completed"
                                        ? "✓"
                                        : exerciseIcon
                                }

                            </span>

                        </button>
                    );
                })}

            </div>

        </div>
    );
}

export default WorldPath;