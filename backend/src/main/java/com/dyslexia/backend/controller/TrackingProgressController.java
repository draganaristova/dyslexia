// package com.dyslexia.backend.controller;
// import com.dyslexia.backend.model.Games;
// import com.dyslexia.backend.model.GamesType;
// import com.dyslexia.backend.model.TrackingProgress;
// import com.dyslexia.backend.model.User;
// import com.dyslexia.backend.repository.GameRepository;
// import com.dyslexia.backend.repository.TrackingProgressRepository;
// import com.dyslexia.backend.repository.UserRepository;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.time.LocalDateTime;
// import java.util.List;
// import java.util.Map;
// import java.util.Optional;

// @RestController
// @RequestMapping("/api/progress")
// public class TrackingProgressController {

//     private final TrackingProgressRepository trackingProgressRepository;
//     private final UserRepository userRepository;
//     private final GameRepository gameRepository;

//     public TrackingProgressController(TrackingProgressRepository trackingProgressRepository,
//                                        UserRepository userRepository,
//                                        GameRepository gameRepository) {
//         this.trackingProgressRepository = trackingProgressRepository;
//         this.userRepository = userRepository;
//         this.gameRepository = gameRepository;
//     }

//     public record ProgressRequest(Long userId, Long gamesId, Integer levelNumber, GamesType gamesType, Integer score) {}

//     @PostMapping
//     public ResponseEntity<?> recordProgress(@RequestBody ProgressRequest request) {
//         Optional<User> userOpt = userRepository.findById(request.userId());
//         Optional<Games> gamesOpt = gameRepository.findById(request.gamesId());

//         if (userOpt.isEmpty() || gamesOpt.isEmpty()) {
//             return ResponseEntity.badRequest().body(Map.of("message", "Не постои корисникот или светот"));
//         }

//         TrackingProgress progress = trackingProgressRepository
//                 .findByUserIdAndGamesIdAndLevelNumber(request.userId(), request.gamesId(), request.levelNumber())
//                 .orElse(new TrackingProgress());

//         progress.setUser(userOpt.get());
//         progress.setGames(gamesOpt.get());
//         progress.setLevelNumber(request.levelNumber());
//         progress.setGamesType(request.gamesType());
//         progress.setScore(request.score());
//         progress.setAttempts(progress.getAttempts() == null ? 1 : progress.getAttempts() + 1);
//         progress.setCompleted(true);
//         progress.setCompletedAt(LocalDateTime.now());

//         trackingProgressRepository.save(progress);

//         return ResponseEntity.ok(Map.of("message", "Прогресот е зачуван"));
//     }

//     @GetMapping("/{userId}")
//     public ResponseEntity<?> getProgressForUser(@PathVariable Long userId) {
//         List<TrackingProgress> progressList = trackingProgressRepository.findByUserId(userId);

//         List<Map<String, Object>> result = progressList.stream().map(p -> Map.<String, Object>of(
//                 "gameName", p.getGames().getName(),
//                 "levelNumber", p.getLevelNumber(),
//                 "gamesType", p.getGamesType(),
//                 "score", p.getScore(),
//                 "attempts", p.getAttempts(),
//                 "completed", p.getCompleted(),
//                 "completedAt", p.getCompletedAt()
//         )).toList();

//         return ResponseEntity.ok(result);
//     }
// }