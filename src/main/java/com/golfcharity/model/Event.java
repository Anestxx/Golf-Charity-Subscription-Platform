package com.golfcharity.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Event {
    private long id;
    private String title;
    private String description;
    private String location;
    private LocalDateTime eventDate;
    private int capacity;
    private int seatsTaken;
    private BigDecimal seatFee;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDateTime eventDate) {
        this.eventDate = eventDate;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public int getSeatsTaken() {
        return seatsTaken;
    }

    public void setSeatsTaken(int seatsTaken) {
        this.seatsTaken = seatsTaken;
    }

    public BigDecimal getSeatFee() {
        return seatFee;
    }

    public void setSeatFee(BigDecimal seatFee) {
        this.seatFee = seatFee;
    }

    public int getSeatsRemaining() {
        return Math.max(0, capacity - seatsTaken);
    }
}

