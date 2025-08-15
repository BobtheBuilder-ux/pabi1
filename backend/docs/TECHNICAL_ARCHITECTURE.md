# Technical Architecture

## Layered Architecture Implementation

The PBI API follows a traditional layered architecture pattern to achieve clear separation of concerns, maintainability, and simplicity.

### Controller Layer (Presentation)
**Location**: `src/main/kotlin/com/pbi/api/controller/`

- **REST Controllers**: Handle HTTP requests and responses using suspend functions
- **Request/Response DTOs**: Data transfer objects for API communication
- **Input Validation**: Request parameter and body validation using Jakarta validation
- **HTTP Status Mapping**: Convert domain exceptions to appropriate HTTP responses
- **OpenAPI Documentation**: Swagger annotations for API documentation

**Implemented Controllers:**

- `AuthController` - Authentication and registration
- `ProfileController` - User profile management
- `SearchController` - User search functionality
- `ConnectionController` - Connection management
- `CategoryController` - Category operations
- `BoostController` - Boost functionality
- `BoostPlanController` - Boost plan management

### Service Layer (Business Logic)
**Location**: `src/main/kotlin/com/pbi/api/service/`

- **Business Services**: Core business logic implementation
- **Domain Models**: Business entities and value objects
- **Business Rules**: Validation and processing logic
- **External Service Integration**: Email and file upload services

**Implemented Services:**

- `AuthenticationService` - User authentication and registration
- `ProfileService` - Profile management and media uploads
- `SearchService` - User search with filtering and boosting
- `ConnectionService` - Connection request management
- `CategoryService` - Category hierarchy management
- `BoostService` - Industry boosting functionality
- `BoostPlanService` - Boost plan management
- `EmailService` - Email notifications via Resend
- `FileUploadService` - Image uploads via Cloudinary
- `TokenService` - JWT token management
- `UserService` - Core user operations

### Repository Layer (Data Access)
**Location**: `src/main/kotlin/com/pbi/api/repository/`

- **Data Repositories**: Database access using JOOQ with coroutines
- **Data Models**: Database entity mapping using JOOQ generated classes
- **Query Logic**: Type-safe SQL query construction and execution
- **Transaction Management**: Coroutine-based transaction handling

### Configuration Layer (Infrastructure)
**Location**: `src/main/kotlin/com/pbi/api/config/`

- **Application Configuration**: Database, Security, JWT setup
- **Dependency Injection**: Bean configuration and wiring
- **External Service Configuration**: Email, file storage setup
- **Cross-cutting Concerns**: Exception handling, logging, security

**Implemented Configurations:**

- `SecurityConfig` - JWT authentication and authorization
- `DatabaseConfig` - R2DBC and transaction management
- `CloudinaryConfig` - Image upload service configuration
- `SwaggerConfig` - OpenAPI documentation setup
- `WebConfig` - CORS and web configuration

## Architecture Benefits

### Simplicity and Clarity

- **Controller Layer**: Clear entry points for HTTP requests with suspend functions
- **Service Layer**: Centralized business logic with coroutine-based async operations
- **Repository Layer**: Type-safe database access with JOOQ
- **Configuration Layer**: Organized infrastructure concerns

### Maintainability
- Clear layer boundaries with defined responsibilities
- Easy to understand code organization
- Straightforward dependency flow from top to bottom
- Simple testing strategy with layer-specific tests

### Framework Integration
- Natural Spring Boot architecture alignment
- Easy dependency injection and bean management
- Spring Security with JWT authentication
- Spring WebFlux reactive patterns with Kotlin coroutines

## Key Implementation Features

### Security Implementation

- **JWT-based authentication** - Custom JWT token provider and filter
- **Password hashing** - BCrypt password encoding
- **Input validation** - Jakarta validation annotations
- **CORS configuration** - Cross-origin resource sharing setup
- **Role-based access** - User type-based authorization

### Performance Features

- **Reactive programming** - WebFlux with Kotlin coroutines
- **Database optimization** - JOOQ for type-safe queries
- **Connection pooling** - R2DBC connection management
- **Image optimization** - Cloudinary integration
- **Cursor-based pagination** - Efficient result pagination

### Search Implementation

- **Full-text search** - PostgreSQL text search capabilities
- **Geographic filtering** - Country-based search
- **Category filtering** - Industry/category-based search
- **Boost prioritization** - Enhanced visibility for boosted profiles
- **Multi-criteria search** - Combined search parameters

## Technology Stack

### Core Framework
- **Spring Boot 3.5+** - Application framework
- **Spring WebFlux** - Reactive web framework
- **Kotlin 2.2** - Primary programming language
- **Kotlin Coroutines** - Asynchronous programming with suspend functions

### Database Layer

- **PostgreSQL 18** - Primary database
- **R2DBC PostgreSQL** - Reactive database connectivity
- **JOOQ 3.20** - Type-safe SQL query builder with Kotlin support
- **Flyway 11.8** - Database migration management

### Security

- **Spring Security** - Security framework with WebFlux
- **JWT (JJWT)** - Token-based authentication
- **BCrypt** - Password hashing

### External Services

- **Resend** - Email service for notifications
- **Cloudinary** - Image storage and optimization
- **Thymeleaf** - Email template engine

### Build & Development

- **Gradle 8** - Build automation with Kotlin DSL
- **Docker** - Containerization with PostgreSQL
- **Testcontainers** - Integration testing with real databases
- **OpenAPI/Swagger** - API documentation

## Suspend Functions and Coroutines Integration

### Controller Layer with Suspend Functions

- All controller methods use `suspend fun` for clean asynchronous code
- Direct return types improve readability and reduce complexity
- Automatic integration with Spring WebFlux reactive streams

```kotlin
// Clean suspend function approach
suspend fun getProfile(@AuthenticationPrincipal userDetails: UserDetails): ProfileDTO.Output {
    val userId = UUID.fromString(userDetails.username)
    return profileService.getUserProfile(userId)
}
```

### Service Layer Implementation
- Business logic implemented with suspend functions
- Domain operations flow naturally without reactive wrapper types
- Error handling with standard Kotlin exception mechanisms

### Repository Layer with JOOQ Coroutines
- JOOQ coroutines integration with `transactionCoroutine`
- Database operations are truly non-blocking
- Type-safe SQL with generated Kotlin classes

```kotlin
override suspend fun findById(id: UUID): User? {
    return dsl.transactionCoroutine { configuration ->
        configuration.dsl()
            .selectFrom(USERS)
            .where(USERS.ID.eq(id))
            .fetchOneInto(User::class.java)
    }
}
```

### Benefits of Suspend Functions
- **Simplified Code**: No need for reactive wrapper types (`Mono`, `Flux`)
- **Better Readability**: Sequential-looking code that's actually asynchronous
- **Exception Handling**: Standard try-catch blocks work naturally
- **Performance**: Non-blocking operations with better resource utilization
- **Integration**: Works seamlessly with Spring WebFlux reactive streams

## Request Processing Flow

### Typical Request Flow

1. **Controller** receives and validates HTTP request with suspend functions
2. **JWT Filter** validates authentication token (if required)
3. **Service** processes business logic using coroutines
4. **Repository** executes database operations with JOOQ
5. **Service** transforms and prepares response data
6. **Controller** formats and returns HTTP response

### Dependency Flow

- **Controllers** → **Services** (business logic)
- **Services** → **Repositories** (data access) + External services
- **Repositories** → **JOOQ DSL** (database operations)
- **Configuration** → Cross-cutting concerns (security, email, file storage)

### Error Handling Flow
1. **Repository** throws data access exceptions
2. **Service** catches and converts to business exceptions
3. **Global Exception Handler** converts to appropriate HTTP responses
4. **Client** receives standardized error responses

## Authentication Flow

### Registration & Login

1. User submits credentials to **AuthController**
2. **AuthenticationService** validates and creates user account
3. **EmailService** sends verification email via Resend
4. User verifies email and can login
5. **TokenService** generates JWT access and refresh tokens
6. Subsequent requests validated by **JwtTokenAuthenticationFilter**

### JWT Token Management

- **Access Token**: 24-hour expiration, contains user ID and type
- **Refresh Token**: 30-day expiration, used to obtain new access tokens
- **Token Validation**: Custom filter validates tokens on protected endpoints

## External Service Integration

### Email Service (Resend)

- **Verification emails** - Account activation
- **Password reset** - Secure password recovery
- **Welcome emails** - User onboarding
- **Template engine** - Thymeleaf for HTML email templates

### File Upload Service (Cloudinary)

- **Profile images** - Avatar and cover photo uploads
- **Image optimization** - Automatic resizing and compression
- **Secure uploads** - Signed upload URLs
- **CDN delivery** - Global content delivery

## Database Architecture

### Schema Management

- **Flyway migrations** - Version-controlled schema changes
- **JOOQ code generation** - Type-safe database access
- **PostgreSQL features** - JSON support, indexing

### Key Tables

- **users** - Core user information
- **business_profiles** / **individual_profiles** - Profile data
- **categories** - Industry categories with hierarchy
- **connections** - User connections and requests
- **user_industries** - User-category associations with boosting
- **boost_plans** - Available boost packages

## Security Architecture

### Authentication Strategy

- **JWT-based** - Stateless token authentication
- **Role-based access** - User type-based permissions
- **Public endpoints** - Search and category APIs
- **Protected endpoints** - Profile and connection management

### Data Protection

- **Password encryption** - BCrypt hashing
- **Input validation** - Request parameter sanitization
- **CORS configuration** - Cross-origin request handling
- **Secure headers** - Security-related HTTP headers

## Performance Considerations

### Reactive Programming

- **Non-blocking I/O** - WebFlux with coroutines
- **Connection pooling** - R2DBC connection management
- **Asynchronous processing** - Suspend functions throughout

### Database Optimization

- **Indexed searches** - Full-text and geographic indexes
- **Query optimization** - JOOQ for efficient SQL generation
- **Cursor pagination** - Efficient result pagination
- **Connection management** - Reactive database connections

### File Handling

- **External storage** - Cloudinary for images
- **Lazy loading** - On-demand resource loading
- **Size limitations** - Upload size restrictions

## Monitoring and Observability

### Application Health

- **Spring Actuator** - Health checks and metrics
- **Database connectivity** - Connection health monitoring
- **External service status** - Email and file upload service health

### Logging Strategy

- **Structured logging** - Consistent log format
- **Request tracing** - Request/response logging
- **Error tracking** - Exception logging and monitoring

This architecture provides a solid foundation for the PBI API with clear separation of concerns, type safety, and modern
reactive programming patterns while maintaining simplicity and maintainability.
