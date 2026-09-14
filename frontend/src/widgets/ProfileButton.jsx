import React from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import "../styles/IconButton.css";

function ProfileButton({ avatarUrl, onClick, href = "/profile" }) {
    const navigate = useNavigate();

    const content = avatarUrl ? (
        <img src={avatarUrl} alt="Профил" className="profile-avatar-img" />
    ) : (
        <User size={22} strokeWidth={2} />
    );

    const handleClick = onClick || (() => navigate(href));

    return (
        <button type="button" className="icon-btn profile-btn-color" onClick={handleClick} aria-label="Профил">
             {content}
        </button>
    );
}

export default ProfileButton;