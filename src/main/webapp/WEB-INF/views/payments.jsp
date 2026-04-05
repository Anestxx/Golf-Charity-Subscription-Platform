<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.util.List" %>
<%@ page import="com.golfcharity.model.Payment" %>
<%
request.setAttribute("pageTitle", "Payments");
List<Payment> payments = (List<Payment>) request.getAttribute("payments");
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <%@ include file="fragments/head.jspf" %>
</head>
<body class="app-body">
    <%@ include file="fragments/nav.jspf" %>
    <main class="app-shell">
        <%@ include file="fragments/app-nav.jspf" %>
        <section class="app-main">
            <%@ include file="fragments/flash.jspf" %>
            <div class="page-heading glass-panel reveal">
                <p class="eyebrow">Payments</p>
                <h1>Simulate and store transaction history.</h1>
                <p>Use this area to log sponsorship, merchandise, or special collection payments.</p>
            </div>

            <section class="dashboard-grid">
                <article class="glass-panel reveal">
                    <p class="eyebrow">New Payment</p>
                    <form method="post" class="form-grid">
                        <label>
                            <span>Payment Type</span>
                            <select name="paymentType">
                                <option value="SPONSORSHIP">Sponsorship</option>
                                <option value="EVENT_FEE">Event Fee</option>
                                <option value="MERCH">Merchandise</option>
                            </select>
                        </label>
                        <label>
                            <span>Amount</span>
                            <input type="number" min="1" step="0.01" name="amount" required>
                        </label>
                        <button class="button button-dark" type="submit">Store Payment</button>
                    </form>
                </article>

                <article class="glass-panel reveal">
                    <p class="eyebrow">Payment History</p>
                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Reference</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                <% for (Payment payment : payments) { %>
                                <tr>
                                    <td><%= payment.getPaymentType() %></td>
                                    <td><%= payment.getReferenceCode() %></td>
                                    <td><%= payment.getAmount() %></td>
                                    <td><%= payment.getStatus() %></td>
                                    <td><%= payment.getCreatedAt() == null ? "" : payment.getCreatedAt().toLocalDate() %></td>
                                </tr>
                                <% } %>
                            </tbody>
                        </table>
                    </div>
                </article>
            </section>
        </section>
    </main>
    <%@ include file="fragments/footer.jspf" %>
</body>
</html>

