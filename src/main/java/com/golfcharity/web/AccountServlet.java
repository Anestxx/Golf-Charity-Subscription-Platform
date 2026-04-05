package com.golfcharity.web;

import com.golfcharity.dao.SubscriptionDao;
import com.golfcharity.dao.TeamDao;
import com.golfcharity.dao.UserDao;
import com.golfcharity.service.MembershipService;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.math.BigDecimal;
import java.sql.SQLException;

@WebServlet("/account")
public class AccountServlet extends BaseServlet {
    private static final BigDecimal RENEWAL_AMOUNT = new BigDecimal("249.00");

    private final UserDao userDao = new UserDao();
    private final TeamDao teamDao = new TeamDao();
    private final SubscriptionDao subscriptionDao = new SubscriptionDao();
    private final MembershipService membershipService = new MembershipService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
        try {
            long userId = currentUserId(request);
            request.setAttribute("currentUser", currentUser(request));
            request.setAttribute("subscription", subscriptionDao.findLatestForUser(userId).orElse(null));
            render(request, response, "account");
        } catch (SQLException ex) {
            throw new ServletException("Unable to load account page", ex);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
        String action = request.getParameter("action");
        try {
            if ("renew".equalsIgnoreCase(action)) {
                long userId = currentUserId(request);
                membershipService.renewMembership(userId, RENEWAL_AMOUNT);
                flash(request, "success", "Subscription renewed for one year.");
            } else {
                String teamName = request.getParameter("teamName");
                String city = request.getParameter("city");
                Integer handicap = parseNullableInteger(request.getParameter("handicap"));
                String bio = request.getParameter("bio");
                boolean directoryVisible = "on".equalsIgnoreCase(request.getParameter("directoryVisible"));
                Long teamId = teamDao.findOrCreate(teamName, city);
                userDao.updateProfile(currentUserId(request), teamId, city, handicap, bio, directoryVisible);
                flash(request, "success", "Your profile has been updated.");
            }
            redirect(request, response, "/account");
        } catch (NumberFormatException ex) {
            request.setAttribute("formError", "Handicap must be a whole number.");
            doGet(request, response);
        } catch (SQLException ex) {
            throw new ServletException("Unable to update account", ex);
        }
    }
}
