
package com.dyslexia.backend.controller;

import com.dyslexia.backend.service.AzureSpeechService;
import com.dyslexia.backend.service.AzureSpeechRecognitionService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/speech")
public class SpeechController {

    private final AzureSpeechService speechService;

    private final AzureSpeechRecognitionService recognitionService;

    public SpeechController(
            AzureSpeechService speechService,
            AzureSpeechRecognitionService recognitionService
    ) {
        this.speechService = speechService;
        this.recognitionService = recognitionService;
    }

    // ==========================================
    // TEXT TO SPEECH - MARIJA
    // ==========================================

    @PostMapping("/tts")
    public ResponseEntity<byte[]> textToSpeech(
            @RequestBody Map<String, String> request
    ) {

        String text = request.get("text");

        if (text == null || text.isBlank() || text.length() > 3000) {
            return ResponseEntity.badRequest().build();
        }

        byte[] audio = speechService.textToSpeech(text);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("audio/mpeg"))
                .body(audio);
    }

    // ==========================================
    // SPEECH TO TEXT - CHILD READING
    // ==========================================

    @PostMapping(
            value = "/recognize",
            consumes = "audio/webm"
    )
    public ResponseEntity<?> recognizeSpeech(
            @RequestBody byte[] audio
    ) {

        if (audio == null || audio.length == 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "error", "Audio is empty"
                    ));
        }

        if (audio.length > 5_000_000) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "error", "Audio is too large"
                    ));
        }

        String recognizedText =
                recognitionService.recognizeSpeech(audio);

        return ResponseEntity.ok(
                Map.of(
                        "text", recognizedText
                )
        );
    }
}
