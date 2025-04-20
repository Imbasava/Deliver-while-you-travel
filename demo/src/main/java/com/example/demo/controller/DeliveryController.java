package com.example.demo.controller;

import com.example.demo.model.Delivery;
import com.example.demo.repository.DeliveryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000") // Update to match your frontend URL
@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    @Autowired
    private DeliveryRepository deliveryRepository;

    // Endpoint to create a new delivery
    @PostMapping
    public ResponseEntity<?> createDelivery(@RequestBody Delivery delivery) {
        try {
            // Save delivery details to the database
            Delivery savedDelivery = deliveryRepository.save(delivery);
            return ResponseEntity.ok(savedDelivery);
        } catch (Exception e) {
            // Handle errors and return appropriate response
            return ResponseEntity.status(400).body("Error saving delivery: " + e.getMessage());
        }
    }

    // Endpoint to get all deliveries
    @GetMapping
    public ResponseEntity<List<Delivery>> getAllDeliveries() {
        List<Delivery> deliveries = deliveryRepository.findAll();
        return ResponseEntity.ok(deliveries);
    }
}
