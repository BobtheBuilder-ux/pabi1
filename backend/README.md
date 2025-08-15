# PBI API

A modern, reactive API built with Kotlin, Spring WebFlux, and PostgreSQL for professional business and individual
networking.

## 🚀 Quick Start

### Prerequisites

- **Java 24** (OpenJDK recommended)
- **Docker & Docker Compose** (for database and testcontainers)
- **Git** (for version control)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd new.pbi.api
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```bash
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=pbi
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-256-bits
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=2592000000

# Server Configuration
SERVER_PORT=8080

# Email Configuration (Resend)
EMAIL_FROM=no-reply@yourapp.com
EMAIL_BASE_URL=http://localhost:8080
RESEND_API_KEY=your-resend-api-key

# Cloudinary Configuration
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Upload Configuration
UPLOAD_MAX_IN_MEMORY_SIZE=5MB
```

### 3. Start the Database

```bash
# Start PostgreSQL using Docker Compose
docker compose up -d

# Or if using the docker folder
cd docker && docker compose up -d
```

### 4. Generate JOOQ Classes (First-time setup)

**Important**: This task uses Testcontainers to spin up a PostgreSQL container. Make sure Docker is running before
executing this command.

```bash
# Generate JOOQ classes from database schema
./gradlew GenerateJooqClasses
```

### 5. Run the Application

```bash
# Run the application
./gradlew bootRun
```

The API will be available at `http://localhost:8080`

## 📋 API Documentation

Once the application is running, you can access:

- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`
- **Health Check**: `http://localhost:8080/actuator/health`

## 🏗️ Architecture Overview

### Technology Stack

- **Framework**: Spring Boot 3.5+ with WebFlux (Reactive)
- **Language**: Kotlin 2.2 with Coroutines
- **Database**: PostgreSQL 18 with R2DBC
- **ORM**: JOOQ 3.20 with Kotlin support
- **Security**: JWT-based authentication
- **Documentation**: OpenAPI/Swagger
- **Email**: Resend service
- **File Storage**: Cloudinary
- **Build Tool**: Gradle 8 with Kotlin DSL

### Project Structure

```
src/main/kotlin/com/pbi/api/
├── controller/          # REST endpoints
├── service/            # Business logic
├── repository/         # Data access layer
├── dto/               # Data transfer objects
├── config/            # Configuration classes
├── security/          # JWT and security components
└── exception/         # Exception handling
```

## 🔧 Development

### Database Schema Management

The project uses Flyway for database migrations:

```bash
# Apply migrations manually (usually automatic on startup)
./gradlew flywayMigrate

# Generate JOOQ classes after schema changes (requires Docker to be running)
./gradlew GenerateJooqClasses
```

Migration files are located in `src/main/resources/db/migration/`

### Building the Project

```bash
# Clean and build
./gradlew clean build

# Build Docker image
./gradlew bootBuildImage
```

### Code Generation

JOOQ classes are generated automatically during build, but for development:

```bash
# Force regenerate JOOQ classes (requires Docker to be running)
./gradlew GenerateJooqClasses
```

## 🌐 API Endpoints

### Authentication

- `POST /api/v1/auth/register/business` - Register business user
- `POST /api/v1/auth/register/individual` - Register individual user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/verify-email` - Verify email address
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

### Profile Management

- `GET /api/v1/profile` - Get current user profile
- `PUT /api/v1/profile` - Update profile
- `DELETE /api/v1/profile` - Delete account
- `POST /api/v1/profile/upload/avatar` - Upload avatar
- `POST /api/v1/profile/upload/cover` - Upload cover image

### Search & Discovery

- `GET /api/v1/search` - Search users (public)
- `GET /api/v1/search/boosted` - Search boosted profiles

### Connections

- `POST /api/v1/connections/requests` - Send connection request
- `GET /api/v1/connections/requests/received` - Get received requests
- `GET /api/v1/connections/requests/sent` - Get sent requests
- `PATCH /api/v1/connections/requests/{id}/accept` - Accept request
- `GET /api/v1/connections` - Get connections

### Categories

- `GET /api/v1/categories` - Get all categories (public)
- `GET /api/v1/categories/tree` - Get category hierarchy

### Boost Management

- `GET /api/v1/boost-plans` - Get available boost plans
- `POST /api/v1/boost/industry` - Boost industry visibility

## 🔒 Authentication

The API uses JWT-based authentication:

1. **Register** a new account or **login** with existing credentials
2. Use the returned `accessToken` in the `Authorization` header:
   ```
   Authorization: Bearer <your-jwt-token>
   ```
3. Refresh tokens when they expire using the `/auth/refresh` endpoint

## 🚀 Deployment

### Environment Configuration

For production deployment, ensure these environment variables are set:

```bash
# Required for production
JWT_SECRET=<strong-production-secret>
DATABASE_HOST=<production-db-host>
DATABASE_PASSWORD=<secure-password>
RESEND_API_KEY=<your-resend-key>
CLOUDINARY_URL=<your-cloudinary-url>
EMAIL_BASE_URL=<your-production-domain>
```

### Docker Compose Deployment

The project includes a Docker Compose configuration for easy deployment:

1. **Build the Docker image first:**

```bash
./gradlew bootBuildImage --imageName=pbi-api:latest
```

2. **Configure environment variables:**
   Create a `.env` file in the `docker/` folder with your configuration:

```bash
# Copy example and modify
cp docker/.env.example docker/.env
# Edit with your values
```

3. **Deploy using Docker Compose:**

```bash
cd docker
BASE_TAG_NAME=pbi-api:latest docker compose up -d
```

The compose file:

- Uses the built Docker image
- Mounts uploads directory for file storage
- Connects to external database network (`db_net`)
- Exposes the application on the configured port

### CI/CD Pipeline Deployment

The project uses Gradle's `bootBuildImage` task to create Docker images. From the CI/CD pipeline:

```bash
# Build Docker image with specific tag
./gradlew clean bootBuildImage --imageName=your-registry/pbi-api:latest --publishImage -PrunJooqTask=api
```

**Note**: The `-PrunJooqTask=api` parameter enables JOOQ class generation during the build process.

### Manual Docker Deployment

```bash
# Build Docker image locally
./gradlew bootBuildImage

# Run with Docker
docker run -p 8080:8080 \
  -e DATABASE_HOST=<db-host> \
  -e JWT_SECRET=<secret> \
  -e RESEND_API_KEY=<key> \
  -e CLOUDINARY_URL=<url> \
  pbi-api:latest
```

## 🛠️ Configuration

### Database Configuration

The application connects to PostgreSQL using R2DBC for reactive database access:

- **Connection Pool**: Managed by R2DBC
- **Migrations**: Handled by Flyway
- **Query Builder**: JOOQ with Kotlin support

### Security Configuration

- **JWT Tokens**: 24-hour access tokens, 30-day refresh tokens
- **Password Hashing**: BCrypt with salt
- **CORS**: Configured for cross-origin requests
- **Rate Limiting**: Implemented at service level

### External Services

#### Email Service (Resend)

- Account verification emails
- Password reset emails
- Welcome emails with HTML templates

#### File Storage (Cloudinary)

- Profile image uploads
- Image optimization and resizing
- CDN delivery

## 📖 Additional Documentation

- [API Specification](docs/API_SPECIFICATION.md) - Detailed API documentation
- [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md) - System architecture
- [Database Schema](docs/DATABASE_SCHEMA.md) - Database design
- [Search Functionality](docs/SEARCH_FUNCTIONALITY.md) - Search implementation
- [Boost Functionality](docs/BOOST_FUNCTIONALITY.md) - Boost system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**

```bash
# Check if PostgreSQL is running
docker compose ps

# Restart database
docker compose restart
```

**JOOQ Classes Not Found**

```bash
# Make sure Docker is running, then regenerate JOOQ classes
./gradlew GenerateJooqClasses
```

**Port Already in Use**

```bash
# Check what's using port 8080
lsof -i :8080

# Use different port
export SERVER_PORT=8081
./gradlew bootRun
```

**JWT Token Invalid**

- Check that `JWT_SECRET` is properly configured
- Ensure tokens haven't expired (24 hours for access tokens)
- Verify the token format in Authorization header

**Testcontainers Issues**

- Ensure Docker is running and accessible
- Check Docker permissions for the current user
- Verify sufficient disk space for Docker containers

### Logs

Check application logs for detailed error information:

```bash
# View logs when running with Gradle
./gradlew bootRun --info

# View Docker logs
docker compose logs -f
```
