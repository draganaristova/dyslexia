import "../styles/WorldPath.css";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import ProfileButton from "../widgets/ProfileButton";
import HomeButton from "../widgets/HomeButton";
import LogoutButton from "../widgets/LogoutButton";
import Logo from "../widgets/Logo";

import { worldsData } from "../data/worldsData";
import { API } from "../data/api";

const GAME_TYPES = [
    "MEMORY",
    "WORD_BUILDING",
    "MISSING_LETTER",
    "RHYMES",
    "SYLLABLES",
    "SOUND_MANIPULATION",
];

const GAME_ICONS = ["🃏", "🧩", "🔤", "🎵", "👏", "✂️"];

const GAME_NAMES = [
    "Меморија",
    "Состави го зборот",
    "Која буква недостасува",
    "Најди ја римата",
    "Слогови",
    "Бриши и замени гласови",
];

function levelFromAge(age) {
    const numericAge = Number(age);

    if (!numericAge || numericAge <= 7) {
        return 1;
    }

    if (numericAge <= 10) {
        return 2;
    }

    return 3;
}

export default function WorldPath() {
    const { worldId } = useParams();
    const navigate = useNavigate();

    const world = worldsData[worldId];

    const [games, setGames] = useState([]);
    const [progress, setProgress] = useState([]);
    const [user, setUser] = useState(null);
    const [worldAccess, setWorldAccess] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const fetchWorldData = async () => {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");
                const userId = localStorage.getItem("userId");

                if (!token || !userId) {
                    navigate("/login");
                    return;
                }

                const worldNumber = Number(worldId);

                if (
                    !Number.isInteger(worldNumber) ||
                    !worldsData[worldNumber]
                ) {
                    throw new Error("Невалиден свет.");
                }

                const headers = {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                };

                const responses = await Promise.all([
                    fetch(
                        `${API}/games/world/${worldNumber}?userId=${userId}`,
                        { headers }
                    ),
                    fetch(
                        `${API}/exercise-progress/user/${userId}/summary`,
                        { headers }
                    ),
                    fetch(`${API}/profile/${userId}`, {
                        headers,
                    }),
                    fetch(
                        `${API}/games/world/${worldNumber}/access?userId=${userId}`,
                        { headers }
                    ),
                ]);

                if (cancelled) {
                    return;
                }

                if (
                    responses.some(
                        response =>
                            response.status === 401 ||
                            response.status === 403
                    )
                ) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    navigate("/login");
                    return;
                }

                const [
                    gamesResponse,
                    progressResponse,
                    profileResponse,
                    accessResponse,
                ] = responses;

                if (!gamesResponse.ok) {
                    throw new Error(
                        "Не може да се вчитаат игрите."
                    );
                }

                if (!progressResponse.ok) {
                    throw new Error(
                        "Не може да се вчита напредокот."
                    );
                }

                if (!profileResponse.ok) {
                    throw new Error(
                        "Не може да се вчита профилот."
                    );
                }

                if (!accessResponse.ok) {
                    throw new Error(
                        "Не може да се провери пристапот до светот."
                    );
                }

                const [
                    gamesData,
                    progressData,
                    profileData,
                    accessData,
                ] = await Promise.all([
                    gamesResponse.json(),
                    progressResponse.json(),
                    profileResponse.json(),
                    accessResponse.json(),
                ]);

                if (cancelled) {
                    return;
                }

                if (
                    !Array.isArray(gamesData) ||
                    !Array.isArray(progressData)
                ) {
                    throw new Error(
                        "Серверот врати невалидни податоци."
                    );
                }

                setGames(gamesData.slice(0, 6));
                setProgress(progressData);
                setUser(profileData);
                setWorldAccess(accessData);
            } catch (err) {
                if (!cancelled) {
                    console.error("World loading error:", err);

                    setError(
                        err.message ||
                            "Не може да се вчита патеката."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchWorldData();

        return () => {
            cancelled = true;
        };
    }, [worldId, navigate]);

    const currentLevel = levelFromAge(user?.age);

    const getLevelProgress = (gameId, level) =>
        progress.find(
            item =>
                Number(item.gamesId) === Number(gameId) &&
                Number(item.pinNumber) === Number(level)
        ) || null;

    const isLevelPassed = (gameId, level) => {
        const item = getLevelProgress(gameId, level);

        return (
            item?.passed === true &&
            Number(item.completedTasks) >= 10 &&
            Number(item.score) >= 8
        );
    };

    const isGameUnlocked = gameIndex => {
        if (gameIndex === 0) {
            return true;
        }

        if (!games[gameIndex - 1]) {
            return false;
        }

        return games
            .slice(0, gameIndex)
            .every(game =>
                isLevelPassed(game.id, currentLevel)
            );
    };

    const openGame = (game, index) => {
        if (!game || !isGameUnlocked(index)) {
            return;
        }

        const type = game.gamesType || GAME_TYPES[index];

        navigate(
            `/world/${worldId}/exercise/${game.id}/${type}/${currentLevel}`
        );
    };

    const completedGames = games.filter(game =>
        isLevelPassed(game.id, currentLevel)
    ).length;

    const isWorldUnlocked = worldAccess?.unlocked === true;

    const Header = () => (
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
    );

    if (!world) {
        return (
            <div className="world-path">
                <p>Светот не постои.</p>

                <button
                    onClick={() => navigate("/gameselection")}
                >
                    Назад
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="world-path">
                <Header />

                <div className="world-loading">
                    <h2>
                        Се подготвува авантурата... 🌟
                    </h2>

                    <p>Ве молиме почекајте.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="world-path">
                <Header />

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

    if (!isWorldUnlocked) {
        const completedPrevious =
            worldAccess?.completedGames || 0;

        const requiredPrevious =
            worldAccess?.requiredGames || 6;

        return (
            <div className="world-path">
                <Header />

                <div className="world-error">
                    <h2>🔒 Светот е заклучен</h2>

                    <p>
                        Прво помини ги сите игри од
                        претходниот свет.
                    </p>

                    <p>
                        Напредок: {completedPrevious}/
                        {requiredPrevious}
                    </p>

                    <button
                        onClick={() =>
                            navigate("/gameselection")
                        }
                    >
                        Назад
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="world-path">
            <Header />

            <div className="world-title-row">
                <h1>{world.name}</h1>

                <span
                    className={`world-progress pin-${world.color}`}
                >
                    {completedGames}/6 игри
                </span>
            </div>

            <div
                className={`world-map-frame frame-${world.color}`}
            >
                <img
                    src={world.img}
                    alt={world.name}
                    className="world-bg"
                />

                {games.map((game, index) => {
                    const pos = world.positions[index];

                    const passed = isLevelPassed(
                        game.id,
                        currentLevel
                    );

                    const unlocked = isGameUnlocked(index);
                    const gameName =
                        game.name || GAME_NAMES[index];

                    return (
                        <button
                            key={game.id}
                            className={
                                `pin pin-${world.color} ` +
                                `pin-${
                                    passed
                                        ? "completed"
                                        : unlocked
                                          ? "current"
                                          : "locked"
                                }`
                            }
                            style={{
                                top: pos?.top,
                                left: pos?.left,
                            }}
                            disabled={!unlocked}
                            onClick={() => openGame(game, index)}
                            title={
                                unlocked
                                    ? gameName
                                    : "Прво помини ја претходната игра"
                            }
                        >
                            <span className="pin-number">
                                {index + 1}
                            </span>

                            <span className="pin-icon">
                                {passed
                                    ? "✓"
                                    : unlocked
                                      ? GAME_ICONS[index]
                                      : "🔒"}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}