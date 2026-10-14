package com.dyslexia.backend.config;

import com.dyslexia.backend.config.exercises.ContentFactoryExercises;
import com.dyslexia.backend.model.AgeGroup;
import com.dyslexia.backend.model.Exercise;
import com.dyslexia.backend.model.Games;
import com.dyslexia.backend.model.GamesType;
import com.dyslexia.backend.repository.ExerciseRepository;
import com.dyslexia.backend.repository.GameRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(2)
public class ExerciseData implements CommandLineRunner {

    private static final int FIRST_WORLD = 1;
    private static final int LAST_WORLD = 6;

    private static final int FIRST_PIN = 1;
    private static final int LAST_PIN = 6;

    private static final int FIRST_TASK = 1;
    private static final int LAST_TASK = 10;

    private final ExerciseRepository exerciseRepository;
    private final GameRepository gameRepository;

    public ExerciseData(
            ExerciseRepository exerciseRepository,
            GameRepository gameRepository
    ) {
        this.exerciseRepository = exerciseRepository;
        this.gameRepository = gameRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {

        int total = 0;

        for (
                int worldNumber = FIRST_WORLD;
                worldNumber <= LAST_WORLD;
                worldNumber++
        ) {

            var games =
                    gameRepository
                            .findByWorldNumberOrderByOrderIndex(
                                    worldNumber
                            );

            if (games == null || games.isEmpty()) {

                System.out.println(
                        "WARNING: No games found for world "
                                + worldNumber
                );

                continue;
            }

            System.out.println(
                    "=========================================="
            );

            System.out.println(
                    "Preparing WORLD " + worldNumber
            );

            System.out.println(
                    "=========================================="
            );

            for (Games game : games) {

                GamesType gamesType =
                        getGamesType(
                                game.getOrderIndex()
                        );

                if (gamesType == null) {

                    System.out.println(
                            "WARNING: Unknown game orderIndex "
                                    + game.getOrderIndex()
                    );

                    continue;
                }

                System.out.println(
                        "Game: "
                                + game.getName()
                                + " -> "
                                + gamesType
                );

                for (
                        AgeGroup ageGroup :
                        AgeGroup.values()
                ) {

                    for (
                            int pin = FIRST_PIN;
                            pin <= LAST_PIN;
                            pin++
                    ) {

                        for (
                                int task = FIRST_TASK;
                                task <= LAST_TASK;
                                task++
                        ) {

                            createOrUpdateExercise(
                                    game,
                                    gamesType,
                                    ageGroup,
                                    worldNumber,
                                    pin,
                                    task
                            );

                            total++;
                        }
                    }
                }
            }
        }

        System.out.println(
                "=========================================="
        );

        System.out.println(
                "EXERCISES CREATED / UPDATED: "
                        + total
        );

        System.out.println(
                "=========================================="
        );
    }

    private void createOrUpdateExercise(
            Games game,
            GamesType gamesType,
            AgeGroup ageGroup,
            int worldNumber,
            int pin,
            int task
    ) {

        String content =
                ContentFactoryExercises.create(
                        gamesType,
                        ageGroup,
                        worldNumber,
                        pin,
                        task
                );

        var existing =
                exerciseRepository
                        .findByGamesIdAndGamesTypeAndAgeGroupAndPinNumberAndTaskNumber(
                                game.getId(),
                                gamesType,
                                ageGroup,
                                pin,
                                task
                        );

        Exercise exercise;

        if (existing.isPresent()) {

            exercise = existing.get();

            exercise.setContentJson(
                    content
            );

        } else {

            exercise = new Exercise();

            exercise.setGames(game);

            exercise.setGamesType(
                    gamesType
            );

            exercise.setAgeGroup(
                    ageGroup
            );

            exercise.setPinNumber(
                    pin
            );

            exercise.setTaskNumber(
                    task
            );

            exercise.setContentJson(
                    content
            );
        }

        exerciseRepository.save(exercise);
    }

    private GamesType getGamesType(
            Integer orderIndex
    ) {

        if (orderIndex == null) {
            return null;
        }

        return switch (orderIndex) {

            case 1 ->
                    GamesType.MEMORY;

            case 2 ->
                    GamesType.WORD_BUILDING;

            case 3 ->
                    GamesType.MISSING_LETTER;

            case 4 ->
                    GamesType.RHYMES;

            case 5 ->
                    GamesType.SYLLABLES;

            case 6 ->
                    GamesType.SOUND_MANIPULATION;

            default ->
                    null;
        };
    }
}