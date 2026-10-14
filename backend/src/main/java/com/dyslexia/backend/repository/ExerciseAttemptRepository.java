package com.dyslexia.backend.repository;

import com.dyslexia.backend.model.ExerciseAttempt;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExerciseAttemptRepository extends JpaRepository<ExerciseAttempt, Long> {

    List<ExerciseAttempt> findByUserIdOrderByAttemptedAtDesc(Long userId);

    List<ExerciseAttempt> findByUserIdAndExerciseIdOrderByAttemptNumberAsc(Long userId, Long exerciseId);

    long countByUserIdAndExerciseId(Long userId, Long exerciseId);
}