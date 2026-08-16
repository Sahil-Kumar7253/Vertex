package com.vertex.vertex_api.security;

import com.vertex.vertex_api.user.User;
import com.vertex.vertex_api.user.UserRepository;
import com.vertex.vertex_api.user.UserResponseDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationService.class);

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthenticationService(UserRepository repository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, AuthenticationManager authenticationManager) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponseDto register(RegisterRequestDto request){
        log.info("Auth register flow started for email='{}'", request.email());
        if(repository.findByEmail(request.email()).isPresent()){
            log.warn("Auth register rejected: email already in use for email='{}'", request.email());
            throw  new RuntimeException("Email already in use");
        }

        User user = new User(
                request.email(),
                passwordEncoder.encode(request.password()),
                request.name()
        );

        repository.save(user);
        log.info("Auth register user saved successfully: userId={}, email='{}'", user.getId(), user.getEmail());

        String jetToken = jwtUtil.generateToken(user);
        log.info("Auth register token generated successfully for userId={}, email='{}'", user.getId(), user.getEmail());

        UserResponseDto userDto = new UserResponseDto(user.getId(), user.getEmail(), user.getName(), user.getCreatedAt());

        return new AuthResponseDto(jetToken, userDto);
    }

    public AuthResponseDto authenticate(AuthRequestDto request){
        log.info("Auth login flow started for email='{}'", request.email());
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );
        log.info("Auth login credentials accepted by AuthenticationManager for email='{}'", request.email());

        User user = repository.findByEmail(request.email()).orElseThrow(() -> new RuntimeException("User not found"));
        log.info("Auth login user loaded from repository: userId={}, email='{}'", user.getId(), user.getEmail());

        String jwtToken = jwtUtil.generateToken(user);
        log.info("Auth login token generated successfully for userId={}, email='{}'", user.getId(), user.getEmail());

        UserResponseDto userDto = new UserResponseDto(user.getId(), user.getEmail(), user.getName(), user.getCreatedAt());

        return new AuthResponseDto(jwtToken, userDto);
    }
}
