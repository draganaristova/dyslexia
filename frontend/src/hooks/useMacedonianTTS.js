import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

const API_URL = "http://localhost:8080/api/speech/tts";

export default function useMacedonianTTS() {
  const [speaking, setSpeaking] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState("");

  const runId = useRef(0);
  const audioRef = useRef(null);
  const controllerRef = useRef(null);
  const urlRef = useRef(null);
  const pendingResolveRef = useRef(null);

  const cleanup = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }

    if (pendingResolveRef.current) {
      pendingResolveRef.current();
      pendingResolveRef.current = null;
    }

    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    runId.current += 1;
    cleanup();

    setSpeaking(false);
    setActiveIndex(-1);
    setError("");
  }, [cleanup]);

  const speakSentences = useCallback(
    async (sentences, rate = 1, startIndex = 0) => {
      if (
        !Array.isArray(sentences) ||
        sentences.length === 0
      ) {
        return;
      }

      stop();

      const thisRun = runId.current;

      const safeRate = Math.min(
        1.2,
        Math.max(0.65, Number(rate) || 1)
      );

      const offset = Math.max(
        0,
        Math.floor(Number(startIndex) || 0)
      );

      for (
        let index = 0;
        index < sentences.length;
        index++
      ) {
        if (runId.current !== thisRun) return;

        const text = sentences[index];

        if (
          typeof text !== "string" ||
          !text.trim()
        ) {
          continue;
        }

        const controller = new AbortController();
        controllerRef.current = controller;

        try {
          setSpeaking(true);
          setActiveIndex(offset + index);

          const token = localStorage.getItem("token");

          if (!token) {
            throw new Error("NO_TOKEN");
          }

          const response = await fetch(API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ text }),
            signal: controller.signal
          });

          if (!response.ok) {
            throw new Error(`HTTP_${response.status}`);
          }

          const blob = await response.blob();

          if (runId.current !== thisRun) return;

          if (!blob.size) {
            throw new Error("EMPTY_AUDIO");
          }

          const url = URL.createObjectURL(blob);
          urlRef.current = url;

          const audio = new Audio(url);
          audioRef.current = audio;

          audio.playbackRate = safeRate;

          await new Promise((resolve, reject) => {
            let settled = false;

            const finish = (playError = null) => {
              if (settled) return;
              settled = true;

              pendingResolveRef.current = null;

              if (playError) {
                reject(playError);
              } else {
                resolve();
              }
            };

            pendingResolveRef.current = () => finish();

            audio.onended = () => finish();

            audio.onerror = () => {
              finish(new Error("AUDIO_PLAYBACK_ERROR"));
            };

            audio.play().catch(finish);
          });

          if (runId.current !== thisRun) return;

          audioRef.current = null;

          URL.revokeObjectURL(url);
          urlRef.current = null;
          controllerRef.current = null;

        } catch (err) {
          if (runId.current !== thisRun) return;

          cleanup();
          setSpeaking(false);
          setActiveIndex(-1);

          if (err.name === "AbortError") return;

          console.error("Azure Speech error:", err);

          if (err.message === "NO_TOKEN") {
            setError(
              "Најави се за да го користиш слушањето."
            );
          } else if (
            ["HTTP_401", "HTTP_403"].includes(err.message)
          ) {
            setError(
              "Сесијата не е валидна. Најави се повторно."
            );
          } else {
            setError(
              "Не успеа читањето. Провери дали backend и Azure Speech работат."
            );
          }

          return;
        }
      }

      if (runId.current === thisRun) {
        cleanup();
        setSpeaking(false);
        setActiveIndex(-1);
      }
    },
    [stop, cleanup]
  );

  useEffect(() => {
    return () => {
      runId.current += 1;
      cleanup();
    };
  }, [cleanup]);

  return {
    supported: true,
    voicesLoaded: true,
    voice: {
      name: "Azure Macedonian",
      lang: "mk-MK"
    },
    speaking,
    activeIndex,
    error,
    stop,
    speakSentences
  };
}
