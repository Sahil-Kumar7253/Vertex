package com.vertex.vertex_api.user.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vertex.vertex_api.user.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    // Custom query to find a user by their email for the authentication process
    Optional<User> findByEmail(String email);
}