package com.dyslexia.backend.controller;

import com.dyslexia.backend.model.User;
import com.dyslexia.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class ProfileController {

    private final UserRepository userRepository;

    public ProfileController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable Long userId) {

        Optional<User> opt = userRepository.findById(userId);

        if (opt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "Не постои корисникот."));
        }

        return ResponseEntity.ok(toMap(opt.get()));
    }

    @PutMapping("/{userId}/settings")
    public ResponseEntity<?> updateSettings(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> request
    ) {

        Optional<User> opt = userRepository.findById(userId);

        if (opt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "Не постои корисникот."));
        }

        User user = opt.get();

        if (request.get("fontSize") != null) {
            user.setFontSize(Integer.valueOf(request.get("fontSize").toString()));
        }

        if (request.get("letterSpacing") != null) {
            user.setLetterSpacing(Integer.valueOf(request.get("letterSpacing").toString()));
        }

        if (request.get("theme") != null) {
            user.setTheme(request.get("theme").toString());
        }

        userRepository.save(user);

        return ResponseEntity.ok(toMap(user));
    }

    private Map<String, Object> toMap(User user) {

        Map<String, Object> map = new HashMap<>();

        map.put("id", user.getId());
        map.put("name", user.getName());
        map.put("surname", user.getSurname());
        map.put("age", user.getAge());
        map.put("gender", user.getGender());
        map.put("avatarEmoji", user.getAvatarEmoji());
        map.put("fontSize", user.getFontSize());
        map.put("letterSpacing", user.getLetterSpacing());
        map.put("theme", user.getTheme());

        return map;
    }
}