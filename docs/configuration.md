# Configuration Guide

This document describes all configuration options available in the Reeve Indexing Example application.

## Configuration Files

### Primary Configuration: `application.yml`

The main configuration file located at `src/main/resources/application.yml`:

```yaml
apiPrefix: /api/v1
spring:
  mvc:
    problemdetails:
      enabled: true
  application:
    name: reeve-indexing-example
  flyway:
    locations: classpath:db/store/{vendor}
    out-of-order: true
  datasource:
    url: jdbc:postgresql://localhost:5432/reeve-verifier?currentSchema=reeve
    username: postgres
    password: postgres
  jackson:
    property-naming-strategy: SNAKE_CASE
  jpa:
    hibernate:
      ddl-auto: update
reeve:
  label: 1447
store:
  cardano:
    host: backbone.mainnet.cardanofoundation.org
    port: 3001
    protocol-magic: 764824073
    sync-start-slot: 159983856
    sync-start-blockhash: 739cbc4d7ae7a15805ce2ede010b3a24c6d2e18489e3940731822f9f5488d670
  executor:
    enable-parallel-processing: true
```

## Configuration Sections

### 1. API Configuration

#### API Prefix
```yaml
apiPrefix: /api/v1
```
- **Purpose**: Sets the base path for all REST API endpoints
- **Default**: `/api/v1`
- **Usage**: All endpoints will be prefixed with this value

### 2. Spring Framework Configuration

#### MVC Configuration
```yaml
spring:
  mvc:
    problemdetails:
      enabled: true
```
- **Purpose**: Enables RFC 7807 Problem Details for HTTP error responses
- **Default**: `true`
- **Benefits**: Standardized error response format

#### Application Name
```yaml
spring:
  application:
    name: reeve-indexing-example
```
- **Purpose**: Identifies the application in logs and monitoring
- **Usage**: Used by Spring Boot Actuator and other tools

#### JSON Serialization
```yaml
spring:
  jackson:
    property-naming-strategy: SNAKE_CASE
```
- **Purpose**: Converts camelCase Java properties to snake_case JSON
- **Example**: `organisationId` becomes `organisation_id` in JSON responses

### 3. Database Configuration

#### Data Source
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/reeve-verifier?currentSchema=reeve
    username: postgres
    password: postgres
```

**Configuration Options**:
- `url`: JDBC connection string
  - **Host**: Database server hostname
  - **Port**: Database server port (default: 5432)
  - **Database**: Database name (`reeve-verifier`)
  - **Schema**: PostgreSQL schema (`reeve`)
- `username`: Database username
- `password`: Database password

**Environment Variables Override**:
```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://prod-db:5432/reeve?currentSchema=reeve
export SPRING_DATASOURCE_USERNAME=reeve_user
export SPRING_DATASOURCE_PASSWORD=secure_password
```

#### JPA Configuration
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update
```

**DDL Auto Options**:
- `validate`: Validates schema, no changes
- `update`: Updates schema if needed (development)
- `create`: Creates schema, drops existing
- `create-drop`: Creates schema, drops on shutdown
- `none`: No schema management

**Production Recommendation**: Use `validate` with proper database migrations.

#### Flyway Migration
```yaml
spring:
  flyway:
    locations: classpath:db/store/{vendor}
    out-of-order: true
```
- **Purpose**: Database schema migration management
- **Locations**: Migration scripts location (from Yaci Store)
- **Out-of-order**: Allows running migrations out of sequence

### 4. Reeve-Specific Configuration

#### Metadata Label
```yaml
reeve:
  label: 1447
```
- **Purpose**: Cardano metadata label used by Reeve transactions
- **Value**: `1447` (official Reeve label)
- **Usage**: Filters blockchain transactions by this metadata label

### 5. Yaci Store Configuration

#### Cardano Network
```yaml
store:
  cardano:
    host: backbone.mainnet.cardanofoundation.org
    port: 3001
    protocol-magic: 764824073
    sync-start-slot: 159983856
    sync-start-blockhash: 739cbc4d7ae7a15805ce2ede010b3a24c6d2e18489e3940731822f9f5488d670
```

**Network Configuration**:
- `host`: Cardano node hostname
- `port`: Cardano node port
- `protocol-magic`: Network identifier
  - Mainnet: `764824073`
  - Testnet: `1097911063`
  - Preview: `2`
  - Preprod: `1`

**Sync Configuration**:
- `sync-start-slot`: Starting slot number for synchronization
- `sync-start-blockhash`: Block hash corresponding to the starting slot
- **Purpose**: Defines where to start indexing from the blockchain

#### Executor Configuration
```yaml
store:
  executor:
    enable-parallel-processing: true
```
- **Purpose**: Enables parallel processing of blockchain data
- **Default**: `true`
- **Impact**: Improves indexing performance but uses more CPU/memory

## Environment-Specific Configuration

### Development Environment

**File**: `application-dev.yml` (if created)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/reeve-verifier?currentSchema=reeve
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
logging:
  level:
    org.cardanofoundation: DEBUG
    com.bloxbean.cardano: INFO
```

### Production Environment

**File**: `application-prod.yml` (if created)
```yaml
spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USERNAME}
    password: ${DATABASE_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate
logging:
  level:
    org.cardanofoundation: INFO
    com.bloxbean.cardano: WARN
```

### Docker Environment

Docker Compose sets these environment variables:
```yaml
environment:
  - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres-db:5432/reeve-verifier?currentSchema=reeve
  - SPRING_DATASOURCE_USERNAME=postgres
  - SPRING_DATASOURCE_PASSWORD=postgres
```

## Advanced Configuration

### Connection Pool Settings

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      idle-timeout: 300000
      max-lifetime: 1800000
      connection-timeout: 30000
```

### JPA Performance Tuning

```yaml
spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 25
        order_inserts: true
        order_updates: true
        batch_versioned_data: true
```

### Logging Configuration

```yaml
logging:
  level:
    org.cardanofoundation.reeve: INFO
    com.bloxbean.cardano.yaci: INFO
    org.springframework.web: DEBUG
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: logs/reeve-indexer.log
```

### Actuator Configuration

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,env
  endpoint:
    health:
      show-details: when-authorized
```

## Security Configuration

### CORS Configuration

Currently configured in `WebConfig.java`:
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("*")
                        .allowedMethods("*")
                        .allowedHeaders("*");
            }
        };
    }
}
```

**Production CORS Configuration**:
```yaml
cors:
  allowed-origins: 
    - https://your-frontend-domain.com
    - https://api.your-domain.com
  allowed-methods: GET,POST,PUT,DELETE
  allowed-headers: "*"
  allow-credentials: true
```

## Network-Specific Configurations

### Mainnet Configuration (Current)
```yaml
store:
  cardano:
    host: backbone.mainnet.cardanofoundation.org
    port: 3001
    protocol-magic: 764824073
```

### Testnet Configuration
```yaml
store:
  cardano:
    host: backbone.testnet.cardanofoundation.org
    port: 3001
    protocol-magic: 1097911063
    sync-start-slot: 0
```

### Preview Testnet Configuration
```yaml
store:
  cardano:
    host: backbone.preview.cardanofoundation.org
    port: 3001
    protocol-magic: 2
    sync-start-slot: 0
```

## Performance Tuning

### Database Performance
```yaml
spring:
  jpa:
    properties:
      hibernate:
        connection:
          provider_disables_autocommit: true
        cache:
          use_second_level_cache: false
          use_query_cache: false
        jdbc:
          time_zone: UTC
```

### Memory Settings
```bash
# JVM options for production
export JAVA_OPTS="-Xms512m -Xmx2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
```

## Troubleshooting Configuration

### Common Issues and Solutions

#### Database Connection Issues
```yaml
spring:
  datasource:
    hikari:
      connection-test-query: SELECT 1
      validation-timeout: 3000
```

#### Slow Sync Performance
```yaml
store:
  executor:
    enable-parallel-processing: true
    block-processing-threads: 4  # Adjust based on CPU cores
```

#### Memory Issues
```yaml
spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          fetch_size: 50
          batch_size: 25
```

## Configuration Validation

The application validates configuration at startup. Key validations:

1. **Database Connection**: Tests connection during startup
2. **Cardano Network**: Validates network connectivity
3. **Required Properties**: Ensures all mandatory properties are set
4. **Schema Validation**: Validates database schema compatibility

## Best Practices

1. **Environment Variables**: Use environment variables for sensitive data
2. **Profiles**: Use Spring profiles for environment-specific configuration
3. **Externalization**: Keep configuration outside of JAR files
4. **Documentation**: Document all custom configuration properties
5. **Validation**: Validate configuration at application startup
6. **Monitoring**: Monitor configuration changes in production
