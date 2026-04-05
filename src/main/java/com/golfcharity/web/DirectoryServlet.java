package com.golfcharity.web;

import com.golfcharity.dao.UserDao;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;

@WebServlet("/directory")
public class DirectoryServlet extends BaseServlet {
    private final UserDao userDao = new UserDao();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
        try {
            String query = request.getParameter("q");
            request.setAttribute("query", query == null ? "" : query);
            request.setAttribute("members", userDao.searchDirectory(query, currentUserId(request)));
            render(request, response, "directory");
        } catch (SQLException ex) {
            throw new ServletException("Unable to load directory", ex);
        }
    }
}

