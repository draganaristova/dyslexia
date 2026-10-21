import "../styles/WorldPath.css";
import {useParams, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import ProfileButton from "../widgets/ProfileButton";
import HomeButton from "../widgets/HomeButton";
import LogoutButton from "../widgets/LogoutButton";
import Logo from "../widgets/Logo";
import { worldsData } from "../data/worldsData";
import { API } from "../data/api";

const gameTypes = [
    "MEMORY",
    "WORD_BUILDING",
    "MISSING_LETTER",
    "RHYMES",
    "SYLLABLES",
    "SOUND_MANIPULATION"
];

const gameIcons = [
    "🃏",
    "🧩",
    "🔤",
    "🎵",
    "👏",
    "✂️"
];

const gameNames = [
    "Меморија",
    "Состави го зборот",
    "Која буква недостасува",
    "Најди ја римата",
    "Слогови",
    "Бриши и замени гласови"
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


function WorldPath() {
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
        const fetchWorldData =
            async () => {
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
                        !worldNumber ||
                        worldNumber < 1 ||
                        worldNumber > 6
                    ) {

                        setError("Невалиден свет.");
                        return;
                    }


                    const headers = {

                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"

                    };


                    const [
                        gamesResponse,
                        progressResponse,
                        profileResponse,
                        accessResponse
                    ] =
                        await Promise.all([

                            fetch(
                                `${API}/games/world/${worldNumber}?userId=${userId}`,
                                {
                                    method: "GET",
                                    headers
                                }
                            ),

                            fetch(
                                `${API}/exercise-progress/user/${userId}/summary`,
                                {
                                    method: "GET",
                                    headers
                                }
                            ),

                            fetch(
                                `${API}/profile/${userId}`,
                                {
                                    method: "GET",
                                    headers
                                }
                            ),

                            fetch(
                                `${API}/games/world/${worldNumber}/access?userId=${userId}`,
                                {
                                    method: "GET",
                                    headers
                                }
                            )

                        ]);

                    if (

                        gamesResponse.status === 401 ||
                        gamesResponse.status === 403 ||
                        progressResponse.status === 401 ||
                        progressResponse.status === 403 ||
                        profileResponse.status === 401 ||
                        profileResponse.status === 403 ||
                        accessResponse.status === 401 ||
                        accessResponse.status === 403

                    ) {

                        localStorage.removeItem("token");
                        localStorage.removeItem("userId");
                        navigate("/login");
                        return;
                    }


                    if (!gamesResponse.ok) {

                        throw new Error(
                            "Не може да се вчитаат игрите."
                        );
                    }

                    const gamesData = await gamesResponse.json();

                    const progressData =
                        progressResponse.ok
                            ? await progressResponse.json()
                            : [];

                    const profileData =
                        profileResponse.ok
                            ? await profileResponse.json()
                            : null;

                    const accessData =
                        accessResponse.ok
                            ? await accessResponse.json()
                            : null;

                    setGames(
                        Array.isArray(gamesData)
                            ? gamesData
                            : []
                    );


                    setProgress(
                        Array.isArray(progressData)
                            ? progressData
                            : []
                    );


                    setUser(profileData);
                    setWorldAccess(accessData);

                } catch (err) {

                    console.error(
                        "World loading error:",
                        err
                    );


                    setError(
                        err.message ||
                        "Не може да се вчита патеката."
                    );

                } finally {
                    setLoading(false);
                }

            };


        fetchWorldData();

    }, [
        worldId,
        navigate
    ]);


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

    const currentAge = Number(user?.age);
    const currentLevel = levelFromAge(currentAge);
    const getLevelProgress = (gameId, level) => {
        return progress.find(
            item => Number(item.gamesId) === Number(gameId) && Number(item.pinNumber) === Number(level)) || null;
    };

    const isLevelPassed = (gameId, level) => {
        const item =
            getLevelProgress(
                gameId,
                level
            );

       if (!item) {
        return false;
    }
    return Number(item.completedTasks) >= 10;
};

    const isGameUnlocked = (
        gameIndex
    ) => {

        if (gameIndex === 0) {
            return true;
        }

        const previousGame = games[gameIndex - 1];

        if (!previousGame) {
            return false;
        }

        return isLevelPassed(previousGame.id, currentLevel);
    };


    const openGame = (
        game,
        index
    ) => {

        if (!game) {
            return;
        }


        if (!isGameUnlocked(index)) {
            return;
        }


        const type =
            game.gamesType ||
            gameTypes[index];


        navigate(
            `/world/${worldId}/exercise/${game.id}/${type}/${currentLevel}`
        );

    };

    const completedGames =
        games.filter(
            game =>
                isLevelPassed(
                    game.id,
                    currentLevel
                )
        ).length;

    const isWorldUnlocked = worldAccess?.unlocked === true;


    const Header = () => (

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

    );


    if (loading) {

        return (

            <div className="world-path">

                <Header />

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

                <Header />

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


    if (!isWorldUnlocked) {

        const completedPrevious = worldAccess?.completedGames || 0;
        const requiredPrevious = worldAccess?.requiredGames || 6;

        return (

            <div className="world-path">

                <Header />
                <div className="world-error">

                    <h2>
                        🔒 Светот е заклучен
                    </h2>

                    <p>
                        Прво заврши ги сите игри
                        од претходниот свет.
                    </p>

                    <p>
                        Напредок:
                        {" "}
                        {completedPrevious}
                        /
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
                <h1>
                    {world.name}
                </h1>

                <span
                    className={
                        `world-progress pin-${world.color}`
                    }
                >
                    {completedGames}/6 игри
                </span>

            </div>

            <div
                className={
                    `world-map-frame frame-${world.color}`
                }
            >

                <img
                    src={world.img}
                    alt={world.name}
                    className="world-bg"
                />


                {games
                    .slice(0, 6)
                    .map(
                        (
                            game,
                            index
                        ) => {

                            const pos = world.positions[index];
                            const passed = isLevelPassed(game.id, currentLevel);
                            const unlocked = isGameUnlocked(index);
                            const icon = gameIcons[index];
                            const gameName = game.name || gameNames[index];

                            return (

                                <button
                                    key={
                                        game.id
                                    }

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

                                        left: pos?.left
                                    }}

                                    disabled={
                                        !unlocked
                                    }

                                    onClick={() =>
                                        openGame(
                                            game,
                                            index
                                        )
                                    }

                                    title={
                                        unlocked ? gameName : "Оваа игра е заклучена"
                                    }
                                >

                                    <span className="pin-number">
                                        {index + 1}
                                    </span>


                                    <span className="pin-icon">
                                        {passed ? "✓" : unlocked ? icon : "🔒"}
                                    </span>

                                </button>
                            );
                        }
                    )}
            </div>
        </div>
    );
}


export default WorldPath;
