<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.util.List" %>
<%@ page import="com.golfcharity.model.LeaderboardEntry" %>
<%
request.setAttribute("pageTitle", "Donations");
List<LeaderboardEntry> donorLeaderboard = (List<LeaderboardEntry>) request.getAttribute("donorLeaderboard");
List<LeaderboardEntry> teamLeaderboard = (List<LeaderboardEntry>) request.getAttribute("teamLeaderboard");
Object totalRaised = request.getAttribute("totalRaised");
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
                <p class="eyebrow">Donations</p>
                <h1>Fundraise with visible momentum.</h1>
                <p>Total raised so far: <strong>Rs <%= totalRaised == null ? "0" : totalRaised %></strong></p>
            </div>

            <section class="dashboard-grid">
                <article class="glass-panel reveal">
                    <p class="eyebrow">Make a Donation</p>
                    <h2>Submit a contribution</h2>
                    <form method="post" class="form-grid">
                        <label>
                            <span>Amount</span>
                            <input type="number" min="1" step="0.01" name="amount" required>
                        </label>
                        <label>
                            <span>Dedication</span>
                            <input type="text" name="dedication" placeholder="Optional message">
                        </label>
                        <button class="button button-dark" type="submit">Record Donation</button>
                    </form>
                </article>

                <article class="glass-panel reveal">
                    <p class="eyebrow">Top Donors</p>
                    <div class="leaderboard">
                        <% for (LeaderboardEntry entry : donorLeaderboard) { %>
                        <article class="leaderboard-row">
                            <div>
                                <h3><%= entry.getLabel() %></h3>
                                <p><%= entry.getSubLabel() %> · <%= entry.getContributionCount() %> gifts</p>
                            </div>
                            <strong>Rs <%= entry.getTotalAmount() %></strong>
                        </article>
                        <% } %>
                    </div>
                </article>

                <article class="glass-panel reveal">
                    <p class="eyebrow">Team Leaderboard</p>
                    <div class="leaderboard">
                        <% for (LeaderboardEntry entry : teamLeaderboard) { %>
                        <article class="leaderboard-row">
                            <div>
                                <h3><%= entry.getLabel() %></h3>
                                <p><%= entry.getSubLabel() %> · <%= entry.getContributionCount() %> members</p>
                            </div>
                            <strong>Rs <%= entry.getTotalAmount() %></strong>
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

