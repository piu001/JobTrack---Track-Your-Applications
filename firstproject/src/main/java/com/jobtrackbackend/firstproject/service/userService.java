package com.jobtrackbackend.firstproject.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.jobtrackbackend.firstproject.model.User;
import com.jobtrackbackend.firstproject.repository.userRepository;

@Service 
public class userService {
    private final userRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public userService(userRepository userRepository,PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }

}
