# Stage 1: Build JAR with Pre-installed Maven and JDK 21
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

COPY pom.xml ./
# Cache dependencies in Docker layer
RUN mvn dependency:go-offline -B || true

COPY src/ ./src/
RUN mvn clean package -DskipTests

# Stage 2: Minimal Runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /app/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
