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
import java.util.*;

@RestController
@RequestMapping("/api/exercise-progress")
public class ExerciseProgressController {

    private static final int TOTAL_TASKS = 10;
    private static final int PASSING_SCORE = 8;

    private final ExerciseProgressRepository progressRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;

    public ExerciseProgressController(
            ExerciseProgressRepository progressRepository,
            ExerciseRepository exerciseRepository,
            UserRepository userRepository
    ) {
        this.progressRepository = progressRepository;
        this.exerciseRepository = exerciseRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> saveProgress(
            @RequestBody Map<String, Object> request
    ) {

        try {

            if (request.get("userId") == null ||
                    request.get("exerciseId") == null ||
                    request.get("score") == null ||
                    request.get("correct") == null) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Недостасуваат податоци."
                        ));
            }

            Long userId =
                    Long.valueOf(
                            request.get("userId").toString()
                    );

            Long exerciseId =
                    Long.valueOf(
                            request.get("exerciseId").toString()
                    );

            Integer score =
                    Integer.valueOf(
                            request.get("score").toString()
                    );

            Boolean correct =
                    Boolean.valueOf(
                            request.get("correct").toString()
                    );

            User user =
                    userRepository.findById(userId)
                            .orElse(null);

            if (user == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Не постои корисникот."
                        ));
            }

            Exercise exercise =
                    exerciseRepository.findById(exerciseId)
                            .orElse(null);

            if (exercise == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Не постои задачата."
                        ));
            }

            Optional<ExerciseProgress> existing =
                    progressRepository
                            .findByUserIdAndExerciseId(
                                    userId,
                                    exerciseId
                            );

            ExerciseProgress progress;

            if (existing.isPresent()) {

                progress = existing.get();

                int oldAttempts =
                        progress.getAttempts() == null
                                ? 0
                                : progress.getAttempts();

                progress.setAttempts(oldAttempts + 1);

            } else {

                progress = new ExerciseProgress();

                progress.setUser(user);
                progress.setExercise(exercise);
                progress.setAttempts(1);
            }

            progress.setScore(
                    Math.max(0, Math.min(score, 1))
            );

            progress.setCorrect(correct);
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());

            ExerciseProgress saved =
                    progressRepository.save(progress);

            return ResponseEntity.ok(
                    createResponse(saved)
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Не може да се зачува напредокот."
                    ));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserProgress(
            @PathVariable Long userId
    ) {

        if (!userRepository.existsById(userId)) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Не постои корисникот."
                    ));
        }

        List<ExerciseProgress> progress =
                progressRepository
                        .findByUserIdOrderByCompletedAtDesc(
                                userId
                        );

        List<Map<String, Object>> result =
                new ArrayList<>();

        for (ExerciseProgress item : progress) {
            result.add(createResponse(item));
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/user/{userId}/summary")
    public ResponseEntity<?> getSummary(
            @PathVariable Long userId
    ) {

        if (!userRepository.existsById(userId)) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Не постои корисникот."
                    ));
        }

        List<ExerciseProgress> progress =
                progressRepository
                        .findByUserIdOrderByCompletedAtDesc(
                                userId
                        );

        Map<String, List<ExerciseProgress>> grouped =
                new LinkedHashMap<>();

        for (ExerciseProgress item : progress) {

            Exercise exercise =
                    item.getExercise();

            String key =
                    exercise.getGames().getId()
                            + "_"
                            + exercise.getGamesType().name()
                            + "_"
                            + exercise.getPinNumber();

            grouped
                    .computeIfAbsent(
                            key,
                            k -> new ArrayList<>()
                    )
                    .add(item);
        }

        List<Map<String, Object>> result =
                new ArrayList<>();

        for (List<ExerciseProgress> mission :
                grouped.values()) {

            if (mission.isEmpty()) {
                continue;
            }

            Exercise first =
                    mission.get(0).getExercise();

            Set<Integer> completedTaskNumbers =
                    new HashSet<>();

            int score = 0;

            for (ExerciseProgress item : mission) {

                if (Boolean.TRUE.equals(
                        item.getCompleted()
                )) {

                    completedTaskNumbers.add(
                            item.getExercise()
                                    .getTaskNumber()
                    );

                    if (Boolean.TRUE.equals(
                            item.getCorrect()
                    )) {
                        score++;
                    }
                }
            }

            int completedTasks =
                    completedTaskNumbers.size();

            boolean completed =
                    completedTasks == TOTAL_TASKS;

            boolean passed =
                    completed &&
                            score >= PASSING_SCORE;

            Map<String, Object> item =
                    new LinkedHashMap<>();

            item.put(
                    "gamesId",
                    first.getGames().getId()
            );

            item.put(
                    "gameName",
                    first.getGames().getName()
            );

            item.put(
                    "gamesType",
                    first.getGamesType().name()
            );

            item.put(
                    "pinNumber",
                    first.getPinNumber()
            );

            item.put(
                    "completedTasks",
                    completedTasks
            );

            item.put(
                    "totalTasks",
                    TOTAL_TASKS
            );

            item.put(
                    "score",
                    score
            );

            item.put(
                    "passed",
                    passed
            );

            item.put(
                    "completed",
                    completed
            );

            result.add(item);
        }

        return ResponseEntity.ok(result);
    }

    private Map<String, Object> createResponse(
            ExerciseProgress progress
    ) {

        Exercise exercise =
                progress.getExercise();

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "exerciseProgressId",
                progress.getId()
        );

        response.put(
                "exerciseId",
                exercise.getId()
        );

        response.put(
                "gamesId",
                exercise.getGames().getId()
        );

        response.put(
                "gameName",
                exercise.getGames().getName()
        );

        response.put(
                "gamesType",
                exercise.getGamesType().name()
        );

        response.put(
                "ageGroup",
                exercise.getAgeGroup().name()
        );

        response.put(
                "pinNumber",
                exercise.getPinNumber()
        );

        response.put(
                "taskNumber",
                exercise.getTaskNumber()
        );

        response.put(
                "score",
                progress.getScore()
        );

        response.put(
                "attempts",
                progress.getAttempts()
        );

        response.put(
                "correct",
                progress.getCorrect()
        );

        response.put(
                "completed",
                progress.getCompleted()
        );

        response.put(
                "completedAt",
                progress.getCompletedAt()
        );

        return response;
    }
}