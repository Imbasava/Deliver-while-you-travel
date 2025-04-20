package com.example.demo.controller;
import com.example.demo.model.Trip;
import com.example.demo.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "http://localhost:3000") // or "*" if you're feeling wild
public class TripController {
    @Autowired
    private TripRepository tripRepository;
    
    @PostMapping
    public ResponseEntity<?> createTrip(@RequestBody Trip trip) {
        try {
            System.out.println("Received Trip: " + trip.toString());
            Trip savedTrip = tripRepository.save(trip);
            return ResponseEntity.ok(savedTrip);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to create trip: " + e.getMessage());
        }
    }
    
    // Add endpoint to get a trip by ID
    @GetMapping("/{tripId}")
    public ResponseEntity<?> getTripById(@PathVariable Long tripId) {
        try {
            return tripRepository.findById(tripId)
                .map(trip -> ResponseEntity.ok(trip))
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching trip: " + e.getMessage());
        }
    }
}