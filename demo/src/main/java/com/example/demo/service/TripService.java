package com.example.demo.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.TripWithDistanceDTO;
import com.example.demo.model.Trip;
import com.example.demo.repository.TripFetchRepo;
//import com.example.demo.repository.TripRepository;

@Service
public class TripService {

    @Autowired
    private TripFetchRepo tripRepository;
    
    public List<TripWithDistanceDTO> findTripsByProximity(
            Double originLat, Double originLng, 
            Double destLat, Double destLng, 
            Integer limit) {
        
        // Get all active trips
        List<Trip> allTrips = tripRepository.findAllActiveTrips();
        List<TripWithDistanceDTO> tripsWithDistance = new ArrayList<>();
        
        for (Trip trip : allTrips) {
            // Calculate total distance (from origin to trip's origin + from destination to trip's destination)
            double originDistance = calculateDistance(
                originLat, originLng, 
                trip.getOriginLatitude(), trip.getOriginLongitude()
            );
            
            double destDistance = calculateDistance(
                destLat, destLng, 
                trip.getDestinationLatitude(), trip.getDestinationLongitude()
            );
            
            double totalDistance = originDistance + destDistance;
            tripsWithDistance.add(new TripWithDistanceDTO(trip, totalDistance));
        }
        
        // Sort by total distance and limit results
        return tripsWithDistance.stream()
                .sorted(Comparator.comparing(TripWithDistanceDTO::getDistance))
                .limit(limit != null ? limit : 10)
                .collect(Collectors.toList());
    }
    
    // Haversine formula to calculate distance between two points on a sphere
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // Earth's radius in kilometers
        final int R = 6371;
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
    }
}