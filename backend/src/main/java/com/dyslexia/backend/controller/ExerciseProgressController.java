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
import com.dyslexia.backend.service.MissionRunService;
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

    private final ExerciseProgressRepository progressRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;
    private final ExerciseAttemptRepository attemptRepository;
    private final MissionRunService missionRunService;

    public ExerciseProgressController(
            ExerciseProgressRepository progressRepository,
            ExerciseRepository exerciseRepository,
            UserRepository userRepository,
            ExerciseAttemptRepository attemptRepository,
            MissionRunService missionRunService
    ) {
        this.progressRepository = progressRepository;
        this.exerciseRepository = exerciseRepository;
        this.userRepository = userRepository;
        this.attemptRepository = attemptRepository;
        this.missionRunService = missionRunService;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> saveProgress(@RequestBody Map<String, Object> body) {
        try {
            Long userId = getLong(body.get("userId"));
            Long exerciseId = getLong(body.get("exerciseId"));
            String missionRunId = getString(body.get("missionRunId"));
            Integer score = getInteger(body.get("score"));
            Boolean correct = getBoolean(body.get("correct"));
            Boolean timedOut = getBoolean(body.get("timedOut"));
            String question = getString(body.get("question"));
            String selectedAnswer = getString(body.get("selectedAnswer"));
            String correctAnswer = getString(body.get("correctAnswer"));

            if (userId == null || exerciseId == null) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "userId и exerciseId се задолжителни.")
                );
            }

            try {
                UUID.fromString(missionRunId);
            } catch (IllegalArgumentException exception) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Недостасува валиден идентификатор за обидот.")
                );
            }

            if (score == null) score = Boolean.TRUE.equals(correct) ? 1 : 0;
            score = Math.max(0, Math.min(score, 1));
            if (correct == null) correct = score == 1;
            if (timedOut == null) timedOut = false;

            User user = userRepository.findById(userId).orElse(null);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        Map.of("message", "Корисникот не постои.")
                );
            }

            Exercise exercise = exerciseRepository.findById(exerciseId).orElse(null);

            if (exercise == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        Map.of("message", "Задачата не постои.")
                );
            }

            ExerciseProgress progress = progressRepository
                    .findByUserIdAndExerciseId(userId, exerciseId)
                    .orElse(null);

            if (progress == null) {
                progress = new ExerciseProgress();
                progress.setUser(user);
                progress.setExercise(exercise);
                progress.setAttempts(0);
            }

            progress.setAttempts(progress.getAttempts() + 1);
            progress.setScore(score);
            progress.setCorrect(correct);
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
            progress.setQuestion(question);
            progress.setSelectedAnswer(selectedAnswer);
            progress.setCorrectAnswer(correctAnswer);

            progress = progressRepository.save(progress);

            long previousAttempts = attemptRepository.countByUserIdAndExerciseId(userId, exerciseId);
            int attemptNumber = (int) previousAttempts + 1;

            ExerciseAttempt attempt = new ExerciseAttempt();
            attempt.setUser(user);
            attempt.setExercise(exercise);
            attempt.setAttemptNumber(attemptNumber);
            attempt.setMissionRunId(missionRunId);
            attempt.setScore(score);
            attempt.setCorrect(correct);
            attempt.setCompleted(true);
            attempt.setQuestion(question);
            attempt.setSelectedAnswer(selectedAnswer);
            attempt.setCorrectAnswer(correctAnswer);
            attempt.setTimedOut(timedOut);
            attempt.setAttemptedAt(LocalDateTime.now());

            attempt = attemptRepository.save(attempt);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("exerciseProgressId", progress.getId());
            response.put("attemptId", attempt.getId());
            response.put("attemptNumber", attemptNumber);
            response.put("missionRunId", missionRunId);
            response.put("exerciseId", exerciseId);
            response.put("question", question);
            response.put("selectedAnswer", selectedAnswer);
            response.put("correctAnswer", correctAnswer);
            response.put("correct", correct);
            response.put("timedOut", timedOut);
            response.put("attemptedAt", attempt.getAttemptedAt());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("message", "Грешка при зачувување на напредокот.")
            );
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserProgress(@PathVariable Long userId) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("message", "Корисникот не постои.")
            );
        }

        List<ExerciseProgress> list = progressRepository.findByUserIdOrderByCompletedAtDesc(userId);

        return ResponseEntity.ok(
                list.stream().map(this::createProgressResponse).toList()
        );
    }

    @GetMapping("/user/{userId}/attempts")
    public ResponseEntity<?> getUserAttempts(@PathVariable Long userId) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("message", "Корисникот не постои.")
            );
        }

        List<ExerciseAttempt> attempts = attemptRepository.findByUserIdOrderByAttemptedAtDesc(userId);

        return ResponseEntity.ok(
                attempts.stream().map(this::createAttemptResponse).toList()
        );
    }

    @GetMapping("/user/{userId}/summary")
    public ResponseEntity<?> getSummary(@PathVariable Long userId) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("message", "Корисникот не постои.")
            );
        }

        List<ExerciseProgress> progress = progressRepository.findByUserIdOrderByCompletedAtDesc(userId);

        Map<String, Games> gamesByLevel = new LinkedHashMap<>();
        Map<String, Exercise> firstExerciseByLevel = new LinkedHashMap<>();

        for (ExerciseProgress item : progress) {
            Exercise exercise = item.getExercise();

            if (exercise == null || exercise.getGames() == null) continue;

            String key = exercise.getGames().getId() + ":" + exercise.getPinNumber();

            gamesByLevel.putIfAbsent(key, exercise.getGames());
            firstExerciseByLevel.putIfAbsent(key, exercise);
        }

        Map<String, MissionRunService.MissionStatus> statuses = missionRunService.statusesForUser(userId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (String key : gamesByLevel.keySet()) {
            Games game = gamesByLevel.get(key);
            Exercise exercise = firstExerciseByLevel.get(key);

            MissionRunService.MissionStatus status = missionRunService.status(
                    statuses, game.getId(), exercise.getPinNumber()
            );

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("gamesId", game.getId());
            item.put("gameName", game.getName());
            item.put("gamesType", exercise.getGamesType().name());
            item.put("pinNumber", exercise.getPinNumber());
            item.put("completedTasks", status.completedTasks());
            item.put("totalTasks", TOTAL_TASKS);
            item.put("score", status.score());
            item.put("passed", status.passed());
            item.put("completed", status.completed());

            result.add(item);
        }

        result.sort(
                Comparator.comparing(
                        (Map<String, Object> item) -> ((Number) item.get("gamesId")).longValue()
                ).thenComparing(
                        item -> ((Number) item.get("pinNumber")).intValue()
                )
        );

        return ResponseEntity.ok(result);
    }

    private Map<String, Object> createProgressResponse(ExerciseProgress progress) {
        Exercise exercise = progress.getExercise();
        Games game = exercise.getGames();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("exerciseProgressId", progress.getId());
        response.put("exerciseId", exercise.getId());
        response.put("gamesId", game.getId());
        response.put("gameName", game.getName());
        response.put("gamesType", exercise.getGamesType().name());
        response.put("ageGroup", exercise.getAgeGroup().name());
        response.put("pinNumber", exercise.getPinNumber());
        response.put("taskNumber", exercise.getTaskNumber());
        response.put("score", progress.getScore());
        response.put("attempts", progress.getAttempts());
        response.put("correct", progress.getCorrect());
        response.put("completed", progress.getCompleted());
        response.put("completedAt", progress.getCompletedAt());
        response.put("question", progress.getQuestion());
        response.put("selectedAnswer", progress.getSelectedAnswer());
        response.put("correctAnswer", progress.getCorrectAnswer());

        return response;
    }

    private Map<String, Object> createAttemptResponse(ExerciseAttempt attempt) {
        Exercise exercise = attempt.getExercise();
        Games game = exercise.getGames();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("attemptId", attempt.getId());
        response.put("attemptNumber", attempt.getAttemptNumber());
        response.put("missionRunId", attempt.getMissionRunId());
        response.put("exerciseId", exercise.getId());
        response.put("gamesId", game.getId());
        response.put("gameName", game.getName());
        response.put("gamesType", exercise.getGamesType().name());
        response.put("pinNumber", exercise.getPinNumber());
        response.put("taskNumber", exercise.getTaskNumber());
        response.put("question", attempt.getQuestion());
        response.put("selectedAnswer", attempt.getSelectedAnswer());
        response.put("correctAnswer", attempt.getCorrectAnswer());
        response.put("correct", attempt.getCorrect());
        response.put("score", attempt.getScore());
        response.put("timedOut", attempt.getTimedOut());
        response.put("attemptedAt", attempt.getAttemptedAt());

        return response;
    }

    private Long getLong(Object value) {
        if (value == null) return null;
        if (value instanceof Number number) return number.longValue();
        return Long.parseLong(value.toString());
    }

    private Integer getInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Number number) return number.intValue();
        return Integer.parseInt(value.toString());
    }

    private Boolean getBoolean(Object value) {
        if (value == null) return null;
        if (value instanceof Boolean bool) return bool;
        return Boolean.parseBoolean(value.toString());
    }

    private String getString(Object value) {
        return value == null ? "" : value.toString();
    }
}
