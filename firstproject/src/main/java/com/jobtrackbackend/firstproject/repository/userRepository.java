package com.jobtrackbackend.firstproject.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jobtrackbackend.firstproject.model.User;

public interface userRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);
    User findByEmail(String email);
}
