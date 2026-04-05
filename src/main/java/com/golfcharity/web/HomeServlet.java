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

@WebServlet(urlPatterns = {""})
public class HomeServlet extends BaseServlet {
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
            render(request, response, "index");
        } catch (SQLException ex) {
            throw new ServletException("Unable to load landing page", ex);
        }
    }
}
