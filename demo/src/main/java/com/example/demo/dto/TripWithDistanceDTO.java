package com.example.demo.dto;

import com.example.demo.model.Trip;

public class TripWithDistanceDTO {
    private Trip trip;
    private Double distance;
    
    public TripWithDistanceDTO(Trip trip, Double distance) {
        this.trip = trip;
        this.distance = distance;
    }

    public Trip getTrip() {
        return trip;
    }

    public void setTrip(Trip trip) {
        this.trip = trip;
    }

    public Double getDistance() {
        return distance;
    }

    public void setDistance(Double distance) {
        this.distance = distance;
    }
}