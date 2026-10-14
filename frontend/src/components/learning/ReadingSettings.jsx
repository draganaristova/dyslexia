
import React from "react";

export default function ReadingSettings({
  settings,
  setSettings
}) {
  const update = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <section className="learning-settings">
      <h3>⚙️ Прилагоди го читањето</h3>

      <div className="learning-setting">
        <label htmlFor="learning-font-size">
          Големина на буквите: {settings.fontSize}px
        </label>
        <input
          id="learning-font-size"
          type="range"
          min="18"
          max="36"
          step="2"
          value={settings.fontSize}
          onChange={(e) =>
            update("fontSize", Number(e.target.value))
          }
        />
      </div>

      <div className="learning-setting">
        <label htmlFor="learning-spacing">
          Растојание меѓу буквите: {settings.letterSpacing}px
        </label>
        <input
          id="learning-spacing"
          type="range"
          min="0"
          max="5"
          step="0.5"
          value={settings.letterSpacing}
          onChange={(e) =>
            update("letterSpacing", Number(e.target.value))
          }
        />
      </div>

      <div className="learning-setting">
        <label htmlFor="learning-speed">
          Брзина на читање: {settings.speed.toFixed(2)}×
        </label>
        <input
          id="learning-speed"
          type="range"
          min="0.65"
          max="1.2"
          step="0.05"
          value={settings.speed}
          onChange={(e) =>
            update("speed", Number(e.target.value))
          }
        />
      </div>

      <label className="learning-check">
        <input
          type="checkbox"
          checked={settings.dyslexiaFont}
          onChange={(e) =>
            update("dyslexiaFont", e.target.checked)
          }
        />
        Користи фонт за дислексија
      </label>

      <label className="learning-check">
        <input
          type="checkbox"
          checked={settings.highlight}
          onChange={(e) =>
            update("highlight", e.target.checked)
          }
        />
        Истакни ја реченицата што се чита
      </label>

      <div className="learning-setting">
        <label htmlFor="learning-background">
          Боја на позадината
        </label>
        <select
          id="learning-background"
          value={settings.background}
          onChange={(e) =>
            update("background", e.target.value)
          }
        >
          <option value="cream">Крем</option>
          <option value="white">Бела</option>
          <option value="mint">Светлозелена</option>
          <option value="blue">Светлосина</option>
        </select>
      </div>
    </section>
  );
}
