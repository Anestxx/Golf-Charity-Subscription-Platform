package com.golfcharity.web;

import com.golfcharity.dao.PaymentDao;
import com.golfcharity.util.ReferenceCodeUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.math.BigDecimal;
import java.sql.SQLException;

@WebServlet("/payments")
public class PaymentsServlet extends BaseServlet {
    private final PaymentDao paymentDao = new PaymentDao();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
        try {
            request.setAttribute("payments", paymentDao.listByUser(currentUserId(request)));
            render(request, response, "payments");
        } catch (SQLException ex) {
            throw new ServletException("Unable to load payments page", ex);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
        try {
            BigDecimal amount = parseAmount(request.getParameter("amount"));
            if (amount == null || amount.signum() <= 0) {
                throw new IllegalArgumentException("Enter a payment amount greater than zero.");
            }

            String paymentType = request.getParameter("paymentType");
            if (paymentType == null || paymentType.isBlank()) {
                paymentType = "SPONSORSHIP";
            }

            paymentDao.createPayment(currentUserId(request), paymentType, amount, ReferenceCodeUtil.next("PAY"));
            flash(request, "success", "Payment simulation saved successfully.");
            redirect(request, response, "/payments");
        } catch (IllegalArgumentException ex) {
            request.setAttribute("formError", ex.getMessage());
            doGet(request, response);
        } catch (SQLException ex) {
            throw new ServletException("Unable to store payment", ex);
        }
    }
}

