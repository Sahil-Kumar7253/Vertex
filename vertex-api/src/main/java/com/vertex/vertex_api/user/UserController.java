package com.vertex.vertex_api.user;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("api/v1/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getMyProfile(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userService.getProfile(currentUser));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponseDto> updateMyProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestBody UpdateProfileRequestDto request
    ) {
        return ResponseEntity.ok(userService.updateProfile(currentUser, request));
    }
}
