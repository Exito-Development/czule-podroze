# Budowanie i uruchomienie API w jednym pliku — obraz wynikowy zawiera
# wyłącznie JRE i jar aplikacji.
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
# Najpierw same zależności — warstwa cache'uje się między buildami.
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
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
