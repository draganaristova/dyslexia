
import React from "react";

export default function ReadingPlayer({
  story,
  settings,
  tts
}) {
  if (!story) {
    return (
      <div className="reading-empty">
        Избери приказна или реченици за читање. 📚
      </div>
    );
  }

  const readAll = () => {
    tts.speakSentences(story.sentences, settings.speed);
  };

  const readOne = (index) => {
    tts.speakSentences(
      [story.sentences[index]],
      settings.speed
    );
  };

  return (
    <section className="reading-player">
      <div className="reading-player-heading">
        <div>
          <span className="reading-story-icon">{story.icon}</span>
          <h2>{story.title}</h2>
        </div>

        <span className="reading-level">
          Ниво {story.level}
        </span>
      </div>

      <div className="reading-actions">
        <button
          type="button"
          className="reading-primary-button"
          onClick={readAll}
          disabled={!tts.voice}
        >
          🔊 Слушај го целиот текст
        </button>

        <button
          type="button"
          className="reading-stop-button"
          onClick={tts.stop}
          disabled={!tts.speaking}
        >
          ⏹ Стоп
        </button>
      </div>

      <div
        className={`reading-text reading-bg-${settings.background} ${
          settings.dyslexiaFont ? "reading-dyslexia" : ""
        }`}
        style={{
          fontSize: `${settings.fontSize}px`,
          letterSpacing: `${settings.letterSpacing}px`
        }}
      >
        {story.sentences.map((sentence, index) => {
          const active =
            settings.highlight &&
            tts.speaking &&
            tts.activeIndex === index;

          return (
            <div
              className={`reading-sentence ${
                active ? "reading-sentence-active" : ""
              }`}
              key={`${story.id}-${index}`}
            >
              <span className="reading-sentence-text">
                {sentence}
              </span>

              <button
                type="button"
                className="reading-sentence-audio"
                aria-label={`Прочитај: ${sentence}`}
                title="Слушај ја реченицата"
                disabled={!tts.voice}
                onClick={() => readOne(index)}
              >
                🔊
              </button>
            </div>
          );
        })}
      </div>

      <div className="reading-message">
        🌟 Можеш да читаш полека, реченица по реченица.
        Нема брзање!
      </div>

      {!tts.supported && (
        <p className="reading-warning" role="status">
          Овој прелистувач не поддржува автоматско читање.
        </p>
      )}

      {tts.supported && !tts.voice && (
        <p className="reading-warning" role="status">
          Македонски TTS глас не е достапен на овој уред.
          Текстовите можеш да ги читаш, но за слушање
          ќе треба да поврземе македонски говорен сервис.
        </p>
      )}

      {tts.error && (
        <p className="reading-warning" role="alert">
          {tts.error}
        </p>
      )}
    </section>
  );
}
