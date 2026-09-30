package com.dyslexia.backend.controller;

import com.dyslexia.backend.model.Exercise;
import com.dyslexia.backend.model.ExerciseProgress;
import com.dyslexia.backend.model.User;
import com.dyslexia.backend.repository.ExerciseProgressRepository;
import com.dyslexia.backend.repository.ExerciseRepository;
import com.dyslexia.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/exercise-progress")
public class ExerciseProgressController {

    private final ExerciseProgressRepository exerciseProgressRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;

    public ExerciseProgressController(
            ExerciseProgressRepository exerciseProgressRepository,
            ExerciseRepository exerciseRepository,
            UserRepository userRepository
    ) {
        this.exerciseProgressRepository = exerciseProgressRepository;
        this.exerciseRepository = exerciseRepository;
        this.userRepository = userRepository;
    }

    /**
     * Зачувување на резултатот од една задача.
     */
    @PostMapping
    public ResponseEntity<?> saveExerciseProgress(
            @RequestBody Map<String, Object> request
    ) {

        Long userId = Long.valueOf(
                request.get("userId").toString()
        );

        Long exerciseId = Long.valueOf(
                request.get("exerciseId").toString()
        );

        Integer score = Integer.valueOf(
                request.get("score").toString()
        );

        Integer attempts = Integer.valueOf(
                request.get("attempts").toString()
        );

        Boolean correct = Boolean.valueOf(
                request.get("correct").toString()
        );

        Optional<User> userOpt =
                userRepository.findById(userId);

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Не постои корисникот."
                    ));
        }

        Optional<Exercise> exerciseOpt =
                exerciseRepository.findById(exerciseId);

        if (exerciseOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Не постои задачата."
                    ));
        }

        User user = userOpt.get();
        Exercise exercise = exerciseOpt.get();

        Optional<ExerciseProgress> existingOpt =
                exerciseProgressRepository
                        .findByUserIdAndExerciseId(
                                userId,
                                exerciseId
                        );

        ExerciseProgress progress;

        if (existingOpt.isPresent()) {
            progress = existingOpt.get();
        } else {
            progress = new ExerciseProgress();
            progress.setUser(user);
            progress.setExercise(exercise);
        }

        progress.setScore(score);
        progress.setAttempts(attempts);
        progress.setCorrect(correct);
        progress.setCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());

        ExerciseProgress saved =
                exerciseProgressRepository.save(progress);

        Map<String, Object> response = new HashMap<>();

        response.put("id", saved.getId());
        response.put("exerciseId", exercise.getId());
        response.put("taskNumber", exercise.getTaskNumber());
        response.put("score", saved.getScore());
        response.put("attempts", saved.getAttempts());
        response.put("correct", saved.getCorrect());
        response.put("completed", saved.getCompleted());

        return ResponseEntity.ok(response);
    }

    /**
     * Детален progress за едно дете.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserExerciseProgress(
            @PathVariable Long userId
    ) {

        Optional<User> userOpt =
                userRepository.findById(userId);

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Не постои корисникот."
                    ));
        }

        List<ExerciseProgress> progressList =
                exerciseProgressRepository
                        .findByUserIdOrderByCompletedAtDesc(
                                userId
                        );

        List<Map<String, Object>> result =
                new ArrayList<>();

        for (ExerciseProgress progress : progressList) {

            Exercise exercise =
                    progress.getExercise();

            Map<String, Object> item =
                    new HashMap<>();

            item.put(
                    "exerciseProgressId",
                    progress.getId()
            );

            item.put(
                    "exerciseId",
                    exercise.getId()
            );

            item.put(
                    "gamesId",
                    exercise.getGames().getId()
            );

            item.put(
                    "gameName",
                    exercise.getGames().getName()
            );

            item.put(
                    "gamesType",
                    exercise.getGamesType()
            );

            item.put(
                    "ageGroup",
                    exercise.getAgeGroup()
            );

            item.put(
                    "pinNumber",
                    exercise.getPinNumber()
            );

            item.put(
                    "taskNumber",
                    exercise.getTaskNumber()
            );

            item.put(
                    "levelNumber",
                    resolveLevel(
                            exercise.getPinNumber()
                    )
            );

            item.put(
                    "score",
                    progress.getScore()
            );

            item.put(
                    "attempts",
                    progress.getAttempts()
            );

            item.put(
                    "correct",
                    progress.getCorrect()
            );

            item.put(
                    "completed",
                    progress.getCompleted()
            );

            item.put(
                    "completedAt",
                    progress.getCompletedAt()
            );

            result.add(item);
        }

        return ResponseEntity.ok(result);
    }

    private Integer resolveLevel(Integer pinNumber) {

        if (pinNumber == null) {
            return 1;
        }

        if (pinNumber <= 2) {
            return 1;
        }

        if (pinNumber <= 4) {
            return 2;
        }

        return 3;
    }
}
