# Stage 1: Build JAR with Maven Wrapper
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw
# Download dependencies
RUN ./mvnw dependency:go-offline -B || true

COPY src/ ./src/
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /app/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]

