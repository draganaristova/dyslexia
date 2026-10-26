import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Progress.css";
import ProfileButton from "../widgets/ProfileButton";
import HomeButton from "../widgets/HomeButton";
import LogoutButton from "../widgets/LogoutButton";
import Logo from "../widgets/Logo";
import AdventureOverview from "../components/AdventureOverview.jsx";

export default function Progress() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "детето";

  return (
    <div className="progress-page">
      <header className="home-header">
        <Logo />
        <div className="nav-icons-row">
          <HomeButton />
          <LogoutButton />
          <ProfileButton />
        </div>
      </header>

      <main className="progress-main">
        <section className="progress-hero">
          <div className="hero-text">
            <h1>🏆 Твојата патека</h1>
            <p>{userName}, тука можеш да ги видиш сите твои постигнувања, резултати и обиди во секој свет.</p>
          </div>
          <span className="hero-trophy">🌟</span>
        </section>

        <AdventureOverview />

        <button className="adventure-back-button" onClick={() => navigate("/gameselection")}>
          ← Назад кон световите
        </button>
      </main>
    </div>
  );
}
