package com.dyslexia.backend.controller;

import com.dyslexia.backend.model.Exercise;
import com.dyslexia.backend.model.ExerciseAttempt;
import com.dyslexia.backend.model.ExerciseProgress;
import com.dyslexia.backend.model.Games;
import com.dyslexia.backend.model.User;
import com.dyslexia.backend.repository.ExerciseAttemptRepository;
import com.dyslexia.backend.repository.ExerciseProgressRepository;
import com.dyslexia.backend.repository.ExerciseRepository;
import com.dyslexia.backend.repository.UserRepository;

import jakarta.transaction.Transactional;

import org.springframework.http.HttpStatus;
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
    private final ExerciseAttemptRepository attemptRepository;

    public ExerciseProgressController(
            ExerciseProgressRepository progressRepository,
            ExerciseRepository exerciseRepository,
            UserRepository userRepository,
            ExerciseAttemptRepository attemptRepository
    ) {
        this.progressRepository = progressRepository;
        this.exerciseRepository = exerciseRepository;
        this.userRepository = userRepository;
        this.attemptRepository = attemptRepository;
    }

    /*
     * ==========================================================
     * SAVE ONE TASK ATTEMPT
     * ==========================================================
     */

    @PostMapping
    @Transactional
    public ResponseEntity<?> saveProgress(
            @RequestBody Map<String, Object> body
    ) {

        try {

            Long userId =
                    getLong(body.get("userId"));

            Long exerciseId =
                    getLong(body.get("exerciseId"));

            Integer score =
                    getInteger(body.get("score"));

            Boolean correct =
                    getBoolean(body.get("correct"));

            Boolean timedOut =
                    getBoolean(body.get("timedOut"));

            String question =
                    getString(body.get("question"));

            String selectedAnswer =
                    getString(body.get("selectedAnswer"));

            String correctAnswer =
                    getString(body.get("correctAnswer"));

            if (userId == null || exerciseId == null) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "userId и exerciseId се задолжителни."
                        ));
            }

            if (score == null) {
                score = Boolean.TRUE.equals(correct) ? 1 : 0;
            }

            score =
                    Math.max(
                            0,
                            Math.min(
                                    score,
                                    1
                            )
                    );

            if (correct == null) {
                correct = score == 1;
            }

            if (timedOut == null) {
                timedOut = false;
            }

            User user =
                    userRepository
                            .findById(userId)
                            .orElse(null);

            if (user == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "message",
                                "Корисникот не постои."
                        ));
            }

            Exercise exercise =
                    exerciseRepository
                            .findById(exerciseId)
                            .orElse(null);

            if (exercise == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "message",
                                "Задачата не постои."
                        ));
            }

            /*
             * ==================================================
             * CURRENT PROGRESS
             * ==================================================
             */

            ExerciseProgress progress =
                    progressRepository
                            .findByUserIdAndExerciseId(
                                    userId,
                                    exerciseId
                            )
                            .orElse(null);

            if (progress == null) {

                progress =
                        new ExerciseProgress();

                progress.setUser(user);
                progress.setExercise(exercise);
                progress.setAttempts(0);
            }

            progress.setAttempts(
                    progress.getAttempts() + 1
            );

            /*
             * Current state = последниот обид.
             */
            progress.setScore(score);
            progress.setCorrect(correct);

            /*
             * Задачата е завршена и ако одговорот е погрешен.
             * Така детето може да продолжи на следната задача.
             */
            progress.setCompleted(true);

            progress.setCompletedAt(
                    LocalDateTime.now()
            );

            progress.setQuestion(question);
            progress.setSelectedAnswer(selectedAnswer);
            progress.setCorrectAnswer(correctAnswer);

            progress =
                    progressRepository.save(progress);

            /*
             * ==================================================
             * ATTEMPT HISTORY
             * ==================================================
             */

            long previousAttempts =
                    attemptRepository
                            .countByUserIdAndExerciseId(
                                    userId,
                                    exerciseId
                            );

            int attemptNumber =
                    (int) previousAttempts + 1;

            ExerciseAttempt attempt =
                    new ExerciseAttempt();

            attempt.setUser(user);
            attempt.setExercise(exercise);
            attempt.setAttemptNumber(attemptNumber);
            attempt.setScore(score);
            attempt.setCorrect(correct);
            attempt.setCompleted(true);
            attempt.setQuestion(question);
            attempt.setSelectedAnswer(selectedAnswer);
            attempt.setCorrectAnswer(correctAnswer);
            attempt.setTimedOut(timedOut);
            attempt.setAttemptedAt(
                    LocalDateTime.now()
            );

            attempt =
                    attemptRepository.save(attempt);

            Map<String, Object> response =
                    new LinkedHashMap<>();

            response.put(
                    "exerciseProgressId",
                    progress.getId()
            );

            response.put(
                    "attemptId",
                    attempt.getId()
            );

            response.put(
                    "attemptNumber",
                    attemptNumber
            );

            response.put(
                    "exerciseId",
                    exerciseId
            );

            response.put(
                    "question",
                    question
            );

            response.put(
                    "selectedAnswer",
                    selectedAnswer
            );

            response.put(
                    "correctAnswer",
                    correctAnswer
            );

            response.put(
                    "correct",
                    correct
            );

            response.put(
                    "timedOut",
                    timedOut
            );

            response.put(
                    "attemptedAt",
                    attempt.getAttemptedAt()
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Грешка при зачувување на напредокот.",
                            "error",
                            e.getMessage()
                    ));
        }
    }

    /*
     * ==========================================================
     * CURRENT PROGRESS
     * ==========================================================
     */

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserProgress(
            @PathVariable Long userId
    ) {

        if (!userRepository.existsById(userId)) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message",
                            "Корисникот не постои."
                    ));
        }

        List<ExerciseProgress> list =
                progressRepository
                        .findByUserIdOrderByCompletedAtDesc(
                                userId
                        );

        return ResponseEntity.ok(
                list.stream()
                        .map(this::createProgressResponse)
                        .toList()
        );
    }

    /*
     * ==========================================================
     * ALL ATTEMPTS
     * ==========================================================
     */

    @GetMapping("/user/{userId}/attempts")
    public ResponseEntity<?> getUserAttempts(
            @PathVariable Long userId
    ) {

        if (!userRepository.existsById(userId)) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message",
                            "Корисникот не постои."
                    ));
        }

        List<ExerciseAttempt> attempts =
                attemptRepository
                        .findByUserIdOrderByAttemptedAtDesc(
                                userId
                        );

        return ResponseEntity.ok(
                attempts.stream()
                        .map(this::createAttemptResponse)
                        .toList()
        );
    }

    /*
     * ==========================================================
     * SUMMARY
     * ==========================================================
     */

    @GetMapping("/user/{userId}/summary")
    public ResponseEntity<?> getSummary(
            @PathVariable Long userId
    ) {

        if (!userRepository.existsById(userId)) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message",
                            "Корисникот не постои."
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

            if (exercise == null ||
                    exercise.getGames() == null) {
                continue;
            }

            String key =
                    exercise.getGames().getId()
                            + "-"
                            + exercise.getGamesType().name()
                            + "-"
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

        for (List<ExerciseProgress> tasks :
                grouped.values()) {

            if (tasks.isEmpty()) {
                continue;
            }

            Exercise firstExercise =
                    tasks.get(0).getExercise();

            Games game =
                    firstExercise.getGames();

            Set<Integer> completedTasks =
                    new HashSet<>();

            int score = 0;

            for (ExerciseProgress task : tasks) {

                if (Boolean.TRUE.equals(
                        task.getCompleted()
                )) {

                    completedTasks.add(
                            task.getExercise()
                                    .getTaskNumber()
                    );
                }

                if (Boolean.TRUE.equals(
                        task.getCorrect()
                )) {

                    score++;
                }
            }

            int completedCount =
                    completedTasks.size();

            boolean completed =
                    completedCount >= TOTAL_TASKS;

            boolean passed =
                    completed &&
                    score >= PASSING_SCORE;

            Map<String, Object> item =
                    new LinkedHashMap<>();

            item.put(
                    "gamesId",
                    game.getId()
            );

            item.put(
                    "gameName",
                    game.getName()
            );

            item.put(
                    "gamesType",
                    firstExercise
                            .getGamesType()
                            .name()
            );

            item.put(
                    "pinNumber",
                    firstExercise.getPinNumber()
            );

            item.put(
                    "completedTasks",
                    completedCount
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

        result.sort(
                Comparator
                        .comparing(
                                (Map<String, Object> m) ->
                                        ((Number)
                                                m.get("gamesId"))
                                                .longValue()
                        )
                        .thenComparing(
                                m ->
                                        ((Number)
                                                m.get("pinNumber"))
                                                .intValue()
                        )
        );

        return ResponseEntity.ok(result);
    }

    /*
     * ==========================================================
     * PROGRESS RESPONSE
     * ==========================================================
     */

    private Map<String, Object> createProgressResponse(
            ExerciseProgress progress
    ) {

        Exercise exercise =
                progress.getExercise();

        Games game =
                exercise.getGames();

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
                game.getId()
        );

        response.put(
                "gameName",
                game.getName()
        );

        response.put(
                "gamesType",
                exercise
                        .getGamesType()
                        .name()
        );

        response.put(
                "ageGroup",
                exercise
                        .getAgeGroup()
                        .name()
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

        response.put(
                "question",
                progress.getQuestion()
        );

        response.put(
                "selectedAnswer",
                progress.getSelectedAnswer()
        );

        response.put(
                "correctAnswer",
                progress.getCorrectAnswer()
        );

        return response;
    }

    /*
     * ==========================================================
     * ATTEMPT RESPONSE
     * ==========================================================
     */

    private Map<String, Object> createAttemptResponse(
            ExerciseAttempt attempt
    ) {

        Exercise exercise =
                attempt.getExercise();

        Games game =
                exercise.getGames();

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "attemptId",
                attempt.getId()
        );

        response.put(
                "attemptNumber",
                attempt.getAttemptNumber()
        );

        response.put(
                "exerciseId",
                exercise.getId()
        );

        response.put(
                "gamesId",
                game.getId()
        );

        response.put(
                "gameName",
                game.getName()
        );

        response.put(
                "gamesType",
                exercise
                        .getGamesType()
                        .name()
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
                "question",
                attempt.getQuestion()
        );

        response.put(
                "selectedAnswer",
                attempt.getSelectedAnswer()
        );

        response.put(
                "correctAnswer",
                attempt.getCorrectAnswer()
        );

        response.put(
                "correct",
                attempt.getCorrect()
        );

        response.put(
                "score",
                attempt.getScore()
        );

        response.put(
                "timedOut",
                attempt.getTimedOut()
        );

        response.put(
                "attemptedAt",
                attempt.getAttemptedAt()
        );

        return response;
    }

    /*
     * ==========================================================
     * PARSERS
     * ==========================================================
     */

    private Long getLong(Object value) {

        if (value == null) {
            return null;
        }

        if (value instanceof Number number) {
            return number.longValue();
        }

        return Long.parseLong(
                value.toString()
        );
    }

    private Integer getInteger(Object value) {

        if (value == null) {
            return null;
        }

        if (value instanceof Number number) {
            return number.intValue();
        }

        return Integer.parseInt(
                value.toString()
        );
    }

    private Boolean getBoolean(Object value) {

        if (value == null) {
            return null;
        }

        if (value instanceof Boolean bool) {
            return bool;
        }

        return Boolean.parseBoolean(
                value.toString()
        );
    }

    private String getString(Object value) {

        if (value == null) {
            return "";
        }

        return value.toString();
    }
}