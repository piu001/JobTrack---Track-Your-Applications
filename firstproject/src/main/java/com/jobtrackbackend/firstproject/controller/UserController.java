package com.jobtrackbackend.firstproject.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobtrackbackend.firstproject.model.User;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import com.jobtrackbackend.firstproject.service.userService;


@RestController 
@RequestMapping("/api/users")
public class UserController {

    private final userService userService;
    public UserController(userService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody User user) {
        userService.registerUser(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body("User registered successfully");
    }
    

}
