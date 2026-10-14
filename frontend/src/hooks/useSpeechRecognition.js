
import { useCallback, useEffect, useRef, useState } from "react";

const SILENCE_MS = 2000;
const MAX_RECORDING_MS = 18000;
const MIN_SPEECH_MS = 250;
const SPEECH_THRESHOLD = 0.025;

export default function useSpeechRecognition() {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [error, setError] = useState("");

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const contextRef = useRef(null);
  const animationRef = useRef(null);
  const timeoutRef = useRef(null);
  const abortRef = useRef(null);
  const runIdRef = useRef(0);

  const cleanupAudio = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    streamRef.current = null;

    if (contextRef.current) {
      contextRef.current.close().catch(() => {});
      contextRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    runIdRef.current += 1;

    abortRef.current?.abort();
    abortRef.current = null;

    const recorder = recorderRef.current;
    recorderRef.current = null;

    if (recorder?.state === "recording") {
      recorder.onstop = null;
      recorder.stop();
    }

    cleanupAudio();
    setListening(false);
    setProcessing(false);
  }, [cleanupAudio]);

  const finish = useCallback(() => {
    const recorder = recorderRef.current;

    if (recorder?.state === "recording") {
      recorder.stop();
    }
  }, []);

  const start = useCallback(async () => {
    stop();

    const runId = runIdRef.current;

    setRecognizedText("");
    setError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Прелистувачот не поддржува микрофон.");
      return;
    }

    if (!window.MediaRecorder) {
      setError("Прелистувачот не поддржува снимање.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      if (runId !== runIdRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;

      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/webm"
      ].find((type) => MediaRecorder.isTypeSupported(type));

      if (!mimeType) {
        throw new Error("WebM audio не е поддржано.");
      }

      const recorder = new MediaRecorder(stream, {
        mimeType
      });

      recorderRef.current = recorder;

      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        cleanupAudio();

        if (runId !== runIdRef.current) return;

        setListening(false);

        if (!chunks.length) {
          setError("Не успеав да снимам звук.");
          return;
        }

        setProcessing(true);

        const controller = new AbortController();
        abortRef.current = controller;

        try {
          const audioBlob = new Blob(chunks, {
            type: mimeType
          });

          const token = localStorage.getItem("token");

          const response = await fetch(
            "http://localhost:8080/api/speech/recognize",
            {
              method: "POST",
              headers: {
                "Content-Type": mimeType,
                ...(token
                  ? { Authorization: `Bearer ${token}` }
                  : {})
              },
              body: audioBlob,
              signal: controller.signal
            }
          );

          if (!response.ok) {
            throw new Error(
              `Препознавањето не успеа (${response.status}).`
            );
          }

          const data = await response.json();

          if (runId !== runIdRef.current) return;

          const text = data.text?.trim() || "";

          if (!text) {
            setError(
              "Не ги препознав зборовите. Пробај повторно. 🌱"
            );
          } else {
            setRecognizedText(text);
          }
        } catch (err) {
          if (err.name !== "AbortError" &&
              runId === runIdRef.current) {
            setError(err.message);
          }
        } finally {
          if (runId === runIdRef.current) {
            setProcessing(false);
            abortRef.current = null;
          }
        }
      };

      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) {
        throw new Error("AudioContext не е поддржан.");
      }

      const context = new AudioContextClass();
      contextRef.current = context;

      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();

      analyser.fftSize = 2048;
      source.connect(analyser);

      const samples = new Float32Array(analyser.fftSize);

      let speechStarted = false;
      let speechStartTime = null;
      let lastSpeechTime = null;

      recorder.start();
      setListening(true);

      const startedAt = performance.now();

      const detectSilence = () => {
        if (runId !== runIdRef.current) return;
        if (recorder.state !== "recording") return;

        analyser.getFloatTimeDomainData(samples);

        let sum = 0;

        for (const sample of samples) {
          sum += sample * sample;
        }

        const volume = Math.sqrt(sum / samples.length);
        const now = performance.now();

        if (volume > SPEECH_THRESHOLD) {
          if (speechStartTime === null) {
            speechStartTime = now;
          }

          if (now - speechStartTime >= MIN_SPEECH_MS) {
            speechStarted = true;
          }

          lastSpeechTime = now;
        } else {
          speechStartTime = null;
        }

        if (
          speechStarted &&
          lastSpeechTime !== null &&
          now - lastSpeechTime >= SILENCE_MS
        ) {
          finish();
          return;
        }

        if (now - startedAt >= MAX_RECORDING_MS) {
          if (speechStarted) {
            finish();
          } else {
            stop();
            setError(
              "Не слушнав читање. Пробај повторно. 🌱"
            );
          }
          return;
        }

        animationRef.current =
          requestAnimationFrame(detectSilence);
      };

      animationRef.current =
        requestAnimationFrame(detectSilence);

    } catch (err) {
      if (runId === runIdRef.current) {
        stop();
        setError(
          err.message || "Не можам да го вклучам микрофонот."
        );
      }
    }
  }, [stop, finish, cleanupAudio]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    listening,
    processing,
    recognizedText,
    error,
    start,
    finish,
    stop
  };
}
