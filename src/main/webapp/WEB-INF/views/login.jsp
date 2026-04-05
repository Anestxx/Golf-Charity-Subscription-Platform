<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%
request.setAttribute("pageTitle", "Login");
String email = request.getAttribute("email") == null ? "" : String.valueOf(request.getAttribute("email"));
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <%@ include file="fragments/head.jspf" %>
</head>
<body class="auth-body">
    <%@ include file="fragments/nav.jspf" %>
    <main class="auth-shell">
        <section class="auth-card glass-panel reveal">
            <p class="eyebrow">Welcome Back</p>
            <h1>Sign in to your member console.</h1>
            <%@ include file="fragments/flash.jspf" %>
            <form method="post" class="form-grid">
                <label>
                    <span>Email</span>
                    <input type="email" name="email" value="<%= email %>" required>
                </label>
                <label>
                    <span>Password</span>
                    <input type="password" name="password" required>
                </label>
                <button class="button button-dark" type="submit">Login</button>
            </form>
            <p class="muted">Demo member: maya@example.com / member123</p>
        </section>
    </main>
    <%@ include file="fragments/footer.jspf" %>
</body>
</html>
