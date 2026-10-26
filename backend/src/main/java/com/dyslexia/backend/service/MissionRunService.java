
package com.dyslexia.backend.service;

import com.dyslexia.backend.model.Exercise;
import com.dyslexia.backend.model.ExerciseAttempt;
import com.dyslexia.backend.repository.ExerciseAttemptRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class MissionRunService {

    private final ExerciseAttemptRepository attemptRepository;

    public MissionRunService(ExerciseAttemptRepository attemptRepository) {
        this.attemptRepository = attemptRepository;
    }

    public record MissionStatus(int completedTasks, int score, boolean passed, boolean completed) {}

    private static final class Run {
        private final Long gameId;
        private final int pinNumber;
        private final Map<Integer, ExerciseAttempt> tasks = new HashMap<>();
        private LocalDateTime lastUpdated = LocalDateTime.MIN;

        private Run(Long gameId, int pinNumber) {
            this.gameId = gameId;
            this.pinNumber = pinNumber;
        }

        private void add(ExerciseAttempt attempt) {
            int task = attempt.getExercise().getTaskNumber();
            if (task < 1 || task > GameProgressService.TOTAL_TASKS) return;

            ExerciseAttempt previous = tasks.get(task);
            if (previous == null || attempt.getId() > previous.getId()) {
                tasks.put(task, attempt);
            }

            if (attempt.getAttemptedAt() != null && attempt.getAttemptedAt().isAfter(lastUpdated)) {
                lastUpdated = attempt.getAttemptedAt();
            }
        }

        private int score() {
            return (int) tasks.values().stream()
                    .filter(a -> Boolean.TRUE.equals(a.getCorrect()))
                    .count();
        }

        private boolean completed() {
            return tasks.size() == GameProgressService.TOTAL_TASKS &&
                    tasks.values().stream().allMatch(a -> Boolean.TRUE.equals(a.getCompleted()));
        }
    }

    public Map<String, MissionStatus> statusesForUser(Long userId) {
        List<ExerciseAttempt> attempts = attemptRepository.findByUserIdOrderByAttemptedAtDesc(userId);
        Map<String, Run> runs = new LinkedHashMap<>();

        for (ExerciseAttempt attempt : attempts) {
            Exercise exercise = attempt.getExercise();

            if (exercise == null || exercise.getGames() == null || attempt.getMissionRunId() == null) {
                continue;
            }

            String key = exercise.getGames().getId() + ":" + exercise.getPinNumber() + ":" + attempt.getMissionRunId();

            Run run = runs.computeIfAbsent(
                    key,
                    ignored -> new Run(exercise.getGames().getId(), exercise.getPinNumber())
            );

            run.add(attempt);
        }

        Map<String, List<Run>> grouped = new LinkedHashMap<>();

        for (Run run : runs.values()) {
            grouped.computeIfAbsent(key(run.gameId, run.pinNumber), ignored -> new ArrayList<>()).add(run);
        }

        Map<String, MissionStatus> result = new LinkedHashMap<>();

        for (Map.Entry<String, List<Run>> entry : grouped.entrySet()) {
            List<Run> history = entry.getValue();

            Run latest = history.stream()
                    .max(Comparator.comparing(r -> r.lastUpdated))
                    .orElseThrow();

            int bestPassedScore = history.stream()
                    .filter(Run::completed)
                    .mapToInt(Run::score)
                    .filter(score -> score >= GameProgressService.PASSING_SCORE)
                    .max()
                    .orElse(-1);

            boolean passed = bestPassedScore >= GameProgressService.PASSING_SCORE;

            result.put(
                    entry.getKey(),
                    new MissionStatus(
                            passed ? GameProgressService.TOTAL_TASKS : latest.tasks.size(),
                            passed ? bestPassedScore : latest.score(),
                            passed,
                            passed || latest.completed()
                    )
            );
        }

        return result;
    }

    public MissionStatus status(Map<String, MissionStatus> statuses, Long gameId, int pinNumber) {
        return statuses.getOrDefault(
                key(gameId, pinNumber),
                new MissionStatus(0, 0, false, false)
        );
    }

    private String key(Long gameId, int pinNumber) {
        return gameId + ":" + pinNumber;
    }
}
