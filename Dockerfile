FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml ./
COPY src ./src

RUN mvn -B clean package -DskipTests

FROM tomcat:10.1-jdk21-temurin

ENV CATALINA_HOME=/usr/local/tomcat

RUN rm -rf "$CATALINA_HOME"/webapps/*

COPY --from=build /app/target/golf-charity-platform.war "$CATALINA_HOME"/webapps/ROOT.war
COPY render-entrypoint.sh /usr/local/bin/render-entrypoint.sh

RUN chmod +x /usr/local/bin/render-entrypoint.sh

EXPOSE 10000

ENTRYPOINT ["/usr/local/bin/render-entrypoint.sh"]

