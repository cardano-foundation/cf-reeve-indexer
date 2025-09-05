FROM eclipse-temurin:21-jdk-jammy AS build

# Accept build arguments
ARG GRADLE_OPTS

WORKDIR /app

# Install ca-certificates
RUN apt-get update && \
    apt-get install -y ca-certificates && \
    update-ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY . /app

# Build with proper permissions and GRADLE_OPTS
RUN chmod +x ./gradlew && \
    env GRADLE_OPTS="${GRADLE_OPTS}" ./gradlew build -x test --no-daemon

FROM eclipse-temurin:21-jre-jammy AS backend
COPY --from=build /app/build/libs/*SNAPSHOT.jar /app.jar
ENTRYPOINT ["java", "--enable-preview", "-jar", "/app.jar"]
