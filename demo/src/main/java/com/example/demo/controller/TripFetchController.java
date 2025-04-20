package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.TripWithDistanceDTO;
import com.example.demo.service.TripService;

@RestController
@RequestMapping("/api/trips")
public class TripFetchController {

    @Autowired
    private TripService tripService;
    
    @GetMapping("/nearby")
    public ResponseEntity<List<TripWithDistanceDTO>> findNearbyTrips(
            @RequestParam("originLat") Double originLat,
            @RequestParam("originLng") Double originLng,
            @RequestParam("destLat") Double destLat,
            @RequestParam("destLng") Double destLng,
            @RequestParam(value = "limit", required = false) Integer limit) {
        
        List<TripWithDistanceDTO> nearbyTrips = tripService.findTripsByProximity(
                originLat, originLng, destLat, destLng, limit);
        
        return ResponseEntity.ok(nearbyTrips);
    }
}