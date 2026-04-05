package com.golfcharity.model;

import java.math.BigDecimal;

public class DashboardStats {
    private int activeMembers;
    private int upcomingEvents;
    private int openTeeSlots;
    private BigDecimal totalRaised;

    public int getActiveMembers() {
        return activeMembers;
    }

    public void setActiveMembers(int activeMembers) {
        this.activeMembers = activeMembers;
    }

    public int getUpcomingEvents() {
        return upcomingEvents;
    }

    public void setUpcomingEvents(int upcomingEvents) {
        this.upcomingEvents = upcomingEvents;
    }

    public int getOpenTeeSlots() {
        return openTeeSlots;
    }

    public void setOpenTeeSlots(int openTeeSlots) {
        this.openTeeSlots = openTeeSlots;
    }

    public BigDecimal getTotalRaised() {
        return totalRaised;
    }

    public void setTotalRaised(BigDecimal totalRaised) {
        this.totalRaised = totalRaised;
    }
}

