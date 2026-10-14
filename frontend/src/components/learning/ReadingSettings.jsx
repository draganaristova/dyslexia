
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
    <section
      className="learning-settings"
      aria-label="Поставки за читање"
    >
      <div className="learning-settings-heading">
        <span className="learning-settings-gear">
          ⚙️
        </span>

        <div>
          <h3>Мои поставки</h3>
        </div>
      </div>

      <div className="learning-setting">
        <label htmlFor="learning-font-size">
          Големина на буквите
          <strong>{settings.fontSize}px</strong>
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
          Растојание меѓу буквите
          <strong>{settings.letterSpacing}px</strong>
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
          Брзина на слушање
          <strong>
            {Number(settings.speed).toFixed(2)}×
          </strong>
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

        <div className="learning-range-labels">
          <span>🐢 Полека</span>
          <span>🐇 Побрзо</span>
        </div>
      </div>

      <label className="learning-check">
        <span>Фонт за дислексија</span>

        <input
          type="checkbox"
          checked={settings.dyslexiaFont}
          onChange={(e) =>
            update("dyslexiaFont", e.target.checked)
          }
        />
      </label>

      <label className="learning-check">
        <span>Означи ја реченицата што се чита</span>

        <input
          type="checkbox"
          checked={settings.highlight}
          onChange={(e) =>
            update("highlight", e.target.checked)
          }
        />
      </label>

      <div className="learning-setting">
        <label htmlFor="learning-background">
          Боја на подлогата
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
