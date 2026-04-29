<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="com.golfcharity.model.User" %>
<%@ page import="com.golfcharity.model.Subscription" %>
<%
request.setAttribute("pageTitle", "My Account");
User currentUser = (User) request.getAttribute("currentUser");
Subscription subscription = (Subscription) request.getAttribute("subscription");
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
                <p class="eyebrow">My Account</p>
                <h1>Keep your membership profile current.</h1>
                <p>Update your public directory preferences, golfing profile, and renewal status from one place.</p>
            </div>

            <section class="dashboard-grid">
                <article class="glass-panel reveal">
                    <p class="eyebrow">Subscription Status</p>
                    <h2><%= subscription == null ? "No active membership" : subscription.getPlanName() %></h2>
                    <p>Status: <strong><%= subscription == null ? "Pending" : subscription.getStatus() %></strong></p>
                    <p>Ends on: <strong><%= subscription == null ? "n/a" : subscription.getEndDate() %></strong></p>
                    <form method="post">
                        <input type="hidden" name="action" value="renew">
                        <button class="button button-dark compact" type="submit">Renew for Rs 249.00</button>
                    </form>
                </article>

                <article class="glass-panel reveal">
                    <p class="eyebrow">Profile Settings</p>
                    <form method="post" class="form-grid">
                        <input type="hidden" name="action" value="profile">
                        <label>
                            <span>Team Name</span>
                            <input type="text" name="teamName" value="<%= currentUser == null || currentUser.getTeamName() == null ? "" : currentUser.getTeamName() %>">
                        </label>
                        <label>
                            <span>City</span>
                            <input type="text" name="city" value="<%= currentUser == null || currentUser.getCity() == null ? "" : currentUser.getCity() %>">
                        </label>
                        <label>
                            <span>Handicap</span>
                            <input type="number" name="handicap" value="<%= currentUser == null || currentUser.getHandicap() == null ? "" : currentUser.getHandicap() %>">
                        </label>
                        <label class="full-span">
                            <span>Bio</span>
                            <textarea name="bio" rows="4"><%= currentUser == null || currentUser.getBio() == null ? "" : currentUser.getBio() %></textarea>
                        </label>
                        <label class="checkbox-row full-span">
                            <input type="checkbox" name="directoryVisible" <%= currentUser != null && currentUser.isDirectoryVisible() ? "checked" : "" %>>
                            <span>Show my profile in the member directory</span>
                        </label>
                        <button class="button button-dark full-span" type="submit">Save Changes</button>
                    </form>
                </article>
            </section>
        </section>
    </main>
    <%@ include file="fragments/footer.jspf" %>
</body>
</html>

