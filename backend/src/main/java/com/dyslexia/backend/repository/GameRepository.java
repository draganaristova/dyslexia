package com.dyslexia.backend.repository;

import com.dyslexia.backend.model.Games;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GameRepository extends JpaRepository<Games, Long> {

    List<Games> findAllByOrderByOrderIndexAsc();

}