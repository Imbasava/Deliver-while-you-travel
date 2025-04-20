/* package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.EmailService; // Import the EmailService
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000") // Adjust to match your frontend's URL
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService; // Inject the EmailService

    // Registration Endpoint
    @PostMapping
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            // Save the user to the database
            userRepository.save(user);

            // Attempt to send a welcome email asynchronously
            new Thread(() -> {
                try {
                    emailService.sendEmail(
                        user.getEmail(),
                        "Welcome to Deliver While You Travel!",
                        "Hello " + user.getFirstName() + ",\n\nThank you for signing up. Enjoy our services!"
                    );
                } catch (Exception emailException) {
                    // Log email sending error silently without affecting user registration
                    System.err.println("Error sending email: " + emailException.getMessage());
                }
            }).start();

            // Return a proper JSON response
            return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
        } catch (Exception e) {
            // Log and return a proper error response
            System.err.println("Error during registration: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    // Login Retrieval Endpoint
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> loginUser(@RequestBody User loginRequest) {
        Optional<User> user = userRepository.findByEmail(loginRequest.getEmail());
    
        if (user.isPresent() && user.get().getPassword().equals(loginRequest.getPassword())) {
            System.out.println("Password match successful.");
            return ResponseEntity.ok(Map.of(
                "firstName", user.get().getFirstName(),
                "message", "Login successful!"
            ));
        } else {
            System.out.println("Invalid email or password.");
            return ResponseEntity.status(401).body(Map.of(
                "message", "Invalid email or password"
            ));
        }
    }
}
 */

 package com.example.demo.controller;

 import com.example.demo.model.User;
 import com.example.demo.repository.UserRepository;
 import com.example.demo.service.EmailService;
 import com.example.demo.util.JwtUtil;
 import org.springframework.beans.factory.annotation.Autowired;
 import org.springframework.http.ResponseEntity;
 import org.springframework.web.bind.annotation.*;
 
 import java.util.Optional;
 import java.util.Map;
 
 @CrossOrigin(origins = "http://localhost:3000") // Adjust to match frontend's URL
 @RestController
 @RequestMapping("/api/users")
 public class UserController {
 
     @Autowired
     private UserRepository userRepository;
 
     @Autowired
     private EmailService emailService;
 
     @Autowired
     private JwtUtil jwtUtil; // Inject JwtUtil
 
     // 🔹 **User Registration**
     @PostMapping("/register")
     public ResponseEntity<Map<String, String>> registerUser(@RequestBody User user) {
         try {
             // Save the user to the database
             userRepository.save(user);
 
             // Send a welcome email asynchronously
             new Thread(() -> {
                 try {
                     emailService.sendEmail(
                         user.getEmail(),
                         "Welcome to Deliver While You Travel!",
                         "Hello " + user.getFirstName() + ",\n\nThank you for signing up. Enjoy our services!"
                     );
                 } catch (Exception emailException) {
                     System.err.println("Error sending email: " + emailException.getMessage());
                 }
             }).start();
 
             return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
         } catch (Exception e) {
             System.err.println("Error during registration: " + e.getMessage());
             e.printStackTrace();
             return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
         }
     }
 
     // 🔹 **User Login with JWT Token**
     @PostMapping("/login")
     public ResponseEntity<Map<String, String>> loginUser(@RequestBody User loginRequest) {
         Optional<User> user = userRepository.findByEmail(loginRequest.getEmail());
 
         if (user.isPresent() && user.get().getPassword().equals(loginRequest.getPassword())) {
             System.out.println("Password match successful.");
 
             // Generate JWT token
             String token = jwtUtil.generateToken(user.get().getEmail());
 
             System.out.println("The user ID is " + user.get().getId());
             return ResponseEntity.ok(Map.of(
                 "firstName", user.get().getFirstName(),
                 "id", String.valueOf(user.get().getId()),
                 "message", "Login successful!",
                 "token", token // Include JWT token in response
             ));
         } else {
             System.out.println("Invalid email or password.");
             return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
         }
     }
 }
 