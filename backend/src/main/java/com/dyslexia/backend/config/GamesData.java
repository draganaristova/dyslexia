package com.dyslexia.backend.config;

import com.dyslexia.backend.model.Games;
import com.dyslexia.backend.repository.GameRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Order(1)
public class GamesData implements CommandLineRunner {

    private final GameRepository gameRepository;

    public GamesData(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {

        String[] names = {
                "Меморија",
                "Состави го зборот",
                "Која буква недостасува",
                "Најди ја римата",
                "Слогови",
                "Бриши и замени гласови"
        };

        String[] colors = {
                "#FF8A65",
                "#66BB6A",
                "#42A5F5",
                "#AB47BC",
                "#EC407A",
                "#FFCA28"
        };

        String[] images = {
                "/games/game1.png",
                "/games/game2.png",
                "/games/game3.png",
                "/games/game4.png",
                "/games/game5.png",
                "/games/game6.png"
        };

        /*
         * ==========================================================
         * CREATE ALL 6 WORLDS
         * ==========================================================
         *
         * World 1 -> games 1-6
         * World 2 -> games 1-6
         * ...
         * World 6 -> games 1-6
         *
         * Вкупно:
         *
         * 6 worlds x 6 games = 36 game records
         */

        for (int world = 1; world <= 6; world++) {

            for (int orderIndex = 1; orderIndex <= 6; orderIndex++) {

                createOrUpdateGame(
                        world,
                        orderIndex,
                        names[orderIndex - 1],
                        colors[orderIndex - 1],
                        images[orderIndex - 1]
                );
            }
        }

    }

    private void createOrUpdateGame(
            int worldNumber,
            int orderIndex,
            String name,
            String color,
            String imageUrl
    ) {

        /*
         * Наоѓаме игра само во конкретниот свет.
         *
         * Пример:
         *
         * World 1 + order 1 = Memory World 1
         * World 2 + order 1 = Memory World 2
         *
         * Не ги мешаме.
         */

        List<Games> games =
                gameRepository
                        .findByWorldNumberOrderByOrderIndexAsc(
                                worldNumber
                        );

        Games game =
                games.stream()
                        .filter(g ->
                                g.getOrderIndex() != null &&
                                g.getOrderIndex() == orderIndex
                        )
                        .findFirst()
                        .orElse(null);

        if (game == null) {

            game = new Games();

            game.setWorldNumber(worldNumber);
            game.setOrderIndex(orderIndex);
        }

        game.setName(name);
        game.setColor(color);
        game.setImageUrl(imageUrl);
        game.setWorldNumber(worldNumber);
        game.setOrderIndex(orderIndex);
        game.setTotalLevels(3);

        gameRepository.save(game);
    }
}