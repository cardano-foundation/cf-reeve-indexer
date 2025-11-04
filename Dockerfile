FROM eclipse-temurin:21 AS build

WORKDIR /app
COPY . /app

RUN ./gradlew build -x test --no-daemon

FROM eclipse-temurin:21-jre AS backend
COPY --from=build /app/build/libs/*-all.jar /app.jar
COPY --from=build /app/aiken/plutus.json /app/plutus.json
# Install libsodium system library so lazysodium can load it
RUN apt-get update && apt-get install -y libsodium23 && rm -rf /var/lib/apt/lists/*
ENTRYPOINT ["java", "--enable-preview", "-jar", "/app.jar"]
