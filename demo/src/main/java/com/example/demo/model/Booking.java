package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id", nullable = false, unique = true)
    private Long bookingId;

    @ManyToOne
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "product_name", nullable = false, length = 50)
    private String productName;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "traveler_id", nullable = false)  // New field
    private Long travelerId;  // New field

    // Default Constructor
    public Booking() {}

    // Parameterized Constructor
    public Booking(Trip trip, Long userId,String productName, Long travelerId, String status) {
        this.trip = trip;
        this.userId = userId;
        this.productName = productName;
        this.travelerId = travelerId;
        this.status = status;
        
    }

    // Getters and Setters
    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Trip getTrip() {
        return trip;
    }

    public void setTrip(Trip trip) {
        this.trip = trip;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Long getTravelerId() {
        return travelerId;
    }
    
    public void setTravelerId(Long travelerId) {
        this.travelerId = travelerId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
