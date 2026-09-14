import "../styles/WorldPath.css";
import { useParams, useNavigate } from "react-router-dom";
import ProfileButton from "../widgets/ProfileButton";
import { worldsData, exerciseTypes } from "../data/worldsData";
import HomeButton from "../widgets/HomeButton";
import LogoutButton from "../widgets/LogoutButton";
import Logo from "../widgets/Logo";

function WorldPath() {
    const { worldId } = useParams();
    const navigate = useNavigate();
    const world = worldsData[worldId];

    if (!world) {
        return (
            <div className="world-path">
                <p>Светот не постои.</p>
                <button onClick={() => navigate("/gameselection")}>Назад</button>
            </div>
        );
    }

    return (
        <div className="world-path">
            <header className="world-path-header">
                <Logo />
                <div className="right-nav-group">
                    <button className="back-btn" onClick={() => navigate("/gameselection")}>
                        Назад
                    </button>
                    <div className="nav-icons-row">
                        <HomeButton />
                        <LogoutButton />
                        <ProfileButton />
                    </div>
                </div>
            </header>

            <div className="world-title-row">
                <h1>{world.name}</h1>
                <span className={`world-progress pin-${world.color}`}>
                    {world.pinsDone}/7 левел
                </span>
            </div>

            <div className={`world-map-frame frame-${world.color}`}>
                <img src={world.img} alt={world.name} className="world-bg" />

                {world.positions.map((pos, i) => {
                    const exercise = exerciseTypes[world.typeOrder[i]];
                    const pinNumber = i + 1;
                    let status = "locked";
                    if (pinNumber <= world.pinsDone) status = "completed";
                    else if (pinNumber === world.pinsDone + 1) status = "current";

                    return (
                        <button
                            key={i}
                            className={`pin pin-${world.color} pin-${status}`}
                            style={{ top: pos.top, left: pos.left }}
                            disabled={status === "locked"}
                            onClick={() => navigate(`/world/${worldId}/exercise/${exercise.type}`)}
                        >
                            <span className="pin-number">{pinNumber}</span>
                            <span className="pin-icon">
                                {status === "locked" ? "🔒" : exercise.icon}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default WorldPath;