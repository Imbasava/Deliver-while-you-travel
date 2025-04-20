// src/main/java/com/example/demo/repository/BookingRepository.java
package com.example.demo.repository;

import com.example.demo.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(int userId);
    Optional<Booking> findByTrip_TripId(Long tripId);

    // *** ADD THIS METHOD ***
    // Finds the first booking associated with a given travelerId
    Optional<Booking> findFirstByTravelerId(Long travelerId);
    //Optional<Booking> findFirstByTravelerId(Long travelerId);
}