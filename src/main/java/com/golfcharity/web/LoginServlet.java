package com.golfcharity.web;

import com.golfcharity.model.User;
import com.golfcharity.service.AuthService;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.sql.SQLException;

@WebServlet("/login")
public class LoginServlet extends BaseServlet {
    private final AuthService authService = new AuthService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
        render(request, response, "login");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
        try {
            User user = authService.authenticate(request.getParameter("email"), request.getParameter("password"));
            HttpSession session = request.getSession(true);
            session.setAttribute(SESSION_USER_ID, user.getId());
            session.setAttribute(SESSION_USER_NAME, user.getFullName());
            session.setAttribute(SESSION_USER_ROLE, user.getRole());
            flash(request, "success", "Welcome back, " + user.getFullName() + ".");
            redirect(request, response, "/dashboard");
        } catch (IllegalArgumentException ex) {
            request.setAttribute("formError", ex.getMessage());
            request.setAttribute("email", request.getParameter("email"));
            render(request, response, "login");
        } catch (SQLException ex) {
            throw new ServletException("Unable to process login", ex);
        }
    }
}

