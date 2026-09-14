import "../styles/GameSelection.css";
import { useNavigate } from "react-router-dom";
import ProfileButton from "../widgets/ProfileButton";
import { worldsData } from "../data/worldsData";
import HomeButton from "../widgets/HomeButton";
import LogoutButton from "../widgets/LogoutButton";
import Logo from "../widgets/Logo";

function GameSelection() {
    const navigate = useNavigate();

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
                <h1>Избери свет и <span>започни со авантурата!</span></h1>
                <p>Секој свет крие нови предизвици за позабавно учење. Реши ги сите нивоа за да го отклучиш следното ниво за истражување!</p>
            </section>

            <section className="game-grid">
                {Object.entries(worldsData).map(([id, world]) => {
                    const isLocked = world.status === "locked";
                    return (
                        <div
                            key={id}
                            className={`game-card game-${world.color} ${isLocked ? "locked" : ""}`}
                            onClick={() => !isLocked && navigate(`/world/${id}`)}
                        >
                            <div className="game-image" style={{ backgroundImage: `url(${world.img})` }}>
                                <div className="game-overlay" />
                                {isLocked && (
                                    <div className="lock-badge"><span>🔒</span></div>
                                )}
                                {!isLocked && (
                                    <div className="progress-pill">{world.pinsDone}/7 пина</div>
                                )}
                                <div className="game-text">
                                    <h3>{world.name}</h3>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </section>

            <footer>
                <div className="quote">
                    <p>Секој чекор те прави подобар читател! 🌟</p>
                </div>
            </footer>
        </div>
    );
}

export default GameSelection;