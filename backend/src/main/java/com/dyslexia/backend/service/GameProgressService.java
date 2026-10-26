package com.dyslexia.backend.service;
import com.dyslexia.backend.model.AgeGroup;
import com.dyslexia.backend.model.ExerciseProgress;
import com.dyslexia.backend.model.Games;
import com.dyslexia.backend.model.User;
import com.dyslexia.backend.repository.ExerciseProgressRepository;
import com.dyslexia.backend.repository.GameRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Objects;

@Service
public class GameProgressService {

    public static final int TOTAL_TASKS = 10;
    public static final int PASSING_SCORE = 8;
    public static final int GAMES_PER_WORLD = 6;
    private final GameRepository gameRepository;
    private final ExerciseProgressRepository progressRepository;
    private final MissionRunService missionRunService;

    public GameProgressService(
            GameRepository gameRepository,
            ExerciseProgressRepository progressRepository,
            MissionRunService missionRunService
    ) {
        this.gameRepository = gameRepository;
        this.progressRepository = progressRepository;
        this.missionRunService = missionRunService;
    }

    public List<ExerciseProgress> getProgress(Long userId) {
        return progressRepository.findByUserIdOrderByCompletedAtDesc(userId);
    }

    public int levelFromAge(Integer age) {
        if (age == null || age <= 7) return 1;
        if (age <= 10) return 2;
        return 3;
    }

    public AgeGroup ageGroupFromAge(Integer age) {
        return switch (levelFromAge(age)) {
            case 1 -> AgeGroup.AGE_5_7;
            case 2 -> AgeGroup.AGE_8_10;
            default -> AgeGroup.AGE_10_15;
        };
    }

    public boolean isGameLevelPassed(Games game, int level, List<ExerciseProgress> progress) {
        if (game == null || progress == null || progress.isEmpty()) return false;

        Long userId = progress.get(0).getUser().getId();
        var statuses = missionRunService.statusesForUser(userId);

        return missionRunService.status(statuses, game.getId(), level).passed();
    }

    public int countPassedGames(int worldNumber, int level, List<ExerciseProgress> progress) {
        if (progress == null || progress.isEmpty()) return 0;

        Long userId = progress.get(0).getUser().getId();
        var statuses = missionRunService.statusesForUser(userId);

        List<Games> games = gameRepository.findByWorldNumberOrderByOrderIndexAsc(worldNumber);
        int count = 0;

        for (Games game : games.stream().limit(GAMES_PER_WORLD).toList()) {
            if (missionRunService.status(statuses, game.getId(), level).passed()) count++;
        }

        return count;
    }

    public boolean isWorldUnlocked(int worldNumber, int level, List<ExerciseProgress> progress) {
        if (worldNumber < 1 || worldNumber > 6) return false;
        if (worldNumber == 1) return true;
        if (progress == null || progress.isEmpty()) return false;

        Long userId = progress.get(0).getUser().getId();
        var statuses = missionRunService.statusesForUser(userId);

        for (int previousWorld = 1; previousWorld < worldNumber; previousWorld++) {
            List<Games> games = gameRepository.findByWorldNumberOrderByOrderIndexAsc(previousWorld);

            if (games.size() < GAMES_PER_WORLD) return false;

            for (Games game : games.stream().limit(GAMES_PER_WORLD).toList()) {
                if (!missionRunService.status(statuses, game.getId(), level).passed()) return false;
            }
        }

        return true;
    }

    public boolean isGameUnlocked(User user, Games targetGame, List<ExerciseProgress> progress) {
        if (user == null || user.getAge() == null || targetGame == null || targetGame.getWorldNumber() == null) {
            return false;
        }

        int level = levelFromAge(user.getAge());
        int worldNumber = targetGame.getWorldNumber();

        if (worldNumber < 1 || worldNumber > 6) return false;

        var statuses = missionRunService.statusesForUser(user.getId());

        for (int previousWorld = 1; previousWorld < worldNumber; previousWorld++) {
            List<Games> previousGames = gameRepository.findByWorldNumberOrderByOrderIndexAsc(previousWorld);

            if (previousGames.size() < GAMES_PER_WORLD) return false;

            for (Games game : previousGames.stream().limit(GAMES_PER_WORLD).toList()) {
                if (!missionRunService.status(statuses, game.getId(), level).passed()) return false;
            }
        }

        List<Games> games = gameRepository.findByWorldNumberOrderByOrderIndexAsc(worldNumber)
                .stream()
                .limit(GAMES_PER_WORLD)
                .toList();

        for (Games game : games) {
            if (Objects.equals(game.getId(), targetGame.getId())) return true;

            if (!missionRunService.status(statuses, game.getId(), level).passed()) {
                return false;
            }
        }

        return false;
    }
}
