package com.dyslexia.backend.repository;
import com.dyslexia.backend.model.ExerciseProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ExerciseProgressRepository extends JpaRepository<ExerciseProgress, Long> {

    Optional<ExerciseProgress>findByUserIdAndExerciseId(Long userId, Long exerciseId);
    List<ExerciseProgress>findByUserIdOrderByCompletedAtDesc(Long userId);
}