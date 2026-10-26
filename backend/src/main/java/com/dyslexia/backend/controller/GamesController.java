package com.dyslexia.backend.controller;
import com.dyslexia.backend.model.ExerciseProgress;
import com.dyslexia.backend.model.Games;
import com.dyslexia.backend.model.GamesType;
import com.dyslexia.backend.model.User;
import com.dyslexia.backend.repository.GameRepository;
import com.dyslexia.backend.repository.UserRepository;
import com.dyslexia.backend.service.GameProgressService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/games")
public class GamesController {

    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final GameProgressService progressService;

    public GamesController(
            GameRepository gameRepository,
            UserRepository userRepository,
            GameProgressService progressService
    ) {
        this.gameRepository = gameRepository;
        this.userRepository = userRepository;
        this.progressService = progressService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getGames(
            @PathVariable Long userId
    ) {
        User user = userRepository
                .findById(userId)
                .orElse(null);

        if (user == null) {
            return userNotFound();
        }

        if (user.getAge() == null) {
            return missingAge();
        }

        List<Games> games = gameRepository
                .findAllByOrderByOrderIndexAsc();

        List<ExerciseProgress> progress =
                progressService.getProgress(userId);

        int currentLevel =
                progressService.levelFromAge(user.getAge());

        List<Map<String, Object>> result =
                new ArrayList<>();

        for (Games game : games) {
            int levelsDone = 0;

            for (int level = 1; level <= 3; level++) {
                if (progressService.isGameLevelPassed(
                        game,
                        level,
                        progress
                )) {
                    levelsDone++;
                }
            }

            boolean passed = progressService
                    .isGameLevelPassed(
                            game,
                            currentLevel,
                            progress
                    );

            boolean unlocked = progressService
                    .isGameUnlocked(
                            user,
                            game,
                            progress
                    );

            boolean started = progress.stream().anyMatch(
                    item ->
                            item.getExercise() != null &&
                            item.getExercise().getGames() != null &&
                            game.getId().equals(
                                    item.getExercise()
                                            .getGames()
                                            .getId()
                            ) &&
                            Integer.valueOf(currentLevel).equals(
                                    item.getExercise()
                                            .getPinNumber()
                            ) &&
                            item.getExercise().getAgeGroup() ==
                                    progressService.ageGroupFromAge(
                                            user.getAge()
                                    )
            );

            String status = passed
                    ? "completed"
                    : started
                        ? "in_progress"
                        : "not_started";

            Map<String, Object> response =
                    createGameResponse(game);

            response.put("levelsDone", levelsDone);
            response.put("status", status);
            response.put("passed", passed);
            response.put("unlocked", unlocked);
            response.put("currentLevel", currentLevel);

            result.add(response);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/world/{worldNumber}")
    public ResponseEntity<?> getWorldGames(
            @PathVariable Integer worldNumber,
            @RequestParam(required = false) Long userId
    ) {
        if (!isValidWorld(worldNumber)) {
            return invalidWorld();
        }

        User user = null;
        List<ExerciseProgress> progress = List.of();

        if (userId != null) {
            user = userRepository
                    .findById(userId)
                    .orElse(null);

            if (user == null) {
                return userNotFound();
            }

            if (user.getAge() == null) {
                return missingAge();
            }

            progress = progressService.getProgress(userId);
        }

        List<Games> games = gameRepository
                .findByWorldNumberOrderByOrderIndexAsc(
                        worldNumber
                );

        List<Map<String, Object>> result =
                new ArrayList<>();

        for (Games game : games.stream()
                .limit(GameProgressService.GAMES_PER_WORLD)
                .toList()) {

            Map<String, Object> response =
                    createGameResponse(game);

            if (user != null) {
                int level = progressService
                        .levelFromAge(user.getAge());

                response.put(
                        "passed",
                        progressService.isGameLevelPassed(
                                game,
                                level,
                                progress
                        )
                );

                response.put(
                        "unlocked",
                        progressService.isGameUnlocked(
                                user,
                                game,
                                progress
                        )
                );

                response.put("currentLevel", level);
            }

            result.add(response);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/world/{worldNumber}/access")
    public ResponseEntity<?> getWorldAccess(
            @PathVariable Integer worldNumber,
            @RequestParam Long userId
    ) {
        if (!isValidWorld(worldNumber)) {
            return invalidWorld();
        }

        User user = userRepository
                .findById(userId)
                .orElse(null);

        if (user == null) {
            return userNotFound();
        }

        if (user.getAge() == null) {
            return missingAge();
        }

        int currentLevel = progressService
                .levelFromAge(user.getAge());

        List<ExerciseProgress> progress =
                progressService.getProgress(userId);

        boolean unlocked = progressService
                .isWorldUnlocked(
                        worldNumber,
                        currentLevel,
                        progress
                );

        int completedGames = worldNumber == 1
                ? 0
                : progressService.countPassedGames(
                        worldNumber - 1,
                        currentLevel,
                        progress
                );

        boolean completedPreviousWorld =
                worldNumber == 1 ||
                completedGames >=
                        GameProgressService.GAMES_PER_WORLD;

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put("worldNumber", worldNumber);
        response.put("unlocked", unlocked);
        response.put(
                "completedPreviousWorld",
                completedPreviousWorld
        );
        response.put(
                "previousWorld",
                worldNumber == 1 ? null : worldNumber - 1
        );
        response.put("completedGames", completedGames);
        response.put(
                "requiredGames",
                GameProgressService.GAMES_PER_WORLD
        );
        response.put("currentLevel", currentLevel);

        return ResponseEntity.ok(response);
    }

    private Map<String, Object> createGameResponse(
            Games game
    ) {
        GamesType type = getGamesType(
                game.getOrderIndex()
        );

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put("id", game.getId());
        response.put("name", game.getName());
        response.put("color", game.getColor());
        response.put("imageUrl", game.getImageUrl());
        response.put("worldNumber", game.getWorldNumber());
        response.put("orderIndex", game.getOrderIndex());
        response.put("totalLevels", game.getTotalLevels());
        response.put(
                "gamesType",
                type != null ? type.name() : null
        );

        return response;
    }

    private GamesType getGamesType(Integer orderIndex) {
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

    private boolean isValidWorld(Integer worldNumber) {
        return worldNumber != null &&
                worldNumber >= 1 &&
                worldNumber <= 6;
    }

    private ResponseEntity<?> invalidWorld() {
        return ResponseEntity.badRequest().body(
                Map.of(
                        "message",
                        "Невалиден број на свет."
                )
        );
    }

    private ResponseEntity<?> userNotFound() {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        Map.of(
                                "message",
                                "Корисникот не постои."
                        )
                );
    }

    private ResponseEntity<?> missingAge() {
        return ResponseEntity.badRequest().body(
                Map.of(
                        "message",
                        "Корисникот нема внесено возраст."
                )
        );
    }
}