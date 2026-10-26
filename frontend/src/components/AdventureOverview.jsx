import React, { useEffect, useMemo, useState } from "react";
import { API } from "../data/api";
import { worldsData } from "../data/worldsData";
import "../styles/AdventureOverview.css";

const MISSIONS = [
  { type: "MEMORY", name: "Меморија", icon: "🃏" },
  { type: "WORD_BUILDING", name: "Состави го зборот", icon: "🧩" },
  { type: "MISSING_LETTER", name: "Која буква недостасува", icon: "🔤" },
  { type: "RHYMES", name: "Најди ја римата", icon: "🎵" },
  { type: "SYLLABLES", name: "Слогови", icon: "👏" },
  { type: "SOUND_MANIPULATION", name: "Бриши и замени гласови", icon: "✂️" }
];

const WORLD_ICONS = ["🏎️", "🏔️", "🏡", "🌌", "🏰", "🏆"];
const WORLD_IDS = [1, 2, 3, 4, 5, 6];

const number = (value, fallback = 0) => {
  const parsed = Number(value);
  return value == null || !Number.isFinite(parsed) ? fallback : parsed;
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("mk-MK");
};

const getKey = (gameId, level, type) => `${gameId}-${level}-${type}`;

export default function AdventureOverview({ compact = false }) {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [gamesByWorld, setGamesByWorld] = useState({});
  const [summaries, setSummaries] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedMission, setSelectedMission] = useState(null);
  const [showAllAttempts, setShowAllAttempts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId || !token) {
      setLoading(false);
      setError("Потребна е најава.");
      return;
    }

    let cancelled = false;
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const requests = [
          ...WORLD_IDS.map((id) => fetch(`${API}/games/world/${id}?userId=${userId}`, { headers })),
          fetch(`${API}/exercise-progress/user/${userId}/summary`, { headers }),
          fetch(`${API}/exercise-progress/user/${userId}/attempts`, { headers })
        ];

        const responses = await Promise.all(requests);
        if (responses.some((response) => response.status === 401 || response.status === 403)) throw new Error("Сесијата е истечена. Најави се повторно.");
        if (!responses[6].ok || !responses[7].ok) throw new Error("Не може да се вчита напредокот.");

        const data = await Promise.all(responses.map((response) => response.ok ? response.json() : []));
        if (cancelled) return;

        const worlds = {};
        WORLD_IDS.forEach((id, index) => { worlds[id] = Array.isArray(data[index]) ? data[index].slice(0, 6) : []; });

        setGamesByWorld(worlds);
        setSummaries(Array.isArray(data[6]) ? data[6] : []);
        setAttempts(Array.isArray(data[7]) ? data[7] : []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Грешка при вчитување.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [userId, token]);

  const summaryMap = useMemo(() => {
    const map = new Map();
    summaries.forEach((item) => map.set(getKey(item.gamesId, item.pinNumber, item.gamesType), item));
    return map;
  }, [summaries]);

  const attemptMap = useMemo(() => {
    const map = new Map();

    attempts.forEach((item) => {
      const key = getKey(item.gamesId, item.pinNumber, item.gamesType);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    });

    map.forEach((items) => items.sort((a, b) => new Date(b.attemptedAt || 0) - new Date(a.attemptedAt || 0)));
    return map;
  }, [attempts]);

  const getMissions = (worldId, level) => {
    const games = gamesByWorld[worldId] || [];

    return MISSIONS.map((mission, index) => {
      const game = games.find((item) => item.gamesType === mission.type) || games[index];
      const key = game ? getKey(game.id, level, mission.type) : "";
      const summary = summaryMap.get(key);
      const history = attemptMap.get(key) || [];

      return {
        ...mission,
        id: game?.id ?? null,
        name: game?.name || mission.name,
        score: number(summary?.score),
        completedTasks: number(summary?.completedTasks),
        totalTasks: number(summary?.totalTasks, 10),
        passed: summary?.passed === true,
        completed: summary?.completed === true,
        history,
        attemptsCount: history.length
      };
    });
  };

  const getLevelCompleted = (worldId, level) => getMissions(worldId, level).filter((mission) => mission.passed).length;

  const getWorldCompleted = (worldId) => {
    return [1, 2, 3].reduce((sum, level) => sum + getLevelCompleted(worldId, level), 0);
  };

  const world = selectedWorld ? worldsData[selectedWorld] : null;
  const worldMissions = selectedWorld && selectedLevel ? getMissions(selectedWorld, selectedLevel) : [];
  const displayedAttempts = selectedMission
    ? selectedMission.history.filter((item) => showAllAttempts || item.correct !== true)
    : [];

  const toggleWorld = (id) => {
    setSelectedWorld(selectedWorld === id ? null : id);
    setSelectedLevel(null);
    setSelectedMission(null);
  };

  if (loading) return <div className="adventure-message">🌟 Се вчитува твојата авантура...</div>;
  if (error) return <div className="adventure-message">{error}</div>;

  return (
    <section className={`adventure-overview ${compact ? "adventure-compact" : ""}`}>
      <div className="adventure-heading">
        <h2>🌍 Моите светови</h2>
        <p>Избери свет и погледни го целиот напредок.</p>
      </div>

      <div className="adventure-world-list">
        {WORLD_IDS.map((id, index) => {
          const info = worldsData[id];
          const completed = getWorldCompleted(id);
          const active = selectedWorld === id;

          return (
            <div className="adventure-world-block" key={id}>
              <button className={`adventure-world-button ${active ? "active" : ""}`} onClick={() => toggleWorld(id)} aria-expanded={active}>
                <span className="adventure-world-icon">{WORLD_ICONS[index]}</span>

                <span className="adventure-world-information">
                  <strong>Свет {id} – {info?.name || `Свет ${id}`}</strong>
                  <small>{completed} од 18 поминати мисии</small>
                  <span className="adventure-mini-progress">
                    <span style={{ width: `${completed / 18 * 100}%` }} />
                  </span>
                </span>

                <span className="adventure-world-arrow">{active ? "⌃" : "⌄"}</span>
              </button>

              {active && (
                <div className="adventure-world-details">
                  <div className="adventure-level-grid">
                    {[1, 2, 3].map((level) => {
                      const completedLevel = getLevelCompleted(id, level);
                      const selected = selectedLevel === level;

                      return (
                        <button key={level} className={`adventure-level-button ${selected ? "active" : ""}`} onClick={() => { setSelectedLevel(selected ? null : level); setSelectedMission(null); }}>
                          <strong>Ниво {level}</strong>
                          <small>{completedLevel}/6 мисии</small>
                          <span className="adventure-mini-progress">
                            <span style={{ width: `${completedLevel / 6 * 100}%` }} />
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedLevel && (
                    <div className="adventure-missions">
                      <h3>{world?.name || `Свет ${id}`} — Ниво {selectedLevel}</h3>

                      {worldMissions.map((mission, index) => (
                        <div className="adventure-mission" key={mission.type}>
                          <span className="adventure-mission-icon">{mission.icon}</span>

                          <div className="adventure-mission-details">
                            <div className="adventure-mission-top">
                              <strong>{index + 1}. {mission.name}</strong>
                              <span className={mission.passed ? "adventure-success" : ""}>
                                {mission.passed ? "✓ Поминато" : mission.completed ? "Продолжи да вежбаш" : mission.completedTasks ? "Во тек" : "Не е започнато"}
                              </span>
                            </div>

                            <div className="adventure-mission-stats">
                              <span>⭐ {mission.score}/10</span>
                              <span>✅ {mission.completedTasks}/{mission.totalTasks} задачи</span>
                              <span>🔄 {mission.attemptsCount} обиди</span>
                            </div>

                            <div className="adventure-mini-progress">
                              <span style={{ width: `${Math.min(100, mission.completedTasks / Math.max(1, mission.totalTasks) * 100)}%` }} />
                            </div>

                            {mission.history.length > 0 && (
                              <button className="adventure-review-button" onClick={() => { setSelectedMission({ ...mission, worldId: id, level: selectedLevel }); setShowAllAttempts(false); }}>
                                🔍 Прегледај обиди
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedMission && (
        <div className="adventure-overlay" onClick={() => setSelectedMission(null)}>
          <div className="adventure-dialog" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="adventure-dialog-top">
              <div>
                <h3>{selectedMission.icon} {selectedMission.name}</h3>
                <p>Свет {selectedMission.worldId} · Ниво {selectedMission.level}</p>
              </div>
              <button onClick={() => setSelectedMission(null)} aria-label="Затвори">✕</button>
            </div>

            <div className="adventure-review-filters">
              <button className={!showAllAttempts ? "active" : ""} onClick={() => setShowAllAttempts(false)}>💡 Грешки</button>
              <button className={showAllAttempts ? "active" : ""} onClick={() => setShowAllAttempts(true)}>📚 Сите обиди</button>
            </div>

            {displayedAttempts.length === 0 ? (
              <div className="adventure-message">🎉 Нема погрешни обиди!</div>
            ) : (
              <div className="adventure-attempt-list">
                {displayedAttempts.map((attempt, index) => (
                  <div className="adventure-attempt" key={attempt.attemptId ?? index}>
                    <div className="adventure-attempt-heading">
                      <strong>Задача {attempt.taskNumber} · Обид {attempt.attemptNumber}</strong>
                      <span>{attempt.correct ? "✅ Точно" : "❌ Неточно"}</span>
         
                    </div>
                    <small>{formatDate(attempt.attemptedAt)}</small>
                    <p><strong>Прашање:</strong> {attempt.question || "—"}</p>
                    <p><strong>Твој одговор:</strong> {attempt.selectedAnswer || "—"}</p>
                    <p><strong>Точен одговор:</strong> {attempt.correctAnswer || "—"}</p>
                  </div>
                ))}
              </div>
            )}

            <button className="adventure-close-button" onClick={() => setSelectedMission(null)}>Затвори</button>
          </div>
        </div>
      )}
    </section>
  );
}
