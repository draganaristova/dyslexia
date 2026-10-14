
package com.dyslexia.backend.controller;

import com.dyslexia.backend.service.AzureSpeechService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/speech")
public class SpeechController {

    private final AzureSpeechService speechService;

    public SpeechController(AzureSpeechService speechService) {
        this.speechService = speechService;
    }

    @PostMapping("/tts")
    public ResponseEntity<byte[]> textToSpeech(
            @RequestBody Map<String, String> request) {

        String text = request.get("text");

        if (text == null || text.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        if (text.length() > 3000) {
            return ResponseEntity.badRequest().build();
        }

        byte[] audio = speechService.textToSpeech(text);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("audio/mpeg"))
                .body(audio);
    }
}
