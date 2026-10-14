package com.dyslexia.backend.controller;

import com.dyslexia.backend.model.AgeGroup;
import com.dyslexia.backend.model.Exercise;
import com.dyslexia.backend.model.GamesType;
import com.dyslexia.backend.model.User;
import com.dyslexia.backend.repository.ExerciseRepository;
import com.dyslexia.backend.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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

    /*
     * ==========================================================
     * GET ONE EXERCISE
     * ==========================================================
     *
     * URL:
     *
     * /api/exercises/{gamesId}/{gamesType}/{pinNumber}/{taskNumber}
     *
     * Example:
     *
     * /api/exercises/9/MISSING_LETTER/1/1?userId=2
     *
     * ВАЖНО:
     *
     * ageGroup НЕ го земаме од frontend.
     *
     * Го земаме age од User во database.
     *
     * Example:
     *
     * user.age = 5
     *      -> AGE_5_7
     *
     * user.age = 9
     *      -> _10
     *
     * user.age = 12
     *      -> AGE_10_15
     *
     * ==========================================================
     */

    @GetMapping("/{gamesId}/{gamesType}/{pinNumber}/{taskNumber}")
    public ResponseEntity<?> getExercise(
            @PathVariable Long gamesId,
            @PathVariable GamesType gamesType,
            @PathVariable Integer pinNumber,
            @PathVariable Integer taskNumber,
            @RequestParam Long userId
    ) {

        try {

            /*
             * --------------------------------------------------
             * VALIDATION
             * --------------------------------------------------
             */

            if (gamesId == null ||
                    gamesType == null ||
                    pinNumber == null ||
                    taskNumber == null ||
                    userId == null) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Недостасуваат податоци."
                        ));
            }

            /*
             * --------------------------------------------------
             * FIND USER
             * --------------------------------------------------
             */

            User user =
                    userRepository
                            .findById(userId)
                            .orElse(null);

            if (user == null) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Не постои корисникот."
                        ));
            }

            /*
             * --------------------------------------------------
             * GET USER AGE
             * --------------------------------------------------
             */

            Integer age = user.getAge();

            if (age == null) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Корисникот нема внесено возраст."
                        ));
            }

            /*
             * --------------------------------------------------
             * DETERMINE AGE GROUP
             * --------------------------------------------------
             */

            AgeGroup ageGroup =
                    determineAgeGroup(age);

            /*
             * --------------------------------------------------
             * DEBUG
             * --------------------------------------------------
             *
             * Ова е корисно додека тестираме.
             */

            /*
             * --------------------------------------------------
             * FIND EXACT EXERCISE
             * --------------------------------------------------
             *
             * Клучниот дел е што тука го користиме:
             *
             * gamesId
             * gamesType
             * ageGroup
             * pinNumber
             * taskNumber
             *
             * Значи НЕ може да ја земе задачата за друга возраст.
             */

            Exercise exercise =
                    exerciseRepository
                            .findByGamesIdAndGamesTypeAndAgeGroupAndPinNumberAndTaskNumber(
                                    gamesId,
                                    gamesType,
                                    ageGroup,
                                    pinNumber,
                                    taskNumber
                            )
                            .orElse(null);

            /*
             * --------------------------------------------------
             * EXERCISE NOT FOUND
             * --------------------------------------------------
             */

            if (exercise == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            /*
             * --------------------------------------------------
             * RESPONSE
             * --------------------------------------------------
             */

            Map<String, Object> response =
                    new LinkedHashMap<>();

            response.put(
                    "id",
                    exercise.getId()
            );

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

            return ResponseEntity.ok(
                    response
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(Map.of(
                            "message",
                            "Не може да се вчита задачата."
                    ));
        }
    }


    /*
     * ==========================================================
     * GET ALL EXERCISES FOR ONE MISSION
     * ==========================================================
     *
     * Ова не е задолжително за ExercisePage,
     * но е корисно ако некогаш сакаш да ги земеш
     * сите 10 задачи одеднаш.
     *
     * ==========================================================
     */

    @GetMapping("/{gamesId}/{gamesType}/{pinNumber}")
    public ResponseEntity<?> getMissionExercises(
            @PathVariable Long gamesId,
            @PathVariable GamesType gamesType,
            @PathVariable Integer pinNumber,
            @RequestParam Long userId
    ) {

        try {

            /*
             * FIND USER
             */

            User user =
                    userRepository
                            .findById(userId)
                            .orElse(null);

            if (user == null) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Не постои корисникот."
                        ));
            }

            /*
             * USER AGE
             */

            Integer age = user.getAge();

            if (age == null) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Корисникот нема внесено возраст."
                        ));
            }

            /*
             * AGE GROUP
             */

            AgeGroup ageGroup =
                    determineAgeGroup(age);

            /*
             * FIND EXERCISES
             */

            List<Exercise> exercises =
                    exerciseRepository
                            .findByGamesIdAndGamesTypeAndAgeGroupAndPinNumber(
                                    gamesId,
                                    gamesType,
                                    ageGroup,
                                    pinNumber
                            );

            /*
             * SORT BY TASK NUMBER
             */

            exercises.sort(
                    (a, b) ->
                            Integer.compare(
                                    a.getTaskNumber(),
                                    b.getTaskNumber()
                            )
            );

            /*
             * RESPONSE
             */

            List<Map<String, Object>> result =
                    exercises.stream()
                            .map(this::createResponse)
                            .toList();

            return ResponseEntity.ok(
                    result
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(Map.of(
                            "message",
                            "Не може да се вчитаат задачите."
                    ));
        }
    }


    /*
     * ==========================================================
     * AGE -> AGE GROUP
     * ==========================================================
     *
     * ОВА Е НАЈВАЖНИОТ ДЕЛ.
     *
     * 5, 6, 7  -> AGE_5_7
     * 8, 9, 10 -> AGE_8_10
     * 11-15    -> AGE_10_15
     *
     * ==========================================================
     */

    private AgeGroup determineAgeGroup(
            Integer age
    ) {

        if (age <= 7) {

            return AgeGroup.AGE_5_7;

        } else if (age <= 10) {

            return AgeGroup.AGE_8_10;

        } else {

            return AgeGroup.AGE_10_15;
        }
    }


    /*
     * ==========================================================
     * RESPONSE HELPER
     * ==========================================================
     */

    private Map<String, Object> createResponse(
            Exercise exercise
    ) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "id",
                exercise.getId()
        );

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