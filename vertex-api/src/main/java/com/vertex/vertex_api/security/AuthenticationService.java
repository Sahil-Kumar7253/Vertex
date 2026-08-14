package com.vertex.vertex_api.security;

import com.vertex.vertex_api.user.User;
import com.vertex.vertex_api.user.UserRepository;
import com.vertex.vertex_api.user.UserResponseDto;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationProvider authenticationProvider;
    private final AuthenticationManager authenticationManager;

    public AuthenticationService(UserRepository repository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, AuthenticationProvider authenticationProvider, AuthenticationManager authenticationManager) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationProvider = authenticationProvider;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponseDto register(RegisterRequestDto request){
        if(repository.findByEmail(request.email()).isPresent()){
            throw  new RuntimeException("Email already in use");
        }

        User user = new User(
                request.email(),
                passwordEncoder.encode(request.password()),
                request.name()
        );

        repository.save(user);

        String jetToken = jwtUtil.generateToken(user);

        UserResponseDto userDto = new UserResponseDto(user.getId(), user.getEmail(), user.getName(), user.getCreatedAt());

        return new AuthResponseDto(jetToken, userDto);
    }

    public AuthResponseDto authenticate(AuthRequestDto request){
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        User user = repository.findByEmail(request.email()).orElseThrow(() -> new RuntimeException("User not found"));

        String jwtToken = jwtUtil.generateToken(user);

        UserResponseDto userDto = new UserResponseDto(user.getId(), user.getEmail(), user.getName(), user.getCreatedAt());

        return new AuthResponseDto(jwtToken, userDto);
    }
}
