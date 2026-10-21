package com.dyslexia.backend.service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Service
public class AzureSpeechService {
    private final RestClient restClient = RestClient.create();

    @Value("${AZURE_SPEECH_KEY}")
    private String speechKey;

    @Value("${AZURE_SPEECH_REGION}")
    private String speechRegion;

    public byte[] textToSpeech(String text) {

        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Text cannot be empty");
        }

        if (text.length() > 3000) {
            throw new IllegalArgumentException("Text is too long");
        }

        String url = "https://" + speechRegion + ".tts.speech.microsoft.com/cognitiveservices/v1";
        String ssml = """
                <speak version="1.0"
                       xmlns="http://www.w3.org/2001/10/synthesis"
                       xml:lang="mk-MK">
                    <voice name="mk-MK-MarijaNeural">
                        <prosody rate="0.75">
                            %s
                        </prosody>
                    </voice>
                </speak>
                """.formatted(escapeXml(text));

        try {
            ResponseEntity<byte[]> response = restClient.post()
                    .uri(url)
                    .header("Ocp-Apim-Subscription-Key", speechKey)
                    .header("X-Microsoft-OutputFormat", "audio-16khz-128kbitrate-mono-mp3")
                    .header("User-Agent", "LexiLand")
                    .contentType(MediaType.parseMediaType("application/ssml+xml; charset=utf-8"))
                    .accept(MediaType.parseMediaType("audio/mpeg"))
                    .body(ssml.getBytes(java.nio.charset.StandardCharsets.UTF_8))
                    .retrieve()
                    .toEntity(byte[].class);

            byte[] audio = response.getBody();
            int audioSize = audio == null ? 0 : audio.length;

            if (audioSize == 0) {
                throw new IllegalStateException("Azure returned empty audio");
            }

            System.out.println("AZURE TTS: Audio generated successfully");
            return audio;

        } catch (RestClientResponseException e) {

            System.err.println("AZURE HTTP STATUS: " + e.getStatusCode());
            System.err.println("AZURE RESPONSE: " + e.getResponseBodyAsString());

            throw new IllegalStateException("Azure Speech request failed: " + e.getStatusCode(), e);

        } catch (Exception e) {

            System.err.println("AZURE TTS ERROR: " + e.getMessage());
            throw e;
        }
    }

    private String escapeXml(String text) {

        return text
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}
