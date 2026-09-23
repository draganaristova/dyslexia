package com.dyslexia.backend.controller;

import com.dyslexia.backend.model.Games;
import com.dyslexia.backend.repository.GameRepository;
import com.dyslexia.backend.repository.TrackingProgressRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

        List<Map<String, Object>> result = allGames.stream()
                .map(game -> {

                    long pinsDone =
                            trackingProgressRepository
                                    .countByUserIdAndGamesIdAndCompletedTrue(
                                            userId,
                                            game.getId()
                                    );

                    return Map.<String, Object>of(
                            "id", game.getId(),
                            "name", game.getName(),
                            "color", game.getColor(),
                            "imageUrl", game.getImageUrl(),
                            "worldNumber", game.getWorldNumber(),
                            "totalLevels", game.getTotalLevels(),
                            "pinsDone", pinsDone,
                            "status", pinsDone > 0
                                    ? "completed"
                                    : "locked"
                    );
                })
                .toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/world/{worldNumber}")
    public ResponseEntity<?> getWorldGames(
            @PathVariable Integer worldNumber,
            @RequestParam Long userId
    ) {

        List<Games> games =
                gameRepository.findByWorldNumberOrderByOrderIndexAsc(worldNumber);

        List<Map<String, Object>> result = games.stream()
                .map(game -> Map.<String, Object>of(
                        "id", game.getId(),
                        "name", game.getName(),
                        "color", game.getColor(),
                        "imageUrl", game.getImageUrl(),
                        "worldNumber", game.getWorldNumber(),
                        "totalLevels", game.getTotalLevels()
                ))
                .toList();

        return ResponseEntity.ok(result);
    }
}