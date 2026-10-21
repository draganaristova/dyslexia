import React, { useEffect, useMemo, useState } from "react";
import useSpeechRecognition from "../../hooks/useSpeechRecognition";
import { evaluateReading } from "../../data/readingFeedback";

export default function ReadingPlayer({
  story,
  settings,
  tts
}) {
  const {
    listening,
    processing,
    recognizedText,
    error,
    start,
    stop
  } = useSpeechRecognition();

  const [practiceIndex, setPracticeIndex] = useState(null);
  const [practiceText, setPracticeText] = useState("");
  const [hasAttempt, setHasAttempt] = useState(false);

  const sentences = useMemo(
    () =>
      Array.isArray(story?.sentences)
        ? story.sentences
        : [],
    [story?.sentences]
  );

  const isWord = story?.category === "words" || story?.category === "word";
  const isStory = story?.category === "story";

  const totalWords = useMemo(() => {
    return sentences.join(" ").trim().split(/\s+/u)
      .filter(Boolean).length;
  }, [sentences]);

  const canPracticeAll = !isStory && totalWords > 0 && totalWords <= 12;
  const feedback = useMemo(() => {
    if (!hasAttempt || !recognizedText?.trim()) {
      return null;
    }

    return evaluateReading(
      practiceText,
      recognizedText
    );
  }, [
    hasAttempt,
    practiceText,
    recognizedText
  ]);

  useEffect(() => {
    stop();
    setPracticeIndex(null);
    setPracticeText("");
    setHasAttempt(false);
  }, [story?.id, stop]);

  if (!story) {
    return (
      <div className="reading-empty">
        Избери текст за читање. 📚
      </div>
    );
  }

  const readAll = () => {
    stop();

    tts.speakSentences(
      sentences,
      settings.speed,
      0
    );
  };

  const readOne = (index) => {
    stop();

    tts.speakSentences(
      [sentences[index]],
      settings.speed,
      index
    );
  };

  const startPractice = async (index = null) => {
    if (
      index === null &&
      !canPracticeAll
    ) {
      return;
    }

    tts.stop();
    stop();

    const text =
      index === null
        ? sentences.join(" ")
        : sentences[index];

    if (!text?.trim()) return;

    setPracticeIndex(index);
    setPracticeText(text);
    setHasAttempt(true);
    await start();
  };

  const stopEverything = () => {
    tts.stop();
    stop();
    setHasAttempt(false);
  };

  const renderFeedback = (index = null) => {
    if (
      !feedback ||
      listening ||
      processing ||
      practiceIndex !== index
    ) {
      return null;
    }

    return (
      <div
        className="reading-feedback"
        role="status"
      >
        <h3>🌟 Твоето читање</h3>
        <p>{feedback.message}</p>

        <p>
          Препознаени зборови:{" "}
          <strong>
            {feedback.matched} од {feedback.total}
          </strong>
        </p>

        <p>
          <strong>Слушнав:</strong>{" "}
          {recognizedText}
        </p>

        {feedback.practiceWords.length > 0 && (
          <div>
            <p>
              Ајде да ги вежбаме овие зборови:
            </p>

            <div className="reading-practice-words">
              {[
                ...new Set(feedback.practiceWords)
              ].map((word) => (
                <button
                  key={word}
                  type="button"
                  disabled={tts.speaking}
                  onClick={() =>
                    tts.speakSentences(
                      [word],
                      settings.speed,
                      0
                    )
                  }
                >
                  🔊 {word}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          className="reading-primary-button"
          disabled={tts.speaking}
          onClick={() => startPractice(index)}
        >
          🔄 Пробај повторно
        </button>
      </div>
    );
  };

  return (
    <section className="reading-player">
      <div className="reading-player-heading">
        <div className="reading-player-title">
          <span
            className="reading-story-icon"
            aria-hidden="true"
          >
            {story.icon || "📖"}
          </span>

          <div>
            <h2>{story.title}</h2>
          </div>
        </div>

        <span className="reading-level">
          Ниво {story.level}
        </span>
      </div>

      <div className="reading-practice-hint">
        <strong>
          🌱 Читај со свое темпо!
        </strong>

        <br />

        <span>
          Притисни 🎤 до реченицата или
          зборот што сакаш да го прочиташ.
          Ако ти треба помош, притисни 🔊.
        </span>
      </div>

      <div className="reading-actions">
        {canPracticeAll && (
          <button
            type="button"
            className="reading-primary-button"
            onClick={() => startPractice(null)}
            disabled={
              listening ||
              processing ||
              !sentences.length
            }
          >
            {listening
              ? "🎙️ Те слушам..."
              : processing
              ? "✨ Го проверувам читањето..."
              : isWord
              ? "🎤 Изговори ги зборовите"
              : "🎤 Читај го целиот текст"}
          </button>
        )}

        <button
          type="button"
          className="reading-primary-button"
          onClick={readAll}
          disabled={
            tts.speaking ||
            listening ||
            processing ||
            !sentences.length
          }
        >
          🔊{" "}
          {isWord
            ? "Слушај ги зборовите"
            : "Слушај го целиот текст"}
        </button>

        <button
          type="button"
          className="reading-stop-button"
          onClick={stopEverything}
          disabled={
            !tts.speaking &&
            !listening &&
            !processing
          }
        >
          ⏹ Стоп
        </button>
      </div>

      {listening && (
        <p
          className="reading-listening"
          role="status"
        >
          🎙️ Те слушам! Читај полека.
          Имаш време да размислиш
          пред секој збор. 💚
        </p>
      )}

      {processing && (
        <p
          className="reading-listening"
          role="status"
        >
          ✨ Го проверувам твоето читање...
        </p>
      )}

      <div
        className={`reading-text reading-bg-${settings.background} ${
          settings.dyslexiaFont
            ? "reading-dyslexia"
            : ""
        }`}
        style={{
          fontSize: `${settings.fontSize}px`,
          letterSpacing:
            `${settings.letterSpacing}px`
        }}
      >
        {sentences.map((sentence, index) => {
          const ttsActive =
            settings.highlight &&
            tts.speaking &&
            tts.activeIndex === index;

          const micActive =
            listening &&
            (
              practiceIndex === null ||
              practiceIndex === index
            );

          return (
            <div
              key={`${story.id}-${index}`}
              className={`reading-sentence ${
                ttsActive
                  ? "reading-sentence-active"
                  : ""
              } ${
                micActive
                  ? "reading-sentence-listening"
                  : ""
              }`}
            >
              <span className="reading-sentence-text">
                {sentence}
              </span>

              <div className="reading-sentence-controls">
                <button
                  type="button"
                  className="reading-sentence-audio"
                  title={
                    isWord
                      ? "Изговори го зборот"
                      : "Прочитај самостојно"
                  }
                  aria-label={
                    `Читај самостојно: ${sentence}`
                  }
                  disabled={
                    listening ||
                    processing
                  }
                  onClick={() =>
                    startPractice(index)
                  }
                >
                  🎤
                </button>

                <button
                  type="button"
                  className="reading-sentence-audio"
                  title="Слушај го изговорот"
                  aria-label={`Слушај: ${sentence}`}
                  aria-pressed={ttsActive}
                  disabled={
                    listening ||
                    processing
                  }
                  onClick={() =>
                    readOne(index)
                  }
                >
                  🔊
                </button>
              </div>

              {renderFeedback(index)}
            </div>
          );
        })}
      </div>

      {canPracticeAll &&
        practiceIndex === null && (
          <div className="reading-full-feedback">
            {renderFeedback(null)}
          </div>
        )}

      <div className="reading-message">
        ⭐ Нема брзање. Секој обид е успех!
      </div>

      {(error || tts.error) && (
        <p
          className="reading-warning"
          role="alert"
        >
          {error || tts.error}
        </p>
      )}
    </section>
  );
}
