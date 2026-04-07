package com.golfcharity.web;

import com.golfcharity.dao.DashboardDao;
import com.golfcharity.dao.DonationDao;
import com.golfcharity.dao.EventDao;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

@WebServlet(urlPatterns = {""})
public class HomeServlet extends BaseServlet {
    private static final Logger LOGGER = Logger.getLogger(HomeServlet.class.getName());

    private final EventDao eventDao = new EventDao();
    private final DonationDao donationDao = new DonationDao();
    private final DashboardDao dashboardDao = new DashboardDao();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
        try {
            request.setAttribute("featuredEvents", eventDao.listUpcomingEvents(3));
            request.setAttribute("topDonors", donationDao.topDonors(3));
            request.setAttribute("stats", dashboardDao.fetchStats());
        } catch (SQLException ex) {
            LOGGER.log(Level.WARNING, "Landing page data unavailable. Rendering fallback content.", ex);
            request.setAttribute("featuredEvents", List.of());
            request.setAttribute("topDonors", List.of());
            request.setAttribute("stats", null);
            request.setAttribute(
                "landingWarning",
                "Live dashboard data is temporarily unavailable. Please try again in a moment."
            );
        }
        render(request, response, "index");
    }
}
