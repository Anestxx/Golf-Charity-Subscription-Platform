package com.golfcharity.web;

import com.golfcharity.dao.TeeTimeDao;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;

@WebServlet("/tee-times")
public class TeeTimeServlet extends BaseServlet {
    private final TeeTimeDao teeTimeDao = new TeeTimeDao();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
        try {
            long userId = currentUserId(request);
            request.setAttribute("slots", teeTimeDao.listUpcomingSlots(20));
            request.setAttribute("bookedSlotIds", teeTimeDao.findBookedSlotIds(userId));
            render(request, response, "tee-times");
        } catch (SQLException ex) {
            throw new ServletException("Unable to load tee times", ex);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
        try {
            long slotId = Long.parseLong(request.getParameter("slotId"));
            boolean booked = teeTimeDao.bookSlot(currentUserId(request), slotId);
            if (booked) {
                flash(request, "success", "Your tee time has been reserved.");
            } else {
                flash(request, "warning", "That slot is full, already booked, or you already have a round that day.");
            }
            redirect(request, response, "/tee-times");
        } catch (NumberFormatException ex) {
            flash(request, "warning", "Choose a valid tee slot before booking.");
            redirect(request, response, "/tee-times");
        } catch (SQLException ex) {
            throw new ServletException("Unable to book tee time", ex);
        }
    }
}

