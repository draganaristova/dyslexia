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

    @GetMapping("/{gamesId}/{gamesType}/{pinNumber}/{taskNumber}")
    public ResponseEntity<?> getExercise(
            @PathVariable Long gamesId,
            @PathVariable GamesType gamesType,
            @PathVariable Integer pinNumber,
            @PathVariable Integer taskNumber,
            @RequestParam Long userId
    ) {

        try {
            if (gamesId == null ||
                    gamesType == null ||
                    pinNumber == null ||
                    taskNumber == null ||
                    userId == null) {

                return ResponseEntity.badRequest().body(Map.of("message", "Недостасуваат податоци."));
            }

            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Не постои корисникот."));
            }


            Integer age = user.getAge();
            if (age == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Корисникот нема внесено возраст."));
            }

            AgeGroup ageGroup = determineAgeGroup(age);

            Exercise exercise = exerciseRepository.findByGamesIdAndGamesTypeAndAgeGroupAndPinNumberAndTaskNumber(
                                    gamesId,
                                    gamesType,
                                    ageGroup,
                                    pinNumber,
                                    taskNumber
                            ).orElse(null);

            if (exercise == null) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("id", exercise.getId());
            response.put("gamesId", exercise.getGames().getId());
            response.put("gamesType", exercise.getGamesType().name());
            response.put("ageGroup", exercise.getAgeGroup().name());
            response.put("pinNumber", exercise.getPinNumber());
            response.put("taskNumber", exercise.getTaskNumber());
            response.put("content", exercise.getContentJson());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "Не може да се вчита задачата."));
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

            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Не постои корисникот."));
            }

            Integer age = user.getAge();

            if (age == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Корисникот нема внесено возраст."));
            }

            AgeGroup ageGroup = determineAgeGroup(age);

            List<Exercise> exercises = exerciseRepository.findByGamesIdAndGamesTypeAndAgeGroupAndPinNumber(
                                    gamesId,
                                    gamesType,
                                    ageGroup,
                                    pinNumber
                            );


            exercises.sort((a, b) -> Integer.compare(a.getTaskNumber(), b.getTaskNumber()));

            List<Map<String, Object>> result = exercises.stream().map(this::createResponse).toList();
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "Не може да се вчитаат задачите."));
        }
    }

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


    private Map<String, Object> createResponse(
            Exercise exercise
    ) {

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("id", exercise.getId());
        response.put("gamesId", exercise.getGames().getId());
        response.put("gamesType", exercise.getGamesType().name());
        response.put("ageGroup", exercise.getAgeGroup().name());
        response.put("pinNumber", exercise.getPinNumber());
        response.put("taskNumber", exercise.getTaskNumber());
        response.put("content", exercise.getContentJson());
        return response;
    }
}