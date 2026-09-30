package com.dyslexia.backend.repository;

import com.dyslexia.backend.model.TrackingProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TrackingProgressRepository
        extends JpaRepository<TrackingProgress, Long> {

    Optional<TrackingProgress>
    findByUserIdAndGamesIdAndPinNumber(
            Long userId,
            Long gamesId,
            Integer pinNumber
    );

    List<TrackingProgress> findByUserId(Long userId);

    List<TrackingProgress>
    findByUserIdOrderByCompletedAtDesc(Long userId);

    List<TrackingProgress>
    findByUserIdAndGamesId(Long userId, Long gamesId);

    Optional<TrackingProgress>
    findByUserIdAndGamesIdAndLevelNumber(
            Long userId,
            Long gamesId,
            Integer levelNumber
    );

    long countByUserIdAndGamesIdAndCompletedTrue(
            Long userId,
            Long gamesId
    );
}