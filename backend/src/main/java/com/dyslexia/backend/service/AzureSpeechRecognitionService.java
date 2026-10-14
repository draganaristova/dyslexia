
package com.dyslexia.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

@Service
public class AzureSpeechRecognitionService {

    private final RestClient restClient = RestClient.create();

    @Value("${AZURE_SPEECH_KEY}")
    private String speechKey;

    @Value("${AZURE_SPEECH_REGION}")
    private String speechRegion;

    public String recognizeSpeech(byte[] webmAudio) {

        if (webmAudio == null || webmAudio.length == 0) {
            throw new IllegalArgumentException(
                    "Audio cannot be empty"
            );
        }

        if (webmAudio.length > 5_000_000) {
            throw new IllegalArgumentException(
                    "Audio is too large"
            );
        }

        Path inputFile = null;
        Path outputFile = null;

        try {
            inputFile = Files.createTempFile(
                    "lexiland-input-", ".webm"
            );

            outputFile = Files.createTempFile(
                    "lexiland-output-", ".wav"
            );

            Files.write(inputFile, webmAudio);

            Process process = new ProcessBuilder(
                    "C:\\Users\\Dragana\\AppData\\Local\\Microsoft\\WinGet\\Links\\ffmpeg.exe",
                    "-nostdin",
                    "-y",
                    "-loglevel", "error",
                    "-i", inputFile.toString(),
                    "-ac", "1",
                    "-ar", "16000",
                    "-c:a", "pcm_s16le",
                    outputFile.toString()
            )
                    .redirectErrorStream(true)
                    .start();

            // Читај го излезот за процесот да не блокира.
            Thread outputReader = new Thread(() -> {
                try (var stream = process.getInputStream()) {
                    stream.transferTo(java.io.OutputStream.nullOutputStream());
                } catch (IOException ignored) {
                }
            });

            outputReader.setDaemon(true);
            outputReader.start();

            boolean completed = process.waitFor(
                    15, TimeUnit.SECONDS
            );

            if (!completed) {
                process.destroyForcibly();

                throw new IllegalStateException(
                        "Audio conversion timed out"
                );
            }

            outputReader.join(1000);

            if (process.exitValue() != 0) {
                throw new IllegalStateException(
                        "Audio conversion failed"
                );
            }

            byte[] wavAudio = Files.readAllBytes(outputFile);

            String url = "https://" + speechRegion
                    + ".stt.speech.microsoft.com"
                    + "/speech/recognition/conversation/cognitiveservices/v1"
                    + "?language=mk-MK&format=simple";

            System.out.println(
                    "AZURE STT: Recognizing Macedonian speech..."
            );

            AzureRecognitionResponse response = restClient.post()
                    .uri(url)
                    .header(
                            "Ocp-Apim-Subscription-Key",
                            speechKey
                    )
                    .contentType(MediaType.parseMediaType("audio/wav"))
                    .body(wavAudio)
                    .retrieve()
                    .body(AzureRecognitionResponse.class);

            String recognizedText =
                    response == null || response.DisplayText() == null
                            ? ""
                            : response.DisplayText();

            System.out.println(
                    "AZURE STT: Recognition completed"
            );

            return recognizedText;

        } catch (RestClientResponseException e) {

            System.err.println(
                    "AZURE STT HTTP STATUS: " + e.getStatusCode()
            );

            System.err.println(
                    "AZURE STT RESPONSE: "
                            + e.getResponseBodyAsString()
            );

            throw new IllegalStateException(
                    "Azure recognition request failed",
                    e
            );

        } catch (InterruptedException e) {

            Thread.currentThread().interrupt();

            throw new IllegalStateException(
                    "Speech recognition interrupted",
                    e
            );

        } catch (IOException e) {

            throw new IllegalStateException(
                    "Audio processing failed",
                    e
            );

        } finally {
            try {
                if (inputFile != null) {
                    Files.deleteIfExists(inputFile);
                }

                if (outputFile != null) {
                    Files.deleteIfExists(outputFile);
                }
            } catch (IOException ignored) {
            }
        }
    }

    public record AzureRecognitionResponse(
            String RecognitionStatus,
            String DisplayText
    ) {
    }
}
