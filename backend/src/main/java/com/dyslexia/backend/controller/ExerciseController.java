package com.dyslexia.backend.controller;
import com.dyslexia.backend.model.AgeGroup;
import com.dyslexia.backend.model.Exercise;
import com.dyslexia.backend.model.ExerciseProgress;
import com.dyslexia.backend.model.GamesType;
import com.dyslexia.backend.model.User;
import com.dyslexia.backend.repository.ExerciseRepository;
import com.dyslexia.backend.repository.UserRepository;
import com.dyslexia.backend.service.GameProgressService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;
    private final GameProgressService progressService;

    public ExerciseController(
            ExerciseRepository exerciseRepository,
            UserRepository userRepository,
            GameProgressService progressService
    ) {
        this.exerciseRepository = exerciseRepository;
        this.userRepository = userRepository;
        this.progressService = progressService;
    }

    @GetMapping(
            "/{gamesId}/{gamesType}/{pinNumber}/{taskNumber}"
    )
    public ResponseEntity<?> getExercise(
            @PathVariable Long gamesId,
            @PathVariable GamesType gamesType,
            @PathVariable Integer pinNumber,
            @PathVariable Integer taskNumber,
            @RequestParam Long userId
    ) {
        try {
            if (
                    gamesId == null ||
                    gamesType == null ||
                    pinNumber == null ||
                    taskNumber == null ||
                    userId == null ||
                    taskNumber < 1 ||
                    taskNumber > GameProgressService.TOTAL_TASKS
            ) {
                return ResponseEntity.badRequest().body(
                        Map.of(
                                "message",
                                "Невалидни податоци за задачата."
                        )
                );
            }

            User user = userRepository
                    .findById(userId)
                    .orElse(null);

            ResponseEntity<?> userError =
                    validateUserAndLevel(user, pinNumber);

            if (userError != null) {
                return userError;
            }

            AgeGroup ageGroup = progressService
                    .ageGroupFromAge(user.getAge());

            Exercise exercise = exerciseRepository
                    .findByGamesIdAndGamesTypeAndAgeGroupAndPinNumberAndTaskNumber(
                            gamesId,
                            gamesType,
                            ageGroup,
                            pinNumber,
                            taskNumber
                    )
                    .orElse(null);

            if (exercise == null) {
                return ResponseEntity.notFound().build();
            }

            List<ExerciseProgress> progress =
                    progressService.getProgress(userId);

            if (!progressService.isGameUnlocked(
                    user,
                    exercise.getGames(),
                    progress
            )) {
                return lockedGame();
            }

            Map<String, Object> response =
                    createResponse(exercise);

            response.put("userAge", user.getAge());
            response.put("levelNumber", pinNumber);
            response.put(
                    "worldNumber",
                    exercise.getGames().getWorldNumber()
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "message",
                                    "Не може да се вчита задачата."
                            )
                    );
        }
    }

    @GetMapping("/{gamesId}/{gamesType}/{pinNumber}")
    public ResponseEntity<?> getMissionExercises(
            @PathVariable Long gamesId,
            @PathVariable GamesType gamesType,
            @PathVariable Integer pinNumber,
            @RequestParam Long userId
    ) {
        try {
            User user = userRepository
                    .findById(userId)
                    .orElse(null);

            ResponseEntity<?> userError =
                    validateUserAndLevel(user, pinNumber);

            if (userError != null) {
                return userError;
            }

            AgeGroup ageGroup = progressService
                    .ageGroupFromAge(user.getAge());

            List<Exercise> exercises = exerciseRepository
                    .findByGamesIdAndGamesTypeAndAgeGroupAndPinNumber(
                            gamesId,
                            gamesType,
                            ageGroup,
                            pinNumber
                    );

            if (exercises.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            List<ExerciseProgress> progress =
                    progressService.getProgress(userId);

            if (!progressService.isGameUnlocked(
                    user,
                    exercises.get(0).getGames(),
                    progress
            )) {
                return lockedGame();
            }

            List<Map<String, Object>> result =
                    exercises.stream()
                            .sorted(
                                    Comparator.comparing(
                                            Exercise::getTaskNumber
                                    )
                            )
                            .map(this::createResponse)
                            .toList();

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "message",
                                    "Не може да се вчитаат задачите."
                            )
                    );
        }
    }

    private ResponseEntity<?> validateUserAndLevel(
            User user,
            Integer pinNumber
    ) {
        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "message",
                                    "Не постои корисникот."
                            )
                    );
        }

        if (user.getAge() == null) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Корисникот нема внесено возраст."
                    )
            );
        }

        int expectedLevel = progressService
                .levelFromAge(user.getAge());

        if (
                pinNumber == null ||
                pinNumber != expectedLevel
        ) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Нивото не одговара на возраста на корисникот."
                    )
            );
        }

        return null;
    }

    private ResponseEntity<?> lockedGame() {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(
                        Map.of(
                                "message",
                                "Прво помини ги претходните игри со најмалку 8 од 10 точни одговори."
                        )
                );
    }

    private Map<String, Object> createResponse(
            Exercise exercise
    ) {
        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put("id", exercise.getId());
        response.put(
                "gamesId",
                exercise.getGames().getId()
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
                "content",
                exercise.getContentJson()
        );

        return response;
    }
}