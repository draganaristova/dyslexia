package com.dyslexia.backend.controller;

import com.dyslexia.backend.model.Games;
import com.dyslexia.backend.repository.GameRepository;
import com.dyslexia.backend.repository.TrackingProgressRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/games")
public class GamesController {

    private final GameRepository gameRepository;
    private final TrackingProgressRepository trackingProgressRepository;

    public GamesController(
            GameRepository gameRepository,
            TrackingProgressRepository trackingProgressRepository
    ) {
        this.gameRepository = gameRepository;
        this.trackingProgressRepository = trackingProgressRepository;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getGamesForUser(@PathVariable Long userId) {

        List<Games> allGames =
                gameRepository.findAllByOrderByOrderIndexAsc();

        List<Map<String, Object>> result = new ArrayList<>();

        for (Games game : allGames) {

            long pinsDone =
                    trackingProgressRepository
                            .countByUserIdAndGamesIdAndCompletedTrue(
                                    userId,
                                    game.getId()
                            );

            Map<String, Object> gameData = new HashMap<>();

            gameData.put("id", game.getId());
            gameData.put("name", game.getName());
            gameData.put("color", game.getColor());
            gameData.put("imageUrl", game.getImageUrl());
            gameData.put("worldNumber", game.getWorldNumber());
            gameData.put("totalLevels", game.getTotalLevels());
            gameData.put("pinsDone", pinsDone);

            gameData.put(
                    "status",
                    pinsDone > 0
                            ? "completed"
                            : "locked"
            );

            result.add(gameData);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/world/{worldNumber}")
    public ResponseEntity<?> getWorldGames(
            @PathVariable Integer worldNumber,
            @RequestParam Long userId
    ) {

        List<Games> games =
                gameRepository.findByWorldNumberOrderByOrderIndexAsc(worldNumber);

        List<Map<String, Object>> result = new ArrayList<>();

        for (Games game : games) {

            Map<String, Object> gameData = new HashMap<>();

            gameData.put("id", game.getId());
            gameData.put("name", game.getName());
            gameData.put("color", game.getColor());
            gameData.put("imageUrl", game.getImageUrl());
            gameData.put("worldNumber", game.getWorldNumber());
            gameData.put("totalLevels", game.getTotalLevels());

            result.add(gameData);
        }

        return ResponseEntity.ok(result);
    }
}