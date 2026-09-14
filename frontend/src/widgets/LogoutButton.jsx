import "../styles/IconButton.css";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

function LogoutButton() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <button className="icon-btn logout-btn-color" onClick={handleLogout} aria-label="Одјави се">
            <LogOut size={20} />
        </button>
    );
}

export default LogoutButton;