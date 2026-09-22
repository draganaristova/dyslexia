package com.dyslexia.backend.controller;

import com.dyslexia.backend.model.AgeGroup;
import com.dyslexia.backend.model.Exercise;
import com.dyslexia.backend.model.GamesType;
import com.dyslexia.backend.model.User;
import com.dyslexia.backend.repository.ExerciseRepository;
import com.dyslexia.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;

    public ExerciseController(ExerciseRepository exerciseRepository, UserRepository userRepository) {
        this.exerciseRepository = exerciseRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/{gamesId}/{gamesType}")
    public ResponseEntity<?> getExercise(
            @PathVariable Long gamesId,
            @PathVariable GamesType gamesType,
            @RequestParam Long userId
    ) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Не постои корисникот"));
        }

        AgeGroup ageGroup = resolveAgeGroup(userOpt.get().getAge());

        Optional<Exercise> exerciseOpt = exerciseRepository
                .findByGamesIdAndGamesTypeAndAgeGroup(gamesId, gamesType, ageGroup);

        if (exerciseOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Exercise exercise = exerciseOpt.get();

        return ResponseEntity.ok(Map.of(
                "id", exercise.getId(),
                "gamesType", exercise.getGamesType(),
                "ageGroup", exercise.getAgeGroup(),
                "pinNumber", exercise.getPinNumber(),
                "content", exercise.getContentJson()
        ));
    }

    private AgeGroup resolveAgeGroup(Integer age) {
        if (age == null) return AgeGroup.AGE_5_7;
        if (age <= 7) return AgeGroup.AGE_5_7;
        if (age <= 10) return AgeGroup.AGE_7_10;
        return AgeGroup.AGE_10_15;
    }
}