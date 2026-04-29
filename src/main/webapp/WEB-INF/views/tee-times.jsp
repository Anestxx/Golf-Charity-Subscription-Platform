<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.Set" %>
<%@ page import="com.golfcharity.model.TeeSlot" %>
<%
request.setAttribute("pageTitle", "Tee Times");
List<TeeSlot> slots = (List<TeeSlot>) request.getAttribute("slots");
Set<Long> bookedSlotIds = (Set<Long>) request.getAttribute("bookedSlotIds");
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
                <p class="eyebrow">Tee-Time Booking</p>
                <h1>Reserve your next round with built-in slot constraints.</h1>
                <p>Members can hold one confirmed booking per day, and each tee sheet is capacity-aware.</p>
            </div>

            <section class="content-grid">
                <% for (TeeSlot slot : slots) { 
                    boolean booked = bookedSlotIds != null && bookedSlotIds.contains(slot.getId());
                    boolean full = slot.getOpenSpots() <= 0;
                %>
                <article class="glass-panel card reveal">
                    <p class="eyebrow"><%= slot.getSlotDate() %></p>
                    <h2><%= slot.getCourseName() %></h2>
                    <p>Tee off at <strong><%= slot.getSlotTime() %></strong> with up to <%= slot.getMaxPlayers() %> players.</p>
                    <div class="detail-row">
                        <span><%= slot.getOpenSpots() %> spots remaining</span>
                        <span>Fee <strong>Rs <%= slot.getPrice() %></strong></span>
                    </div>
                    <form method="post">
                        <input type="hidden" name="slotId" value="<%= slot.getId() %>">
                        <button class="button button-dark compact" type="submit" <%= (booked || full) ? "disabled" : "" %>>
                            <%= booked ? "Already Booked" : full ? "Fully Booked" : "Book Tee Time" %>
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

