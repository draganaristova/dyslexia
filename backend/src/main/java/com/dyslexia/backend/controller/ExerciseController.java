package com.dyslexia.backend.controller;

import com.dyslexia.backend.model.AgeGroup;
import com.dyslexia.backend.model.Exercise;
import com.dyslexia.backend.model.GamesType;
import com.dyslexia.backend.model.User;
import com.dyslexia.backend.repository.ExerciseRepository;
import com.dyslexia.backend.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;

    public ExerciseController(
            ExerciseRepository exerciseRepository,
            UserRepository userRepository
    ) {
        this.exerciseRepository = exerciseRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/{gamesId}/{gamesType}/{pinNumber}/{taskNumber}")
    public ResponseEntity<?> getExercise(
            @PathVariable Long gamesId,
            @PathVariable String gamesType,
            @PathVariable Integer pinNumber,
            @PathVariable Integer taskNumber,
            @RequestParam Long userId
    ) {

        try {
            Optional<User> userOptional = userRepository.findById(userId);

            if (userOptional.isEmpty()) {
                return ResponseEntity.status(404)
                        .body(Map.of(
                                "message",
                                "Не постои корисникот."
                        ));
            }

            User user = userOptional.get();

            GamesType type;

            try {
                type = GamesType.valueOf(gamesType.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Непознат тип на игра."
                        ));
            }

            AgeGroup ageGroup = resolveAgeGroup(user);

            Optional<Exercise> exerciseOptional =
                    exerciseRepository
                            .findByGamesIdAndGamesTypeAndAgeGroupAndPinNumberAndTaskNumber(
                                    gamesId,
                                    type,
                                    ageGroup,
                                    pinNumber,
                                    taskNumber
                            );

            if (exerciseOptional.isEmpty()) {
                return ResponseEntity.status(404)
                        .body(Map.of(
                                "message",
                                "Не постои задачата.",
                                "gamesId",
                                gamesId,
                                "gamesType",
                                type.name(),
                                "ageGroup",
                                ageGroup.name(),
                                "pinNumber",
                                pinNumber,
                                "taskNumber",
                                taskNumber
                        ));
            }

            Exercise exercise = exerciseOptional.get();

            Map<String, Object> response = new LinkedHashMap<>();

            response.put("id", exercise.getId());
            response.put("gamesId", exercise.getGames().getId());
            response.put("gameName", exercise.getGames().getName());
            response.put("gamesType", exercise.getGamesType().name());
            response.put("ageGroup", exercise.getAgeGroup().name());
            response.put("pinNumber", exercise.getPinNumber());
            response.put("taskNumber", exercise.getTaskNumber());
            response.put("levelNumber", getLevelNumber(pinNumber));
            response.put("content", exercise.getContentJson());

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "message",
                            "Грешка при вчитување на задачата."
                    ));
        }
    }

    @GetMapping("/{gamesId}/{gamesType}/{pinNumber}")
    public ResponseEntity<?> getExercises(
            @PathVariable Long gamesId,
            @PathVariable String gamesType,
            @PathVariable Integer pinNumber,
            @RequestParam Long userId
    ) {

        try {

            Optional<User> userOptional =
                    userRepository.findById(userId);

            if (userOptional.isEmpty()) {
                return ResponseEntity.status(404)
                        .body(Map.of(
                                "message",
                                "Не постои корисникот."
                        ));
            }

            GamesType type =
                    GamesType.valueOf(gamesType.toUpperCase());

            AgeGroup ageGroup =
                    resolveAgeGroup(userOptional.get());

            List<Exercise> exercises =
                    exerciseRepository
                            .findByGamesIdAndGamesTypeAndAgeGroupAndPinNumberOrderByTaskNumberAsc(
                                    gamesId,
                                    type,
                                    ageGroup,
                                    pinNumber
                            );

            List<Map<String, Object>> result =
                    new ArrayList<>();

            for (Exercise exercise : exercises) {

                Map<String, Object> item =
                        new LinkedHashMap<>();

                item.put("id", exercise.getId());
                item.put("gamesId", exercise.getGames().getId());
                item.put("gameName", exercise.getGames().getName());
                item.put("gamesType", exercise.getGamesType().name());
                item.put("ageGroup", exercise.getAgeGroup().name());
                item.put("pinNumber", exercise.getPinNumber());
                item.put("taskNumber", exercise.getTaskNumber());
                item.put("levelNumber", getLevelNumber(pinNumber));
                item.put("content", exercise.getContentJson());

                result.add(item);
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Не може да се вчитаат задачите."
                    ));
        }
    }

    private AgeGroup resolveAgeGroup(User user) {

        Integer age = user.getAge();

        if (age == null || age <= 7) {
            return AgeGroup.AGE_5_7;
        }

        if (age <= 10) {
            return AgeGroup.AGE_7_10;
        }

        return AgeGroup.AGE_10_15;
    }

    private int getLevelNumber(Integer pinNumber) {

        if (pinNumber == null || pinNumber <= 1) {
            return 1;
        }

        if (pinNumber == 2) {
            return 2;
        }

        return 3;
    }
}