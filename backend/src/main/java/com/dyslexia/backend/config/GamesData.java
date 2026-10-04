package com.dyslexia.backend.config;

import com.dyslexia.backend.model.Games;
import com.dyslexia.backend.repository.GameRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(1)
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

        createGame(
                "Меморија",
                "#FF8A65",
                "/images/games/memory.png",
                1
        );

        createGame(
                "Состави го зборот",
                "#FFD54F",
                "/images/games/word-building.png",
                2
        );

        createGame(
                "Која буква недостасува",
                "#81C784",
                "/images/games/missing-letter.png",
                3
        );

        createGame(
                "Најди ја римата",
                "#64B5F6",
                "/images/games/rhymes.png",
                4
        );

        createGame(
                "Слогови",
                "#BA68C8",
                "/images/games/syllables.png",
                5
        );

        createGame(
                "Бриши и замени гласови",
                "#FFB74D",
                "/images/games/sound-manipulation.png",
                6
        );
    }

    private void createGame(
            String name,
            String color,
            String imageUrl,
            int orderIndex
    ) {

        Games game =
                new Games();

        game.setName(name);
        game.setColor(color);
        game.setImageUrl(imageUrl);
        game.setOrderIndex(orderIndex);
        game.setWorldNumber(1);
        game.setTotalLevels(3);

        gameRepository.save(game);
    }
}