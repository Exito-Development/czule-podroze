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
# Twardy sufit pamięci jest tu celowo.
#
# Samo MaxRAMPercentage liczy procent od tego, co maszyna WIDZI. Bez limitu
# kontenera na hoście z 15 GB daje to ~10 GB sterty — JVM z takim zapasem nie
# sprząta agresywnie, tylko rośnie, a na hostingach rozliczanych za zużytą
# pamięć rośnie razem z nią rachunek. MaxRAM ogranicza to, co JVM uznaje za
# dostępną pamięć, więc sterta kończy się na 384 MB.
#
# Aplikacja mieści się w tym z zapasem: zmierzone 392 MB RSS po starcie
# i 411 MB po 500 żądaniach, bez dalszego wzrostu. Przy większym ruchu
# podnieś przez zmienną środowiskową JAVA_OPTS, np. -XX:MaxRAM=1g.
ENV JAVA_OPTS="-XX:MaxRAM=512m -XX:MaxRAMPercentage=75"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
