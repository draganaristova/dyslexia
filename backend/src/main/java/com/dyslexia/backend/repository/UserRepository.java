package com.dyslexia.backend.repository;

import com.dyslexia.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>{

    Optional<User> findByEmail(String email);
    boolean exexistsByEmail(String email);
}