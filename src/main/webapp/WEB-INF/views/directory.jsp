<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.util.List" %>
<%@ page import="com.golfcharity.model.User" %>
<%
request.setAttribute("pageTitle", "Directory");
List<User> members = (List<User>) request.getAttribute("members");
String query = request.getAttribute("query") == null ? "" : String.valueOf(request.getAttribute("query"));
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
                <p class="eyebrow">Member Directory</p>
                <h1>Search the club network.</h1>
                <form method="get" class="search-row">
                    <input type="text" name="q" value="<%= query %>" placeholder="Search by member, city, or team">
                    <button class="button button-dark compact" type="submit">Search</button>
                </form>
            </div>

            <section class="content-grid">
                <% for (User member : members) { %>
                <article class="glass-panel card reveal">
                    <p class="eyebrow"><%= member.getTeamName() == null ? "Independent Member" : member.getTeamName() %></p>
                    <h2><%= member.getFullName() %></h2>
                    <p><%= member.getBio() == null ? "Premium member profile available for networking." : member.getBio() %></p>
                    <div class="detail-row">
                        <span><%= member.getCity() == null ? "City not listed" : member.getCity() %></span>
                        <span>HCP <strong><%= member.getHandicap() == null ? "-" : member.getHandicap() %></strong></span>
                    </div>
                </article>
                <% } %>
            </section>
        </section>
    </main>
    <%@ include file="fragments/footer.jspf" %>
</body>
</html>

