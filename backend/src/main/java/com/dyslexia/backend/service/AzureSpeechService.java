
package com.dyslexia.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class AzureSpeechService {

    private final RestClient restClient = RestClient.create();

    @Value("${AZURE_SPEECH_KEY}")
    private String speechKey;

    @Value("${AZURE_SPEECH_REGION}")
    private String speechRegion;

    public byte[] textToSpeech(String text) {

        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException(
                    "Text cannot be empty"
            );
        }

        String url = "https://" + speechRegion
                + ".tts.speech.microsoft.com/cognitiveservices/v1";

        String ssml = """
                <speak version="1.0"
                       xmlns="http://www.w3.org/2001/10/synthesis"
                       xml:lang="mk-MK">
                    <voice name="mk-MK-MarijaNeural">
                        %s
                    </voice>
                </speak>
                """.formatted(escapeXml(text));

        byte[] audio = restClient.post()
                .uri(url)
                .header(
                        "Ocp-Apim-Subscription-Key",
                        speechKey
                )
                .header(
                        "X-Microsoft-OutputFormat",
                        "audio-16khz-128kbitrate-mono-mp3"
                )
                .contentType(
                        MediaType.parseMediaType(
                                "application/ssml+xml"
                        )
                )
                .accept(MediaType.valueOf("audio/mpeg"))
                .body(ssml)
                .retrieve()
                .body(byte[].class);

        System.out.println(
                "AZURE AUDIO SIZE: "
                        + (audio == null ? "NULL" : audio.length)
        );

        if (audio == null || audio.length == 0) {
            throw new IllegalStateException(
                    "Azure returned empty audio"
            );
        }

        return audio;
    }

    private String escapeXml(String text) {
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}
