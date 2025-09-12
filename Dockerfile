FROM eclipse-temurin:21-jdk-jammy AS build

WORKDIR /app
COPY . /app

RUN ./gradlew build -x test --no-daemon

FROM eclipse-temurin:21-jre-jammy as backend
COPY --from=build /app/build/libs/*-all.jar /app.jar
ENTRYPOINT ["java", "--enable-preview", "-jar", "/app.jar"]
