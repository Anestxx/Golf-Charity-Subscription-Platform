package com.golfcharity.web;

import com.golfcharity.dao.DonationDao;
import com.golfcharity.util.ReferenceCodeUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.math.BigDecimal;
import java.sql.SQLException;

@WebServlet("/donations")
public class DonationsServlet extends BaseServlet {
    private final DonationDao donationDao = new DonationDao();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
        try {
            request.setAttribute("donorLeaderboard", donationDao.topDonors(6));
            request.setAttribute("teamLeaderboard", donationDao.topTeams(6));
            request.setAttribute("totalRaised", donationDao.totalRaised());
            render(request, response, "donations");
        } catch (SQLException ex) {
            throw new ServletException("Unable to load donations page", ex);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
        try {
            BigDecimal amount = parseAmount(request.getParameter("amount"));
            if (amount == null || amount.signum() <= 0) {
                throw new IllegalArgumentException("Enter a donation amount greater than zero.");
            }

            donationDao.createDonation(
                currentUserId(request),
                amount,
                request.getParameter("dedication"),
                ReferenceCodeUtil.next("DON")
            );
            flash(request, "success", "Thank you. Your donation has been recorded.");
            redirect(request, response, "/donations");
        } catch (IllegalArgumentException ex) {
            request.setAttribute("formError", ex.getMessage());
            doGet(request, response);
        } catch (SQLException ex) {
            throw new ServletException("Unable to record donation", ex);
        }
    }
}

