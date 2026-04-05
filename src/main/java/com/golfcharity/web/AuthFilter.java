package com.golfcharity.web;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

@WebFilter(urlPatterns = {
    "/dashboard",
    "/events",
    "/tee-times",
    "/donations",
    "/directory",
    "/account",
    "/payments",
    "/logout"
})
public class AuthFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        HttpSession session = httpRequest.getSession(false);

        boolean authenticated = session != null && session.getAttribute(BaseServlet.SESSION_USER_ID) != null;
        if (!authenticated) {
            httpResponse.sendRedirect(httpRequest.getContextPath() + "/login");
            return;
        }

        chain.doFilter(request, response);
    }
}

