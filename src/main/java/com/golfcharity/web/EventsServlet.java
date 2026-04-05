package com.golfcharity.web;

import com.golfcharity.dao.EventDao;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;

@WebServlet("/events")
public class EventsServlet extends BaseServlet {
    private final EventDao eventDao = new EventDao();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
        try {
            long userId = currentUserId(request);
            request.setAttribute("events", eventDao.listUpcomingEvents(20));
            request.setAttribute("registeredEventIds", eventDao.findRegisteredEventIds(userId));
            render(request, response, "events");
        } catch (SQLException ex) {
            throw new ServletException("Unable to load events", ex);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
        try {
            long eventId = Long.parseLong(request.getParameter("eventId"));
            boolean registered = eventDao.registerForEvent(currentUserId(request), eventId);
            if (registered) {
                flash(request, "success", "Your event seat is confirmed.");
            } else {
                flash(request, "warning", "That seat is no longer available or you are already registered.");
            }
            redirect(request, response, "/events");
        } catch (NumberFormatException ex) {
            flash(request, "warning", "Choose a valid event before registering.");
            redirect(request, response, "/events");
        } catch (SQLException ex) {
            throw new ServletException("Unable to register for event", ex);
        }
    }
}

