package com.vertex.vertex_api.user;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponseDto getProfile(User currentUser) {
        return new UserResponseDto(
                currentUser.getId(),
                currentUser.getEmail(),
                currentUser.getName(),
                currentUser.getCreatedAt()
        );
    }

    public UserResponseDto updateProfile(User currentUser, UpdateProfileRequestDto request) {
        // 1. Update Name if provided
        if (request.name() != null && !request.name().trim().isEmpty()) {
            currentUser.setName(request.name());
        }

        // 2. Update Password if provided
        if (request.currentPassword() != null && !request.currentPassword().isEmpty() &&
                request.newPassword() != null && !request.newPassword().isEmpty()) {

            // Verify old password
            if (!passwordEncoder.matches(request.currentPassword(), currentUser.getPassword())) {
                throw new RuntimeException("Current password is incorrect.");
            }
            // Hash and set new password
            currentUser.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        }

        User updatedUser = userRepository.save(currentUser);

        return new UserResponseDto(
                updatedUser.getId(),
                updatedUser.getEmail(),
                updatedUser.getName(),
                updatedUser.getCreatedAt()
        );
    }
}
