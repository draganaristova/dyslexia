import React, { useState } from 'react';
import '../styles/ProfilePage.css';
import HomeButton from '../widgets/HomeButton';
import LogoutButton from '../widgets/LogoutButton';
import Logo from '../widgets/Logo';

export default function ProfilePage() {
    const [dyslexiaFont, setDyslexiaFont] = useState(false);
    const [fontSize, setFontSize] = useState(16);
    const [letterSpacing, setLetterSpacing] = useState(0);
    const [readAloud, setReadAloud] = useState(false);
    const [theme, setTheme] = useState('cream');

    const badges = [
        { icon: '⭐', label: 'Прв чекор', earned: true },
        { icon: '📚', label: '10 прочитани зборови', earned: true },
        { icon: '🔥', label: '5 дена по ред', earned: true },
        { icon: '🎯', label: 'Совршена игра', earned: false },
        { icon: '🏆', label: 'Ниво 3', earned: false },
        { icon: '🦊', label: 'Истражувач', earned: false },
    ];

    return (
        <div className="profile-page">
            <header className="profile-header">
                 <Logo />
                 <div className="nav-icons-row">
                    <HomeButton />
                    <LogoutButton />
                 </div>
            </header>

            <div className="profile-content">
                <section className="profile-card profile-summary">
                    <div className="profile-avatar">🦊</div>
                    <div className="profile-summary-text">
                        <h1>Марко</h1>
                        <span className="profile-level-badge">Ниво 2 читач</span>
                    </div>
                    <div className="profile-streak">
                        <span className="profile-streak-flame">🔥</span>
                        <div>
                            <strong>5</strong>
                            <p>дена по ред</p>
                        </div>
                    </div>
                </section>

                <section className="profile-card">
                    <h2>Напредок</h2>
                    <p className="profile-card-sub">Продолжи да играш за следното ниво!</p>
                    <div className="profile-progress-track">
                        <div className="profile-progress-fill" style={{ width: '62%' }} />
                    </div>
                    <span className="profile-progress-label">62% до Ниво 3</span>
                </section>

                <section className="profile-card">
                    <h2>Достигнувања</h2>
                    <div className="profile-badges-grid">
                        {badges.map((badge, i) => (
                            <div
                                key={i}
                                className={`profile-badge ${badge.earned ? 'earned' : 'locked'}`}
                            >
                                <span className="profile-badge-icon">{badge.icon}</span>
                                <span className="profile-badge-label">{badge.label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="profile-card">
                    <h2>Пристапни поставки</h2>
                    <p className="profile-card-sub">Прилагоди го екранот за полесно читање.</p>

                    <div className="profile-setting-row profile-setting-column">
                        <strong>Големина на текст: {fontSize}px</strong>
                        <input
                            type="range"
                            min="14"
                            max="24"
                            value={fontSize}
                            onChange={(e) => setFontSize(Number(e.target.value))}
                            className="profile-slider"
                        />
                    </div>

                    <div className="profile-setting-row profile-setting-column">
                        <strong>Растојание меѓу букви: {letterSpacing}px</strong>
                        <input
                            type="range"
                            min="0"
                            max="4"
                            value={letterSpacing}
                            onChange={(e) => setLetterSpacing(Number(e.target.value))}
                            className="profile-slider"
                        />
                    </div>

                    <div className="profile-setting-row profile-setting-column">
                        <strong>Боја на позадина</strong>
                        <div className="profile-theme-row">
                            <button
                                type="button"
                                className={`profile-theme-swatch swatch-cream ${theme === 'cream' ? 'selected' : ''}`}
                                onClick={() => setTheme('cream')}
                                aria-label="Кремава позадина"
                            />
                            <button
                                type="button"
                                className={`profile-theme-swatch swatch-white ${theme === 'white' ? 'selected' : ''}`}
                                onClick={() => setTheme('white')}
                                aria-label="Бела позадина"
                            />
                            <button
                                type="button"
                                className={`profile-theme-swatch swatch-mint ${theme === 'mint' ? 'selected' : ''}`}
                                onClick={() => setTheme('mint')}
                                aria-label="Мента позадина"
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}