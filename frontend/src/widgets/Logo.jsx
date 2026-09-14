import { useNavigate } from "react-router-dom";
import logoImg from "../assets/screens/logo.png";
import "../styles/Logo.css";

function Logo() {
    const navigate = useNavigate();

    return (
        <div className="logo" onClick={() => navigate("/")}>
            <img src={logoImg} alt="ЛексиЛенд" className="logo-img" />
        </div>
    );
}

export default Logo;