package com.dyslexia.backend.controller;

import com.dyslexia.backend.model.ExerciseProgress;
import com.dyslexia.backend.model.Games;
import com.dyslexia.backend.repository.ExerciseProgressRepository;
import com.dyslexia.backend.repository.GameRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/games")
public class GamesController {

    private final GameRepository gameRepository;

    private final ExerciseProgressRepository
            exerciseProgressRepository;


    public GamesController(
            GameRepository gameRepository,
            ExerciseProgressRepository
                    exerciseProgressRepository
    ) {

        this.gameRepository =
                gameRepository;

        this.exerciseProgressRepository =
                exerciseProgressRepository;
    }


    /**
     * Ги враќа сите игри за корисникот.
     *
     * Progress-от се пресметува од
     * ExerciseProgress.
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getGamesForUser(
            @PathVariable Long userId
    ) {

        List<Games> allGames =
                gameRepository
                        .findAllByOrderByOrderIndexAsc();


        /*
         * Ги земаме сите progress записи
         * на корисникот.
         */
        List<ExerciseProgress> progressList =
                exerciseProgressRepository
                        .findByUserIdOrderByCompletedAtDesc(
                                userId
                        );


        /*
         * Map:
         *
         * gamesId -> set од завршени нивоа
         */
        Map<Long, Set<Integer>> completedLevels =
                new HashMap<>();


        /*
         * За секој progress запис:
         *
         * Exercise -> Games
         *
         * и земаме pinNumber како level.
         */
        for (ExerciseProgress progress :
                progressList) {

            if (!Boolean.TRUE.equals(
                    progress.getCompleted()
            )) {

                continue;
            }


            if (progress.getExercise() == null
                    || progress.getExercise().getGames() == null) {

                continue;
            }


            Long gamesId =
                    progress.getExercise()
                            .getGames()
                            .getId();


            Integer level =
                    progress.getExercise()
                            .getPinNumber();


            completedLevels
                    .computeIfAbsent(
                            gamesId,
                            key -> new HashSet<>()
                    )
                    .add(level);
        }


        List<Map<String, Object>> result =
                new ArrayList<>();


        for (Games game : allGames) {

            Set<Integer> levels =
                    completedLevels.getOrDefault(
                            game.getId(),
                            Collections.emptySet()
                    );


            Map<String, Object> gameData =
                    new HashMap<>();


            gameData.put(
                    "id",
                    game.getId()
            );

            gameData.put(
                    "name",
                    game.getName()
            );

            gameData.put(
                    "color",
                    game.getColor()
            );

            gameData.put(
                    "imageUrl",
                    game.getImageUrl()
            );

            gameData.put(
                    "worldNumber",
                    game.getWorldNumber()
            );

            gameData.put(
                    "totalLevels",
                    game.getTotalLevels()
            );


            /*
             * Колку нивоа има започнато/завршено.
             */
            gameData.put(
                    "levelsDone",
                    levels.size()
            );


            /*
             * Пресметуваме status.
             */
            String status;

            if (levels.isEmpty()) {

                status = "not_started";

            } else if (
                    levels.size()
                            >= game.getTotalLevels()
            ) {

                status = "completed";

            } else {

                status = "in_progress";
            }


            gameData.put(
                    "status",
                    status
            );


            result.add(gameData);
        }


        return ResponseEntity.ok(result);
    }


    /**
     * Ги враќа игрите од конкретен свет.
     */
    @GetMapping("/world/{worldNumber}")
    public ResponseEntity<?> getWorldGames(
            @PathVariable Integer worldNumber,
            @RequestParam Long userId
    ) {

        List<Games> games =
                gameRepository
                        .findByWorldNumberOrderByOrderIndexAsc(
                                worldNumber
                        );


        List<Map<String, Object>> result =
                new ArrayList<>();


        for (Games game : games) {

            Map<String, Object> gameData =
                    new HashMap<>();


            gameData.put(
                    "id",
                    game.getId()
            );

            gameData.put(
                    "name",
                    game.getName()
            );

            gameData.put(
                    "color",
                    game.getColor()
            );

            gameData.put(
                    "imageUrl",
                    game.getImageUrl()
            );

            gameData.put(
                    "worldNumber",
                    game.getWorldNumber()
            );

            gameData.put(
                    "totalLevels",
                    game.getTotalLevels()
            );


            result.add(gameData);
        }


        return ResponseEntity.ok(result);
    }
}