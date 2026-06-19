package com.shopwise.service;

import com.shopwise.dto.request.AuthRequest;
import com.shopwise.dto.response.Responses.AuthResponse;
import com.shopwise.exception.ConflictException;
import com.shopwise.model.User;
import com.shopwise.repository.UserRepository;
import com.shopwise.security.JwtUtils;
import com.shopwise.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtUtils jwtUtils;

    public AuthResponse register(AuthRequest.Register req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ConflictException("Email is already registered");
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .roles(Set.of(User.Role.USER))
                .build();

        userRepository.save(user);

        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(auth);

        UserDetailsImpl principal = (UserDetailsImpl) auth.getPrincipal();
        return buildAuthResponse(principal, jwtUtils.generateToken(auth));
    }

    public AuthResponse login(AuthRequest.Login req) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(auth);

        UserDetailsImpl principal = (UserDetailsImpl) auth.getPrincipal();
        return buildAuthResponse(principal, jwtUtils.generateToken(auth));
    }

    private AuthResponse buildAuthResponse(UserDetailsImpl principal, String token) {
        // Derive role set from authorities
        var roles = principal.getAuthorities().stream()
                .map(a -> User.Role.valueOf(a.getAuthority().replace("ROLE_", "")))
                .collect(java.util.stream.Collectors.toSet());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(principal.getId())
                .name(principal.getName())
                .email(principal.getEmail())
                .roles(roles)
                .build();
    }
}
