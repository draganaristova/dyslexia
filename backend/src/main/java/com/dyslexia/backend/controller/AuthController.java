package com.dyslexia.backend.controller;
import com.dyslexia.backend.dto.ForgotPasswordRequest;
import com.dyslexia.backend.dto.LoginRequest;
import com.dyslexia.backend.dto.LoginResponse;
import com.dyslexia.backend.dto.RegisterRequest;
import com.dyslexia.backend.model.User;
import com.dyslexia.backend.repository.UserRepository;
import com.dyslexia.backend.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil
    ) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request
    ) {
        if (userRepository.existsByEmail(
                request.email()
        )) {

            return ResponseEntity.badRequest().body("Е-поштата веќе постои.");
        }

        if (!request.password().equals(
                request.repeatpassword()
        )) {

            return ResponseEntity.badRequest().body("Лозинките не се совпаѓаат.");
        }

        User user = new User();
        user.setName(request.name());
        user.setSurname(request.surname());
        user.setAge(request.age());
        user.setGender(request.gender());
        user.setEmail(request.email());

        user.setPassword(passwordEncoder.encode(request.password()));
        userRepository.save(user);
        return ResponseEntity.ok("Успешно е креиран профил.");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        User user = userRepository.findByEmail(request.email()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body("Погрешна е-пошта или лозинка.");
        }

        boolean passwordMatches = passwordEncoder.matches(request.password(), user.getPassword());
        if (!passwordMatches) {
            return ResponseEntity.status(401).body("Погрешна е-пошта или лозинка.");
        }

        String token = jwtUtil.generateToken(user.getId());
        return ResponseEntity.ok(new LoginResponse(
                        token,
                        user.getId(),
                        user.getName(),
                        user.getEmail()
                )
        );
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody ForgotPasswordRequest request
    ) {

        User user = userRepository.findByEmail(request.email()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body("Корисникот со оваа е-пошта не постои.");
        }

        if (!request.password().equals(
                request.repeatpassword()
        )) {

            return ResponseEntity.badRequest().body("Лозинките не се совпаѓаат.");
        }

        user.setPassword(passwordEncoder.encode(request.password()));
        userRepository.save(user);
        return ResponseEntity.ok("Лозинката е успешно променета.");
    }
}