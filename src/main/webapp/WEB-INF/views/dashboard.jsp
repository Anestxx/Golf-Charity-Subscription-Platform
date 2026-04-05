<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.util.List" %>
<%@ page import="com.golfcharity.model.User" %>
<%@ page import="com.golfcharity.model.Subscription" %>
<%@ page import="com.golfcharity.model.DashboardStats" %>
<%@ page import="com.golfcharity.model.Event" %>
<%@ page import="com.golfcharity.model.TeeSlot" %>
<%@ page import="com.golfcharity.model.LeaderboardEntry" %>
<%
request.setAttribute("pageTitle", "Dashboard");
User currentUser = (User) request.getAttribute("currentUser");
Subscription subscription = (Subscription) request.getAttribute("subscription");
DashboardStats stats = (DashboardStats) request.getAttribute("stats");
List<Event> upcomingEvents = (List<Event>) request.getAttribute("upcomingEvents");
List<TeeSlot> upcomingSlots = (List<TeeSlot>) request.getAttribute("upcomingSlots");
List<LeaderboardEntry> topDonors = (List<LeaderboardEntry>) request.getAttribute("topDonors");
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
                <p class="eyebrow">Dashboard</p>
                <h1>Welcome back, <%= currentUser == null ? "Member" : currentUser.getFullName() %>.</h1>
                <p>Monitor your membership, upcoming club moments, and the impact the community is making together.</p>
            </div>

            <section class="stats-grid">
                <article class="stat-card glass-panel reveal">
                    <span>Active Members</span>
                    <strong><%= stats == null ? 0 : stats.getActiveMembers() %></strong>
                </article>
                <article class="stat-card glass-panel reveal">
                    <span>Upcoming Events</span>
                    <strong><%= stats == null ? 0 : stats.getUpcomingEvents() %></strong>
                </article>
                <article class="stat-card glass-panel reveal">
                    <span>Open Tee Spots</span>
                    <strong><%= stats == null ? 0 : stats.getOpenTeeSlots() %></strong>
                </article>
                <article class="stat-card glass-panel reveal">
                    <span>Total Raised</span>
                    <strong><%= stats == null || stats.getTotalRaised() == null ? "0" : stats.getTotalRaised() %></strong>
                </article>
            </section>

            <section class="dashboard-grid">
                <article class="glass-panel reveal">
                    <p class="eyebrow">Subscription</p>
                    <h2><%= subscription == null ? "Not active" : subscription.getPlanName() %></h2>
                    <p>Status: <strong><%= subscription == null ? "Pending" : subscription.getStatus() %></strong></p>
                    <p>Renews through: <strong><%= subscription == null ? "n/a" : subscription.getEndDate() %></strong></p>
                    <a class="button button-light compact" href="<%= request.getContextPath() %>/account">Manage Account</a>
                </article>

                <article class="glass-panel reveal">
                    <p class="eyebrow">Upcoming Events</p>
                    <div class="stack-list">
                        <% for (Event event : upcomingEvents) { %>
                        <article class="list-card">
                            <div>
                                <h3><%= event.getTitle() %></h3>
                                <p><%= event.getLocation() %> · <%= event.getEventDate().toLocalDate() %></p>
                            </div>
                            <span class="pill"><%= event.getSeatsRemaining() %> left</span>
                        </article>
                        <% } %>
                    </div>
                </article>

                <article class="glass-panel reveal">
                    <p class="eyebrow">Tee Times</p>
                    <div class="stack-list">
                        <% for (TeeSlot slot : upcomingSlots) { %>
                        <article class="list-card">
                            <div>
                                <h3><%= slot.getCourseName() %></h3>
                                <p><%= slot.getSlotDate() %> · <%= slot.getSlotTime() %></p>
                            </div>
                            <span class="pill"><%= slot.getOpenSpots() %> open</span>
                        </article>
                        <% } %>
                    </div>
                </article>

                <article class="glass-panel reveal">
                    <p class="eyebrow">Top Donors</p>
                    <div class="leaderboard">
                        <% for (LeaderboardEntry entry : topDonors) { %>
                        <article class="leaderboard-row">
                            <div>
                                <h3><%= entry.getLabel() %></h3>
                                <p><%= entry.getSubLabel() %></p>
                            </div>
                            <strong><%= entry.getTotalAmount() %></strong>
                        </article>
                        <% } %>
                    </div>
                </article>
            </section>
        </section>
    </main>
    <%@ include file="fragments/footer.jspf" %>
</body>
</html>

