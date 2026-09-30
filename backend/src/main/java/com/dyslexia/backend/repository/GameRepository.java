package com.dyslexia.backend.repository;

import com.dyslexia.backend.model.Games;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GameRepository extends JpaRepository<Games, Long> {

    // Сите игри подредени според редоследот
    List<Games> findAllByOrderByOrderIndexAsc();

    // Игри од одреден свет подредени според редоследот
    List<Games> findByWorldNumberOrderByOrderIndexAsc(Integer worldNumber);

    // Истото име без Asc - го користи ExerciseData
    List<Games> findByWorldNumberOrderByOrderIndex(Integer worldNumber);
}