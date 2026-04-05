<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.Set" %>
<%@ page import="com.golfcharity.model.Event" %>
<%
request.setAttribute("pageTitle", "Events");
List<Event> events = (List<Event>) request.getAttribute("events");
Set<Long> registeredEventIds = (Set<Long>) request.getAttribute("registeredEventIds");
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
                <p class="eyebrow">Events</p>
                <h1>Register for donor-facing rounds and club experiences.</h1>
                <p>Capacity is enforced in the backend, so the remaining seats shown here stay reliable.</p>
            </div>

            <section class="content-grid">
                <% for (Event event : events) { 
                    boolean registered = registeredEventIds != null && registeredEventIds.contains(event.getId());
                    boolean soldOut = event.getSeatsRemaining() <= 0;
                %>
                <article class="glass-panel card reveal">
                    <p class="eyebrow"><%= event.getEventDate().toLocalDate() %></p>
                    <h2><%= event.getTitle() %></h2>
                    <p><%= event.getDescription() %></p>
                    <div class="detail-row">
                        <span><%= event.getLocation() %></span>
                        <span>Fee <strong><%= event.getSeatFee() %></strong></span>
                    </div>
                    <div class="detail-row">
                        <span><%= event.getSeatsRemaining() %> seats left</span>
                        <span><%= event.getEventDate().toLocalTime() %></span>
                    </div>
                    <form method="post">
                        <input type="hidden" name="eventId" value="<%= event.getId() %>">
                        <button class="button button-dark compact" type="submit" <%= (registered || soldOut) ? "disabled" : "" %>>
                            <%= registered ? "Already Registered" : soldOut ? "Sold Out" : "Reserve Seat" %>
                        </button>
                    </form>
                </article>
                <% } %>
            </section>
        </section>
    </main>
    <%@ include file="fragments/footer.jspf" %>
</body>
</html>

