# Golf Charity Platform

A full stack academic-style web application for membership management, event registration, tee-time booking, donations, payments, and community networking.

This implementation follows the project brief with:

- Java Servlets + JSP
- JDBC data access
- MySQL schema, seed data, trigger, and stored procedure
- A premium parallax interface with responsive glassmorphism panels

## Features

- Landing page with parallax hero and feature storytelling
- Session-based login and registration
- Dashboard with sidebar navigation, analytics cards, and summaries
- Event registration with seat validation
- Tee-time booking with capacity and one-booking-per-day checks
- Donation flow with donor and team leaderboards
- Member directory with search and privacy toggle
- Account page with subscription renewal
- Payment simulation with stored transaction history

## Project Structure

- `src/main/java/com/golfcharity` - Java source
- `src/main/webapp` - JSP views and static assets
- `sql/schema.sql` - MySQL schema, indexes, trigger, and stored procedure
- `sql/seed.sql` - Demo data

## Local Setup

1. Create a MySQL database named `golf_charity`.
2. Run `sql/schema.sql`.
3. Run `sql/seed.sql`.
4. Set environment variables if you do not want the defaults:

```powershell
$env:GOLF_DB_URL="jdbc:mysql://localhost:3306/golf_charity?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:GOLF_DB_USER="root"
$env:GOLF_DB_PASSWORD="root"
```

5. Build the WAR:

```powershell
mvn clean package
```

If your environment blocks Maven Central, configure a mirror:

```powershell
cp .mvn/settings.xml.example .mvn/settings.xml
# edit .mvn/settings.xml and replace the mirror URL
mvn -s .mvn/settings.xml clean package
```

6. Deploy `target/golf-charity-platform.war` to Tomcat 10+.

## Demo Accounts

- Member: `maya@example.com` / `member123`
- Admin: `admin@golfcharity.local` / `admin123`

## Notes

- This workspace did not include Maven or Tomcat, so the app is laid out as a standard WAR project ready to build in a Java web environment.
- The pure Java utility and data classes are kept framework-light so they can be validated independently of Tomcat.

## Render Deployment

Deploy this project to Render as a `Web Service` with `Language = Docker`.

Files used for deployment:

- `Dockerfile`
- `render-entrypoint.sh`

Render sets `PORT` automatically for the web service. The entrypoint script updates Tomcat to listen on that port.

### Environment Variables For The Web Service

Set these in your Render web service:

```text
GOLF_DB_URL=jdbc:mysql://<YOUR_RENDER_MYSQL_HOST>:3306/golf_charity?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
GOLF_DB_USER=<YOUR_MYSQL_USER>
GOLF_DB_PASSWORD=<YOUR_MYSQL_PASSWORD>
```

The application also auto-detects Railway-style MySQL variables if `GOLF_DB_*` is not set:

```text
MYSQLHOST
MYSQLPORT
MYSQLDATABASE
MYSQLUSER
MYSQLPASSWORD
MYSQL_URL (or DATABASE_URL)
```

Example:

```text
GOLF_DB_URL=jdbc:mysql://golf-mysql:3306/golf_charity?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
GOLF_DB_USER=golfapp
GOLF_DB_PASSWORD=change-this-password
```

### If You Also Run MySQL On Render

For the MySQL service itself, typical environment variables are:

```text
MYSQL_DATABASE=golf_charity
MYSQL_USER=golfapp
MYSQL_PASSWORD=change-this-password
MYSQL_ROOT_PASSWORD=change-this-root-password
```

After the database service is running, use its internal hostname in `GOLF_DB_URL`.

## Troubleshooting Build Errors

### `CONNECT tunnel failed, response 403` while downloading Maven plugins

This indicates your network proxy is blocking direct access to Maven Central.

Use a reachable Maven mirror:

1. Copy `.mvn/settings.xml.example` to `.mvn/settings.xml`.
2. Set `<url>` to your organization's artifact proxy (for example Nexus/Artifactory) or a permitted regional Maven mirror.
3. Run Maven with the settings file:

```bash
mvn -s .mvn/settings.xml test
```

If you do not have a mirror URL, ask your network/platform administrator for the correct Maven repository endpoint.
