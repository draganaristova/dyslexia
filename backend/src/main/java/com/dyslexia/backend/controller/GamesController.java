package com.dyslexia.backend.controller;
import com.dyslexia.backend.model.ExerciseProgress;
import com.dyslexia.backend.model.Games;
import com.dyslexia.backend.model.GamesType;
import com.dyslexia.backend.repository.ExerciseProgressRepository;
import com.dyslexia.backend.repository.GameRepository;
import com.dyslexia.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/games")
public class GamesController {

    private final GameRepository gameRepository;
    private final ExerciseProgressRepository progressRepository;
    private final UserRepository userRepository;
    private static final int TOTAL_GAMES_PER_WORLD = 6;

    public GamesController(
            GameRepository gameRepository,
            ExerciseProgressRepository progressRepository,
            UserRepository userRepository
    ) {
        this.gameRepository = gameRepository;
        this.progressRepository = progressRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getGames(
            @PathVariable Long userId
    ) {

        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                            "message",
                            "Корисникот не постои."
                    ));
        }

        List<Games> games = gameRepository.findAllByOrderByOrderIndexAsc();

        List<ExerciseProgress> progress = progressRepository.findByUserIdOrderByCompletedAtDesc(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Games game : games) {

            List<ExerciseProgress> gameProgress = progress.stream().filter(p ->
                                    p.getExercise() != null &&
                                    p.getExercise().getGames() != null &&
                                    Objects.equals(p.getExercise().getGames().getId(), game.getId())
                            ).toList();

            Set<Integer> completedLevels = new HashSet<>();
            for (ExerciseProgress p : gameProgress) {

                if (
                        Boolean.TRUE.equals(p.getCompleted()) &&
                        Boolean.TRUE.equals(p.getCorrect())
                ) {

                    completedLevels.add(p.getExercise().getPinNumber());
                }
            }

            int levelsDone = completedLevels.size();
            String status;

            if (levelsDone >= game.getTotalLevels()) {
                status = "completed";

            } else if (levelsDone > 0) {
                status = "in_progress";

            } else {
                status = "not_started";
            }

            GamesType type = getGamesType(game.getOrderIndex());
            result.add(createGameResponse(
                            game,
                            type,
                            levelsDone,
                            status
                    )
            );
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/world/{worldNumber}")
    public ResponseEntity<?> getWorldGames(
            @PathVariable Integer worldNumber,
            @RequestParam(required = false) Long userId
    ) {

        List<Games> games = gameRepository.findByWorldNumberOrderByOrderIndexAsc(worldNumber);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Games game : games) {

            GamesType type = getGamesType(game.getOrderIndex());
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("id", game.getId());
            response.put("name", game.getName());
            response.put("color", game.getColor());
            response.put("imageUrl", game.getImageUrl());
            response.put("worldNumber", game.getWorldNumber());
            response.put("orderIndex", game.getOrderIndex());
            response.put("totalLevels", game.getTotalLevels());
            response.put("gamesType", type != null ? type.name() : null);
            result.add(response);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/world/{worldNumber}/access")
    public ResponseEntity<?> getWorldAccess(
            @PathVariable Integer worldNumber,
            @RequestParam Long userId
    ) {

        if (!userRepository.existsById(userId)) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                            "message",
                            "Корисникот не постои."
                    ));
        }

        if (worldNumber == null ||
                worldNumber < 1 ||
                worldNumber > 6) {

            return ResponseEntity.badRequest().body(Map.of(
                            "message",
                            "Невалиден број на свет."
                    ));
        }

        if (worldNumber == 1) {

            return ResponseEntity.ok(Map.of(
                            "worldNumber", 1,
                            "unlocked", true,
                            "completedPreviousWorld", true
                    )
            );
        }


        int previousWorld = worldNumber - 1;
        List<Games> previousGames = gameRepository.findByWorldNumberOrderByOrderIndexAsc(previousWorld);

        if (previousGames.size() < TOTAL_GAMES_PER_WORLD) {

            return ResponseEntity.ok(Map.of(
                            "worldNumber", worldNumber,
                            "unlocked", false,
                            "completedPreviousWorld", false,
                            "completedGames", 0,
                            "requiredGames",
                            TOTAL_GAMES_PER_WORLD
                    )
            );
        }

        List<ExerciseProgress> progress = progressRepository.findByUserIdOrderByCompletedAtDesc(userId);
        var user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                            "message",
                            "Корисникот не постои."
                    ));
        }

        int currentLevel = levelFromAge(user.getAge());
        int completedGames = 0;

        for (Games game : previousGames) {
            boolean passed = isGameLevelPassed(
                            game,
                            currentLevel,
                            progress
                    );

            if (passed) {
                completedGames++;
            }
        }

        boolean unlocked = completedGames >= TOTAL_GAMES_PER_WORLD;

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("worldNumber", worldNumber);
        response.put("unlocked", unlocked);
        response.put("completedPreviousWorld",unlocked );
        response.put("previousWorld", previousWorld);
        response.put("completedGames",completedGames);
        response.put("requiredGames",TOTAL_GAMES_PER_WORLD);
        response.put("currentLevel",currentLevel);
        return ResponseEntity.ok(response);
    }

    private boolean isGameLevelPassed(
            Games game,
            int level,
            List<ExerciseProgress> progress
    ) {

        Map<Integer, ExerciseProgress> latestByTask = new HashMap<>();

        for (ExerciseProgress item : progress) {
            if (item.getExercise() == null) {
                continue;
            }

            if (item.getExercise().getGames() == null) {
                continue;
            }

            if (!Objects.equals(
                    item.getExercise().getGames().getId(), game.getId()
            )) {
                continue;
            }

            if (!Objects.equals(
                    item.getExercise().getPinNumber(), level
            )) {
                continue;
            }

            Integer taskNumber = item.getExercise().getTaskNumber();

            if (taskNumber == null) {
                continue;
            }

            latestByTask.putIfAbsent(taskNumber, item);
        }

        if (latestByTask.size() < 10) {
            return false;
        }

        int score = 0;

        for (ExerciseProgress item :
                latestByTask.values()) {

            if (
                Boolean.TRUE.equals(item.getCompleted()) && Boolean.TRUE.equals(item.getCorrect())
            ) {
                score++;
            }
        }

        return score >= 8;
    }

    private int levelFromAge(
            Integer age
    ) {

        if (age == null) {
            return 1;
        }
        if (age <= 7) {
            return 1;
        }
        if (age <= 10) {
            return 2;
        }
        return 3;
    }


    private Map<String, Object> createGameResponse(
            Games game,
            GamesType type,
            int levelsDone,
            String status
    ) {

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("id", game.getId());
        response.put("name", game.getName());
        response.put("color", game.getColor());
        response.put("imageUrl", game.getImageUrl());
        response.put("worldNumber", game.getWorldNumber());
        response.put("orderIndex", game.getOrderIndex());
        response.put("totalLevels", game.getTotalLevels());
        response.put("gamesType",type != null ? type.name() : null);
        response.put("levelsDone", levelsDone);
        response.put("status", status);
        return response;
    }


    private GamesType getGamesType(
            Integer orderIndex
    ) {

        if (orderIndex == null) {
            return null;
        }

        return switch (orderIndex) {
            case 1 -> GamesType.MEMORY;
            case 2 -> GamesType.WORD_BUILDING;
            case 3 -> GamesType.MISSING_LETTER;
            case 4 -> GamesType.RHYMES;
            case 5 -> GamesType.SYLLABLES;
            case 6 -> GamesType.SOUND_MANIPULATION;
            default -> null;
        };
    }
}
