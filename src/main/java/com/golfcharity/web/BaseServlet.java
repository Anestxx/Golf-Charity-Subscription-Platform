package com.golfcharity.web;

import com.golfcharity.model.User;
import com.golfcharity.dao.UserDao;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.math.BigDecimal;
import java.sql.SQLException;

public abstract class BaseServlet extends HttpServlet {
    protected static final String SESSION_USER_ID = "userId";
    protected static final String SESSION_USER_NAME = "userName";
    protected static final String SESSION_USER_ROLE = "userRole";

    protected void render(HttpServletRequest request, HttpServletResponse response, String view)
        throws ServletException, IOException {
        enrichRequest(request);
        request.getRequestDispatcher("/WEB-INF/views/" + view + ".jsp").forward(request, response);
    }

    protected void redirect(HttpServletRequest request, HttpServletResponse response, String path) throws IOException {
        response.sendRedirect(request.getContextPath() + path);
    }

    protected void flash(HttpServletRequest request, String type, String message) {
        HttpSession session = request.getSession(true);
        session.setAttribute("flashType", type);
        session.setAttribute("flashMessage", message);
    }

    protected Long currentUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return null;
        }
        Object value = session.getAttribute(SESSION_USER_ID);
        return value instanceof Long ? (Long) value : null;
    }

    protected User currentUser(HttpServletRequest request) throws SQLException {
        Long userId = currentUserId(request);
        if (userId == null) {
            return null;
        }
        return new UserDao().findById(userId).orElse(null);
    }

    protected boolean isAuthenticated(HttpServletRequest request) {
        return currentUserId(request) != null;
    }

    protected BigDecimal parseAmount(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        return new BigDecimal(raw.trim());
    }

    protected Integer parseNullableInteger(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        return Integer.valueOf(raw.trim());
    }

    private void enrichRequest(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            Object flashType = session.getAttribute("flashType");
            Object flashMessage = session.getAttribute("flashMessage");
            if (flashType != null && flashMessage != null) {
                request.setAttribute("flashType", flashType);
                request.setAttribute("flashMessage", flashMessage);
                session.removeAttribute("flashType");
                session.removeAttribute("flashMessage");
            }

            request.setAttribute("viewerName", session.getAttribute(SESSION_USER_NAME));
            request.setAttribute("viewerRole", session.getAttribute(SESSION_USER_ROLE));
        }

        request.setAttribute("isAuthenticated", isAuthenticated(request));
        String currentPath = request.getRequestURI().substring(request.getContextPath().length());
        request.setAttribute("currentPath", currentPath.isBlank() ? "/" : currentPath);
    }
}

