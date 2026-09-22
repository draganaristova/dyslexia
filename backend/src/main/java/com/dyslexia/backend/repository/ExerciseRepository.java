package com.dyslexia.backend.repository;

import com.dyslexia.backend.model.AgeGroup;
import com.dyslexia.backend.model.Exercise;
import com.dyslexia.backend.model.GamesType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    Optional<Exercise> findByGamesIdAndGamesTypeAndAgeGroup(Long gamesId, GamesType gamesType, AgeGroup ageGroup);
}