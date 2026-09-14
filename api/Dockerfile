FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S czula && adduser -S czula -G czula
COPY --from=build /build/target/*.jar app.jar
USER czula
EXPOSE 8080
# Bez tego działa `spring.profiles.default: local` — profil lokalny trzyma bazę
# w pliku H2 obok aplikacji, czego /app nie pozwala założyć. Zmienna ustawiona
# na platformie i tak wygrywa.
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-XX:MaxRAM=512m -XX:MaxRAMPercentage=75"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
