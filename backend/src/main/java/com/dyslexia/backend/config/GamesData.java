package com.dyslexia.backend.config;

import com.dyslexia.backend.model.Games;
import com.dyslexia.backend.repository.GameRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class GamesData implements CommandLineRunner {

    private final GameRepository gameRepository;

    public GamesData(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    @Override
    public void run(String... args) {

        if (gameRepository.count() > 0) {
            return;
        }

        // WORLD 1 - Патека на брзината

        createGame(
                "Препознај го гласот",
                "#FF8A65",
                "/images/games/recognize-sound.png",
                1,
                1
        );

        createGame(
                "Меморија",
                "#FFD54F",
                "/images/games/memory.png",
                2,
                1
        );

        createGame(
                "Рими",
                "#81C784",
                "/images/games/rhymes.png",
                3,
                1
        );

        createGame(
                "Најди ја буквата",
                "#64B5F6",
                "/images/games/missing-letter.png",
                4,
                1
        );

        createGame(
                "Состави го зборот",
                "#BA68C8",
                "/images/games/word-building.png",
                5,
                1
        );

        createGame(
                "Што се смени?",
                "#FFB74D",
                "/images/games/what-changed.png",
                6,
                1
        );
    }

    private void createGame(
            String name,
            String color,
            String imageUrl,
            Integer orderIndex,
            Integer worldNumber
    ) {

        Games game = new Games();

        game.setName(name);
        game.setColor(color);
        game.setImageUrl(imageUrl);
        game.setOrderIndex(orderIndex);
        game.setWorldNumber(worldNumber);
        game.setTotalLevels(6);

        gameRepository.save(game);
    }
}