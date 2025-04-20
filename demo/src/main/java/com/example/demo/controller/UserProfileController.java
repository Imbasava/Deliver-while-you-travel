package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.model.UserProfile;
import com.example.demo.repository.UserProfileRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Paths;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users/profile")
@CrossOrigin(origins = "http://localhost:3000")
public class UserProfileController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository profileRepository;

    // Fetch Profile
    
    // Fetch Profile
@GetMapping
public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String tokenHeader) {
    String token = tokenHeader.replace("Bearer ", "");
    String email = jwtUtil.extractEmail(token);
    Optional<User> user = userRepository.findByEmail(email);

    if (user.isPresent()) {
        Optional<UserProfile> profile = profileRepository.findByUser(user.get());
        if (profile.isPresent()) {
            UserProfile p = profile.get();
            String photoUrl = p.getPhoto() != null 
                    ? "http://localhost:8080/uploads/" + Paths.get(p.getPhoto()).getFileName()
                    : null;

            return ResponseEntity.ok(Map.of(
                    "user_id", user.get().getId(), // Include user_id in the response
                    "name", user.get().getFirstName(),
                    "aadhar", p.getAadhar(),
                    "age", String.valueOf(p.getAge()),
                    "photo", photoUrl
            ));
        } else {
            return ResponseEntity.ok(Map.of("message", "Profile not found."));
        }
    }

    return ResponseEntity.status(401).body(Map.of("message", "Invalid token"));
}


    
    

    // Save Profile
@PostMapping 
public ResponseEntity<?> saveProfile(
        @RequestHeader("Authorization") String tokenHeader,
        @RequestParam("aadhar") String aadhar,
        @RequestParam("age") int age,
        @RequestParam("photo") MultipartFile photoFile
) {
    try {
        String token = tokenHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid user"));
        }

        User user = userOpt.get();

        // === Use absolute path for uploads folder ===
        String uploadDir = System.getProperty("user.dir") + "/uploads/";
        java.io.File uploadFolder = new java.io.File(uploadDir);
        if (!uploadFolder.exists()) uploadFolder.mkdirs();

        // Save the image file
        String safeFileName = photoFile.getOriginalFilename().replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
        String photoPath = uploadDir + safeFileName;

        photoFile.transferTo(new java.io.File(photoPath));

        // Save profile
        UserProfile profile = new UserProfile();
        profile.setUser(user);
        profile.setAadhar(aadhar);
        profile.setAge(age);
        profile.setPhoto(photoPath);

        profileRepository.save(profile);

        return ResponseEntity.ok(Map.of("message", "Profile saved successfully!"));
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    }
}


}
