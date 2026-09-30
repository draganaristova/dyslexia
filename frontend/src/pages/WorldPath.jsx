import "../styles/WorldPath.css";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import ProfileButton from "../widgets/ProfileButton";
import { worldsData } from "../data/worldsData";
import HomeButton from "../widgets/HomeButton";
import LogoutButton from "../widgets/LogoutButton";
import Logo from "../widgets/Logo";
import { API } from "../data/api";

const gameTypes = [
    "RECOGNIZE_SOUND",
    "MEMORY",
    "RHYMES",
    "MISSING_LETTER",
    "WORD_BUILDING",
    "WHAT_CHANGED"
];

const gameNames = [
    "Препознај го гласот",
    "Меморија",
    "Рими",
    "Најди ја буквата",
    "Состави го зборот",
    "Што се смени?"
];

const gameIcons = [
    "🔊",
    "🃏",
    "🎵",
    "🔤",
    "🧩",
    "👀"
];

function WorldPath() {

    const { worldId } = useParams();
    const navigate = useNavigate();

    const world = worldsData[worldId];

    const [games, setGames] = useState([]);
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchWorldData = async () => {

            try {

                setLoading(true);
                setError("");

                const token =
                    localStorage.getItem("token");

                const userId =
                    localStorage.getItem("userId");

                if (!token) {

                    setError(
                        "Сесијата е истечена. Најавете се повторно."
                    );

                    setLoading(false);
                    return;
                }

                if (!userId) {

                    setError(
                        "Не е пронајден корисникот."
                    );

                    setLoading(false);
                    return;
                }

                const headers = {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                };

                const [
                    gamesResponse,
                    progressResponse
                ] = await Promise.all([

                    fetch(
                        `${API}/games/world/${worldId}?userId=${userId}`,
                        {
                            method: "GET",
                            headers
                        }
                    ),

                    fetch(
                        `${API}/progress/user/${userId}`,
                        {
                            method: "GET",
                            headers
                        }
                    )

                ]);

                if (
                    gamesResponse.status === 401 ||
                    gamesResponse.status === 403
                ) {

                    setError(
                        "Немате дозвола за пристап. Најавете се повторно."
                    );

                    setLoading(false);
                    return;
                }

                if (
                    progressResponse.status === 401 ||
                    progressResponse.status === 403
                ) {

                    setError(
                        "Немате дозвола за пристап. Најавете се повторно."
                    );

                    setLoading(false);
                    return;
                }

                if (!gamesResponse.ok) {

                    throw new Error(
                        `Games HTTP error: ${gamesResponse.status}`
                    );
                }

                const gamesData =
                    await gamesResponse.json();

                const progressData =
                    progressResponse.ok
                        ? await progressResponse.json()
                        : [];

                console.log(
                    "Games from backend:",
                    gamesData
                );

                console.log(
                    "Progress from backend:",
                    progressData
                );

                const sortedGames =
                    Array.isArray(gamesData)
                        ? [...gamesData].sort(
                            (a, b) =>
                                (a.orderIndex || 0) -
                                (b.orderIndex || 0)
                        )
                        : [];

                setGames(
                    sortedGames.slice(0, 6)
                );

                setProgress(
                    Array.isArray(progressData)
                        ? progressData
                        : []
                );

            } catch (err) {

                console.error(
                    "Error loading world:",
                    err
                );

                setError(
                    "Не може да се вчитаат игрите."
                );

            } finally {

                setLoading(false);

            }
        };

        fetchWorldData();

    }, [worldId]);


    if (!world) {

        return (
            <div className="world-path">

                <p>
                    Светот не постои.
                </p>

                <button
                    onClick={() =>
                        navigate("/gameselection")
                    }
                >
                    Назад
                </button>

            </div>
        );
    }


    if (loading) {

        return (
            <div className="world-path">

                <header className="world-path-header">

                    <Logo />

                    <div className="right-nav-group">

                        <button
                            className="back-btn"
                            onClick={() =>
                                navigate("/gameselection")
                            }
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

                    <h2>
                        Се подготвува авантурата... 🌟
                    </h2>

                    <p>
                        Ве молиме почекајте.
                    </p>

                </div>

            </div>
        );
    }


    if (error) {

        return (
            <div className="world-path">

                <header className="world-path-header">

                    <Logo />

                    <div className="right-nav-group">

                        <button
                            className="back-btn"
                            onClick={() =>
                                navigate("/gameselection")
                            }
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

                    <h2>
                        Упс! 😕
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            window.location.reload()
                        }
                    >
                        Обиди се повторно
                    </button>

                </div>

            </div>
        );
    }


    /*
     * Секој pin се проверува според:
     *
     * gamesId + pinNumber
     *
     * Ова е важно затоа што имаш 6 различни игри.
     */
    const isPinCompleted = (
        pinNumber,
        game
    ) => {

        if (!game) {
            return false;
        }

        return progress.some(
            item => {

                const progressGameId =
                    item.games?.id ??
                    item.gamesId ??
                    item.gameId;

                return (
                    Number(item.pinNumber) ===
                        Number(pinNumber) &&

                    Number(progressGameId) ===
                        Number(game.id) &&

                    item.completed === true
                );
            }
        );
    };


    /*
     * Pin 1 е отклучен.
     *
     * Pin 2 се отклучува кога Pin 1 е завршен.
     * Pin 3 кога Pin 2 е завршен итн.
     */
    const isPinUnlocked = (
        pinNumber,
        index
    ) => {

        if (pinNumber === 1) {
            return true;
        }

        const previousGame =
            games[index - 1];

        if (!previousGame) {
            return false;
        }

        return isPinCompleted(
            pinNumber - 1,
            previousGame
        );
    };


    /*
     * Број на завршени pins.
     */
    const completedPins =
        games.filter(
            (game, index) =>
                isPinCompleted(
                    index + 1,
                    game
                )
        ).length;


    return (
        <div className="world-path">


            {/* HEADER */}

            <header className="world-path-header">

                <Logo />

                <div className="right-nav-group">

                    <button
                        className="back-btn"
                        onClick={() =>
                            navigate("/gameselection")
                        }
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

                <h1>
                    {world.name}
                </h1>

                <span
                    className={`world-progress pin-${world.color}`}
                >
                    {completedPins}/6 мисии
                </span>

            </div>


            {/* MAP */}

            <div
                className={`world-map-frame frame-${world.color}`}
            >

                <img
                    src={world.img}
                    alt={world.name}
                    className="world-bg"
                />


                {/* SIX PINS */}

                {world.positions
                    .slice(0, 6)
                    .map((pos, index) => {

                        const pinNumber =
                            index + 1;

                        const game =
                            games[index];

                        const completed =
                            isPinCompleted(
                                pinNumber,
                                game
                            );

                        const unlocked =
                            isPinUnlocked(
                                pinNumber,
                                index
                            );


                        let status =
                            "locked";

                        if (completed) {

                            status =
                                "completed";

                        } else if (unlocked) {

                            status =
                                "current";

                        }


                        const gameType =
                            gameTypes[index];

                        const gameName =
                            game?.name ||
                            gameNames[index];

                        const icon =
                            gameIcons[index];


                        const handlePinClick =
                            () => {

                                if (!unlocked) {
                                    return;
                                }

                                if (!game) {
                                    return;
                                }

                                navigate(
                                    `/world/${worldId}/exercise/${game.id}/${gameType}/${pinNumber}`
                                );
                            };


                        return (

                            <button
                                key={pinNumber}

                                className={`
                                    pin
                                    pin-${world.color}
                                    pin-${status}
                                `}

                                style={{
                                    top: pos.top,
                                    left: pos.left
                                }}

                                disabled={!unlocked}

                                onClick={
                                    handlePinClick
                                }

                                title={
                                    unlocked
                                        ? gameName
                                        : "Оваа мисија е заклучена"
                                }
                            >

                                <span className="pin-number">
                                    {pinNumber}
                                </span>

                                <span className="pin-icon">

                                    {completed
                                        ? "✓"
                                        : unlocked
                                            ? icon
                                            : "🔒"}

                                </span>

                            </button>

                        );

                    })}

            </div>

        </div>
    );
}

export default WorldPath;
