package com.golfcharity.web;

import com.golfcharity.dao.DashboardDao;
import com.golfcharity.dao.DonationDao;
import com.golfcharity.dao.EventDao;
import com.golfcharity.dao.SubscriptionDao;
import com.golfcharity.dao.TeeTimeDao;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;

@WebServlet("/dashboard")
public class DashboardServlet extends BaseServlet {
    private final DashboardDao dashboardDao = new DashboardDao();
    private final EventDao eventDao = new EventDao();
    private final TeeTimeDao teeTimeDao = new TeeTimeDao();
    private final DonationDao donationDao = new DonationDao();
    private final SubscriptionDao subscriptionDao = new SubscriptionDao();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
        try {
            request.setAttribute("currentUser", currentUser(request));
            request.setAttribute("stats", dashboardDao.fetchStats());
            request.setAttribute("upcomingEvents", eventDao.listUpcomingEvents(4));
            request.setAttribute("upcomingSlots", teeTimeDao.listUpcomingSlots(4));
            request.setAttribute("topDonors", donationDao.topDonors(5));
            request.setAttribute("subscription", subscriptionDao.findLatestForUser(currentUserId(request)).orElse(null));
            render(request, response, "dashboard");
        } catch (SQLException ex) {
            throw new ServletException("Unable to load dashboard", ex);
        }
    }
}

