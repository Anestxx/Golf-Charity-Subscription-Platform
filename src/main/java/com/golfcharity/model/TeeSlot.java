package com.golfcharity.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class TeeSlot {
    private long id;
    private String courseName;
    private LocalDate slotDate;
    private LocalTime slotTime;
    private int maxPlayers;
    private int bookedPlayers;
    private BigDecimal price;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public LocalDate getSlotDate() {
        return slotDate;
    }

    public void setSlotDate(LocalDate slotDate) {
        this.slotDate = slotDate;
    }

    public LocalTime getSlotTime() {
        return slotTime;
    }

    public void setSlotTime(LocalTime slotTime) {
        this.slotTime = slotTime;
    }

    public int getMaxPlayers() {
        return maxPlayers;
    }

    public void setMaxPlayers(int maxPlayers) {
        this.maxPlayers = maxPlayers;
    }

    public int getBookedPlayers() {
        return bookedPlayers;
    }

    public void setBookedPlayers(int bookedPlayers) {
        this.bookedPlayers = bookedPlayers;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public int getOpenSpots() {
        return Math.max(0, maxPlayers - bookedPlayers);
    }
}

