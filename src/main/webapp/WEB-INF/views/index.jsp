<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.util.List" %>
<%@ page import="com.golfcharity.model.Event" %>
<%@ page import="com.golfcharity.model.DashboardStats" %>
<%@ page import="com.golfcharity.model.LeaderboardEntry" %>
<%
request.setAttribute("pageTitle", "Home");
List<Event> featuredEvents = (List<Event>) request.getAttribute("featuredEvents");
List<LeaderboardEntry> topDonors = (List<LeaderboardEntry>) request.getAttribute("topDonors");
DashboardStats stats = (DashboardStats) request.getAttribute("stats");
String landingWarning = (String) request.getAttribute("landingWarning");
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <%@ include file="fragments/head.jspf" %>
</head>
<body class="marketing-body">
    <%@ include file="fragments/nav.jspf" %>
    <main>
        <% if (landingWarning != null && !landingWarning.isBlank()) { %>
        <section class="section-grid">
            <article class="feature-card glass-panel" style="border-left: 4px solid #f59e0b;">
                <p class="eyebrow">Notice</p>
                <p><%= landingWarning %></p>
            </article>
        </section>
        <% } %>

        <section class="hero" data-parallax>
            <div class="hero-copy glass-panel">
                <p class="eyebrow">Golf Charity Subscription Platform</p>
                <h1>Where premium play meets meaningful giving.</h1>
                <p class="lead">Manage memberships, register events, book tee times, contribute to causes, and connect with your club community through one polished experience.</p>
                <div class="button-row">
                    <a class="button button-dark" href="<%= request.getContextPath() %>/register">Start Membership</a>
                    <a class="button button-light" href="#features">Explore Features</a>
                </div>
            </div>
            <div class="metric-ribbon reveal">
                <article>
                    <span class="metric-value"><%= stats == null ? 0 : stats.getActiveMembers() %></span>
                    <span class="metric-label">Active Members</span>
                </article>
                <article>
                    <span class="metric-value"><%= stats == null ? 0 : stats.getUpcomingEvents() %></span>
                    <span class="metric-label">Upcoming Events</span>
                </article>
                <article>
                    <span class="metric-value"><%= stats == null || stats.getTotalRaised() == null ? "0" : stats.getTotalRaised() %></span>
                    <span class="metric-label">Raised for Charity</span>
                </article>
            </div>
        </section>

        <section id="features" class="section-grid">
            <article class="feature-card glass-panel reveal">
                <p class="eyebrow">Membership</p>
                <h2>Session-based access with subscription visibility.</h2>
                <p>Members can onboard quickly, keep their profile current, and renew inside their account without leaving the platform.</p>
            </article>
            <article class="feature-card glass-panel reveal">
                <p class="eyebrow">Events</p>
                <h2>Registration logic that respects inventory.</h2>
                <p>Seat validation protects your flagship tournaments, mixers, and fundraising rounds from overbooking.</p>
            </article>
            <article class="feature-card glass-panel reveal">
                <p class="eyebrow">Giving</p>
                <h2>Leaderboards that celebrate donors and teams.</h2>
                <p>Track individual generosity, surface team performance, and keep campaign energy visible throughout the season.</p>
            </article>
        </section>

        <section class="split-section">
            <div class="glass-panel reveal">
                <p class="eyebrow">Upcoming Events</p>
                <h2>Featured rounds and donor experiences.</h2>
                <div class="stack-list">
                    <% for (Event event : featuredEvents) { %>
                    <article class="list-card">
                        <div>
                            <h3><%= event.getTitle() %></h3>
                            <p><%= event.getLocation() %> · <%= event.getEventDate() == null ? "" : event.getEventDate().toLocalDate() %></p>
                        </div>
                        <span class="pill"><%= event.getSeatsRemaining() %> seats left</span>
                    </article>
                    <% } %>
                </div>
            </div>

            <div class="glass-panel reveal">
                <p class="eyebrow">Donor Spotlight</p>
                <h2>Top supporters this season.</h2>
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
            </div>
        </section>

        <section class="cta-band reveal">
            <p class="eyebrow">Ready to launch</p>
            <h2>Join the club, reserve your next round, and direct your impact.</h2>
            <a class="button button-dark" href="<%= request.getContextPath() %>/login">Member Login</a>
        </section>
    </main>
    <%@ include file="fragments/footer.jspf" %>
</body>
</html>
