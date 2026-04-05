<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%
request.setAttribute("pageTitle", "Register");
String fullName = request.getAttribute("fullName") == null ? "" : String.valueOf(request.getAttribute("fullName"));
String email = request.getAttribute("email") == null ? "" : String.valueOf(request.getAttribute("email"));
String teamName = request.getAttribute("teamName") == null ? "" : String.valueOf(request.getAttribute("teamName"));
String city = request.getAttribute("city") == null ? "" : String.valueOf(request.getAttribute("city"));
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <%@ include file="fragments/head.jspf" %>
</head>
<body class="auth-body">
    <%@ include file="fragments/nav.jspf" %>
    <main class="auth-shell">
        <section class="auth-card wide glass-panel reveal">
            <p class="eyebrow">New Membership</p>
            <h1>Create your golf and giving profile.</h1>
            <%@ include file="fragments/flash.jspf" %>
            <form method="post" class="form-grid two-column">
                <label>
                    <span>Full Name</span>
                    <input type="text" name="fullName" value="<%= fullName %>" required>
                </label>
                <label>
                    <span>Email</span>
                    <input type="email" name="email" value="<%= email %>" required>
                </label>
                <label>
                    <span>Password</span>
                    <input type="password" name="password" minlength="8" required>
                </label>
                <label>
                    <span>Home City</span>
                    <input type="text" name="city" value="<%= city %>">
                </label>
                <label class="full-span">
                    <span>Team or Foursome</span>
                    <input type="text" name="teamName" value="<%= teamName %>" placeholder="Optional">
                </label>
                <button class="button button-dark full-span" type="submit">Create Account</button>
            </form>
        </section>
    </main>
    <%@ include file="fragments/footer.jspf" %>
</body>
</html>

