// src/main/java/com/example/demo/controller/BookingController.java
package com.example.demo.controller;

import com.example.demo.model.Booking;
import com.example.demo.model.Trip;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.TripRepository;

import org.springframework.http.MediaType;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TripRepository tripRepository;

    // --- Existing Endpoints ---
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserBookings(@PathVariable int userId) {
       // ... existing code ...
       Map<String, Object> response = new HashMap<>();

        // Fetch bookings for the given userId
        var bookings = bookingRepository.findByUserId(userId);

        if (bookings.isEmpty()) {
            logger.info("No bookings found for userId: {}", userId);
        } else {
            logger.info("Bookings fetched for userId: {}", userId);
            bookings.forEach(booking -> logger.info("Booking: {}", booking));
        }

        // Map the bookings to response
        response.put("bookings", bookings.stream().map(booking -> {
            Map<String, Object> bookingData = new HashMap<>();
            bookingData.put("bookingId", booking.getBookingId());
            bookingData.put("productName", booking.getProductName());
            bookingData.put("status", booking.getStatus());

            // Fetch trip details through the ManyToOne relationship
            Trip trip = booking.getTrip();
            if (trip != null) {
                bookingData.put("origin", trip.getOrigin());
                bookingData.put("destination", trip.getDestination());
                logger.info("Trip details for booking {}: Origin - {}, Destination - {}",
                            booking.getBookingId(), trip.getOrigin(), trip.getDestination());
            } else {
                bookingData.put("origin", "Unknown");
                bookingData.put("destination", "Unknown");
                logger.warn("Trip details not found for booking: {}", booking.getBookingId());
            }

            return bookingData;
        }).toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/check/{userId}/ids")
    public ResponseEntity<?> getTripAndTravelerId(@PathVariable int userId) {
         // ... existing code ...
         Map<String, Object> response = new HashMap<>();

        try {
            // Fetch bookings for the given userId
            List<Booking> bookings = bookingRepository.findByUserId(userId);

            if (bookings.isEmpty()) {
                logger.info("No bookings found for userId: {}", userId);
                response.put("message", "No bookings found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
            }

            // Extract trip ID and traveler ID from the first booking
            Booking booking = bookings.get(0); // Ensure there's at least one booking
            Long tripId = booking.getTrip().getTripId();
            Long travelerId = booking.getTravelerId();
            Long bookingId = booking.getBookingId(); // Get the booking ID

            logger.info("Fetched tripId {}, travelerId {}, and bookingId {} for userId {}",
                        tripId, travelerId, bookingId, userId);

            response.put("tripId", tripId);
            response.put("travelerId", travelerId);
            response.put("bookingId", bookingId); // Include the booking ID in the response

            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(response);
        } catch (Exception e) {
            logger.error("Error fetching trip and traveler IDs for userId {}: {}", userId, e.getMessage());
            response.put("error", "An unexpected error occurred. Please try again later.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.APPLICATION_JSON)
                .body(response);
        }
    }

    @PutMapping("/trip/{tripId}/status")
    public ResponseEntity<?> updateBookingStatusByTripId(
        @PathVariable Long tripId,
        @RequestBody Map<String, String> statusRequest) {
        // ... existing code ...
        Map<String, Object> response = new HashMap<>();
        try {
            String newStatus = statusRequest.get("status");
            if (newStatus == null || newStatus.isEmpty()) {
                response.put("error", "Status cannot be empty");
                return ResponseEntity.badRequest().body(response);
            }

            // Find booking by tripId using the relationship
            Optional<Booking> bookingOpt = bookingRepository.findByTrip_TripId(tripId);
            if (bookingOpt.isPresent()) {
                Booking booking = bookingOpt.get();
                booking.setStatus(newStatus);
                bookingRepository.save(booking);

                Long bookingId = booking.getBookingId(); // Correct getter based on your entity

                logger.info("Updated booking status by tripId: tripId={}, bookingId={}, newStatus={}",
                            tripId, bookingId, newStatus);
                response.put("message", "Booking status updated successfully");
                response.put("tripId", tripId);
                response.put("bookingId", bookingId);
                response.put("status", newStatus);
                return ResponseEntity.ok(response);
            } else {
                logger.warn("Booking not found for tripId={}", tripId);
                response.put("error", "Booking not found for this trip");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            logger.error("Error updating booking status by tripId: tripId={}, error={}", tripId, e.getMessage());
            response.put("error", "Failed to update booking status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Map<String, Object> bookingRequest) {
         // ... existing code ...
         try {
            // Extract fields from the request body
            Long tripId = Long.valueOf(bookingRequest.get("tripId").toString());
            Long userId = Long.valueOf(bookingRequest.get("userId").toString());
            String productName = bookingRequest.get("productName").toString();
            Long travelerId = Long.valueOf(bookingRequest.get("travelerId").toString());
            String status = bookingRequest.get("status").toString();

            // Fetch the Trip entity using tripId
            Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found with ID: " + tripId));

            // Create a new Booking object
            Booking booking = new Booking(trip, userId, productName, travelerId, status);

            // Save the booking
            Booking savedBooking = bookingRepository.save(booking);
            logger.info("New booking created with ID: {}", savedBooking.getBookingId());

            // Return the created booking
            return ResponseEntity.ok(savedBooking);
        } catch (Exception e) {
            logger.error("Error while creating booking: {}", e.getMessage());
            return ResponseEntity.status(500).body("Failed to create booking: " + e.getMessage());
        }
    }

    // *** ADD THIS ENDPOINT ***
    @GetMapping("/sender/{travelerId}")
    public ResponseEntity<?> getSenderIdByTravelerId(@PathVariable Long travelerId) {
        logger.info("Request received to find senderId for travelerId: {}", travelerId);
        try {
            Optional<Booking> bookingOpt = bookingRepository.findFirstByTravelerId(travelerId);

            if (bookingOpt.isPresent()) {
                Long senderId = bookingOpt.get().getUserId(); // The userId from booking IS the senderId
                logger.info("Found senderId: {} for travelerId: {}", senderId, travelerId);
                Map<String, Long> response = new HashMap<>();
                response.put("senderId", senderId); // Return JSON like {"senderId": 123}
                return ResponseEntity.ok(response);
            } else {
                logger.warn("No booking found for travelerId: {}", travelerId);
                Map<String, String> response = new HashMap<>();
                response.put("error", "No booking associated with this traveler ID found.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
             logger.error("Error fetching senderId for travelerId {}: {}", travelerId, e.getMessage(), e); // Log stack trace
             Map<String, String> response = new HashMap<>();
             response.put("error", "An internal server error occurred.");
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}