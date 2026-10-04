import "../styles/WorldPath.css";

import {
    useParams,
    useNavigate
} from "react-router-dom";

import {
    useEffect,
    useState
} from "react";

import ProfileButton from "../widgets/ProfileButton";
import HomeButton from "../widgets/HomeButton";
import LogoutButton from "../widgets/LogoutButton";
import Logo from "../widgets/Logo";

import { worldsData } from "../data/worldsData";
import { API } from "../data/api";


/*
 * ==================================================
 * GAME TYPES
 *
 * ОВА МОРА ДА БИДЕ ИСТО
 * СО GamesType ENUM ВО BACKEND.
 * ==================================================
 */

const gameTypes = [
    "MEMORY",
    "WORD_BUILDING",
    "MISSING_LETTER",
    "RHYMES",
    "SYLLABLES",
    "SOUND_MANIPULATION"
];


/*
 * ==================================================
 * FALLBACK NAMES
 * ==================================================
 */

const gameNames = [
    "Меморија",
    "Состави го зборот",
    "Која буква недостасува",
    "Најди ја римата",
    "Слогови",
    "Бриши и замени гласови"
];


/*
 * ==================================================
 * ICONS
 * ==================================================
 */

const gameIcons = [
    "🃏",
    "🧩",
    "🔤",
    "🎵",
    "👏",
    "✂️"
];


function WorldPath() {

    const {
        worldId
    } = useParams();

    const navigate =
        useNavigate();

    const world =
        worldsData[worldId];

    const [games, setGames] =
        useState([]);

    const [progress, setProgress] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    /*
     * ==================================================
     * LOAD GAMES + EXERCISE PROGRESS
     * ==================================================
     */

    useEffect(() => {

        const fetchWorldData =
            async () => {

                try {

                    setLoading(true);
                    setError("");

                    const token =
                        localStorage.getItem(
                            "token"
                        );

                    const userId =
                        localStorage.getItem(
                            "userId"
                        );


                    /*
                     * AUTH CHECK
                     */

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
                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    };


                    /*
                     * LOAD:
                     *
                     * 1. Games
                     * 2. ExerciseProgress summary
                     */

                    const [gamesResponse, progressResponse] = await Promise.all([

                        fetch(
                            `${API}/games/world/${worldId}?userId=${userId}`,
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
                        )
                    ]);


                    /*
                     * AUTH ERROR
                     */

                    if (
                        gamesResponse.status === 401 ||
                        gamesResponse.status === 403 ||
                        progressResponse.status === 401 ||
                        progressResponse.status === 403
                    ) {

                        localStorage.removeItem(
                            "token"
                        );

                        localStorage.removeItem(
                            "userId"
                        );

                        navigate("/login");

                        return;
                    }


                    /*
                     * GAMES ERROR
                     */

                    if (!gamesResponse.ok) {

                        throw new Error(
                            `Games HTTP error: ${gamesResponse.status}`
                        );
                    }


                    /*
                     * PROGRESS ERROR
                     *
                     * Ако summary endpoint не успее,
                     * games сепак може да се прикажат.
                     */

                    if (!progressResponse.ok) {

                        console.warn(
                            "Progress summary could not be loaded:",
                            progressResponse.status
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
                        "Exercise progress summary:",
                        progressData
                    );


                    /*
                     * SORT GAMES
                     */

                    const sortedGames =
                        Array.isArray(gamesData)
                            ? [...gamesData].sort(
                                (a, b) =>
                                    (
                                        a.orderIndex || 0
                                    ) -
                                    (
                                        b.orderIndex || 0
                                    )
                            )
                            : [];


                    /*
                     * WORLD HAS MAX 6 GAMES
                     */

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

    }, [
        worldId,
        navigate
    ]);


    /*
     * ==================================================
     * HEADER
     * ==================================================
     */

    const Header = () => (

        <header className="world-path-header">

            <Logo />

            <div className="right-nav-group">

                <button
                    className="back-btn"
                    onClick={() =>
                        navigate(
                            "/gameselection"
                        )
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


    /*
     * ==================================================
     * INVALID WORLD
     * ==================================================
     */

    if (!world) {

        return (

            <div className="world-path">

                <p>
                    Светот не постои.
                </p>

                <button
                    onClick={() =>
                        navigate(
                            "/gameselection"
                        )
                    }
                >
                    Назад
                </button>

            </div>
        );
    }


    /*
     * ==================================================
     * LOADING
     * ==================================================
     */

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


    /*
     * ==================================================
     * ERROR
     * ==================================================
     */

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


    /*
     * ==================================================
     * FIND PROGRESS FOR ONE PIN
     *
     * Backend summary има:
     *
     * gamesId
     * pinNumber
     * completedTasks
     * totalTasks
     * score
     * completed
     * passed
     * ==================================================
     */

    const getPinProgress = (
        game,
        pinNumber
    ) => {

        if (!game) {
            return null;
        }

        return progress.find(
            item =>
                Number(item.gamesId) ===
                    Number(game.id)
                &&
                Number(item.pinNumber) ===
                    Number(pinNumber)
        ) || null;
    };


    /*
     * ==================================================
     * COMPLETED
     * ==================================================
     */

    const isPinCompleted = (
        game,
        pinNumber
    ) => {

        const item =
            getPinProgress(
                game,
                pinNumber
            );

        return (
            item?.passed === true
        );
    };


    /*
     * ==================================================
     * UNLOCKED
     *
     * First mission is unlocked.
     *
     * Every next mission opens
     * after previous mission PASSED.
     * ==================================================
     */

    const isPinUnlocked = (
        index
    ) => {

        if (index === 0) {
            return true;
        }

        const previousGame =
            games[index - 1];

        const previousPin =
            index;

        return isPinCompleted(
            previousGame,
            previousPin
        );
    };


    /*
     * ==================================================
     * COMPLETED PINS
     * ==================================================
     */

    const completedPins =
        games.filter(
            (game, index) =>
                isPinCompleted(
                    game,
                    index + 1
                )
        ).length;


    /*
     * ==================================================
     * RENDER
     * ==================================================
     */

    return (

        <div className="world-path">

            <Header />


            {/* WORLD TITLE */}

            <div className="world-title-row">

                <h1>
                    {world.name}
                </h1>

                <span
                    className={
                        `world-progress pin-${world.color}`
                    }
                >
                    {completedPins}/6 мисии
                </span>

            </div>


            {/* MAP */}

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


                {world.positions
                    .slice(0, 6)
                    .map(
                        (
                            pos,
                            index
                        ) => {

                            const pinNumber =
                                index + 1;

                            const game =
                                games[index];


                            const progressItem =
                                getPinProgress(
                                    game,
                                    pinNumber
                                );


                            const completed =
                                isPinCompleted(
                                    game,
                                    pinNumber
                                );


                            const unlocked =
                                isPinUnlocked(
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


                            /*
                             * BACKEND GAME TYPE
                             */

                            const gameType =
                                game?.gamesType ||
                                game?.type ||
                                gameTypes[index];


                            const gameName =
                                game?.name ||
                                gameNames[index];


                            const icon =
                                gameIcons[index];


                            const handlePinClick =
                                () => {

                                    if (
                                        !unlocked ||
                                        !game
                                    ) {
                                        return;
                                    }


                                    navigate(
                                        `/world/${worldId}/exercise/${game.id}/${gameType}/${pinNumber}`
                                    );
                                };


                            return (

                                <button
                                    key={pinNumber}

                                    className={
                                        `pin ` +
                                        `pin-${world.color} ` +
                                        `pin-${status}`
                                    }

                                    style={{
                                        top: pos.top,
                                        left: pos.left
                                    }}

                                    disabled={
                                        !unlocked
                                    }

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
                        }
                    )}

            </div>

        </div>
    );
}

export default WorldPath;