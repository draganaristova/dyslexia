import "../styles/IconButton.css";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

function HomeButton() {
    const navigate = useNavigate();

    return (
        <button className="icon-btn home-btn-color" onClick={() => navigate("/")} aria-label="Почетна">
            <Home size={20} />
        </button>
    )
}

export default HomeButton;