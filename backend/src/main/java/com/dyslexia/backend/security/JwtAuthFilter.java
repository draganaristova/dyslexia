package com.dyslexia.backend.security;
import com.dyslexia.backend.model.User;
import com.dyslexia.backend.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtAuthFilter(
            JwtUtil jwtUtil,
            UserRepository userRepository
    ) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {

            System.out.println("JWT: NO VALID AUTH HEADER");
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {

            Long userId = jwtUtil.getUserIdFromToken(token);
            System.out.println("JWT USER ID: " + userId);
            User user = userRepository.findById(userId).orElse(null);

            if (user == null) {

                System.out.println("JWT: USER NOT FOUND");
                filterChain.doFilter(request, response);
                return;
            }

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_USER"))
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (Exception e) {

            System.out.println("JWT RESULT: AUTHENTICATION FAILED");
            System.out.println("JWT ERROR: " + e.getMessage());
            SecurityContextHolder.clearContext();
        }
        filterChain.doFilter(request, response);
    }
}