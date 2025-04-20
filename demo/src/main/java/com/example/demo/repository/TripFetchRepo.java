package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Trip;

@Repository
public interface TripFetchRepo extends JpaRepository<Trip, Long> {
    
    // Find all active trips
    @Query("SELECT t FROM Trip t WHERE t.status = 'available'")
    List<Trip> findAllActiveTrips();
    
    // You can add more specific queries if needed
}