# Database Schema Design

## Core Tables Structure

### Users Table (Consolidated Authentication)
- Primary key with UUID v7 for optimal performance
- Email as unique identifier for all user types
- Password hash for authentication (nullable for OAuth-only users)
- User type enum: BUSINESS, INDIVIDUAL, or ADMIN
- LinkedIn ID for OAuth integration (nullable)
- Timestamp-based status tracking:
  - `activated_at` - when account was activated
  - `verified_at` - when email was verified
  - `deleted_at` - soft delete timestamp
- Email verification and password reset tokens
- Audit timestamps (created_at, updated_at)

### Role-Based Access Control (RBAC) System

#### Roles Table
- Hierarchical role definitions
- System roles (cannot be deleted): SUPER_ADMIN, ADMIN, MODERATOR, USER, PREMIUM_USER
- Custom roles can be added for specific use cases
- Role descriptions and activation status
- System role protection flag

#### Permissions Table
- Granular permission definitions using resource.action pattern
- Resources: users, profiles, categories, connections, analytics, system, roles, permissions
- Actions: create, read, update, delete, moderate, manage_roles, configure, etc.
- System permission protection flag
- Unique constraint on resource-action combinations

#### Role Permissions Table
- Many-to-many relationship between roles and permissions
- Tracks who granted permissions and when
- Supports soft deletion for audit trail
- Unique constraint prevents duplicate assignments

#### User Roles Table
- Many-to-many relationship between users and roles
- Optional role expiration with `expires_at` timestamp
- Tracks who assigned roles and when
- Supports temporary role assignments
- Soft deletion for complete audit trail

### Profile Tables

#### Business Profiles Table
- User relationship (one-to-one with users where user_type = 'BUSINESS')
- Company information (name, email, phone)
- Personal details (name, personal email)
- Biography and professional description
- Geographic data (registration country, residence country)
- Location data stored as JSONB (city, street, coordinates)
- Profile and cover image URLs
- Boost status and expiration tracking
- Soft delete support with audit timestamps

#### Individual Profiles Table
- User relationship (one-to-one with users where user_type = 'INDIVIDUAL')
- Personal information (name, phone, biography)
- Nationality and residence information
- Location data stored as JSONB for flexibility
- Profile and cover image URLs
- Boost status and expiration tracking
- Soft delete support with audit timestamps

#### Admin Profiles Table
- User relationship (one-to-one with users where user_type = 'ADMIN')
- Administrative information (name, department, job title)
- Contact information and internal notes
- Soft delete support for data retention

### Categories Table (Hierarchical Structure)
- Self-referencing hierarchical structure with parent-child relationships
- Industry categories and subcategories
- Unique category names to prevent duplicates
- Description and timestamp-based activation status
- Soft delete support for maintaining data integrity

### User Relationship Tables

#### User Industries Table
- Many-to-many relationship between users and categories
- Primary industry designation with `is_primary` flag
- Soft delete support for history tracking
- Unique constraint prevents duplicate user-category pairs

#### User Interests Table
- Many-to-many relationship between users and categories
- Interest tracking for enhanced matching algorithms
- Soft delete support for preference history
- Unique constraint prevents duplicate user-category pairs

### Connection Management

#### Connection Requests Table
- Sender and recipient user relationships
- Status tracking: PENDING, ACCEPTED, REJECTED, CANCELLED
- Optional message with connection request
- Soft delete support for maintaining connection history
- Unique constraint prevents duplicate requests between same users

### Boost Management System

#### Boost Plans Table
- Predefined boost packages with pricing and duration
- Plan descriptions and feature details
- Duration in days and pricing in cents
- Timestamp-based activation status
- Soft delete support for plan history

#### User Boosts Table
- Tracks individual user boost purchases and usage
- References to boost plans and users
- Start and expiration timestamps
- Active status tracking
- Soft delete support for billing history

## Advanced Features

### UUID v7 Implementation
- All tables use PostgreSQL 18's native `uuidv7()` function
- Timestamp-ordered UUIDs provide better B-tree index performance
- Eliminates need for external UUID generation extensions
- Improved database performance for large datasets

### Soft Delete Strategy
- All major tables implement soft deletes with `deleted_at` timestamps
- Preserves data integrity and audit trails
- Enables data recovery and historical analysis
- Application-layer filtering with `WHERE deleted_at IS NULL`

### Timestamp-Based Status Tracking
- Replaces boolean flags with timestamps for richer data
- `activated_at`, `verified_at`, `deleted_at` provide state and timing
- Enables temporal queries and status history tracking
- Better audit capabilities and compliance support

## Indexing Strategy

### Performance Indexes
- **Users**: email, linkedin_id, user_type with activation status
- **Roles**: name, activation status with soft delete filtering
- **Permissions**: resource-action combinations, activation status
- **Role Permissions**: role and permission foreign keys with active filtering
- **User Roles**: user and role foreign keys with expiration and soft delete filtering
- **Profiles**: user foreign keys for all profile types
- **Categories**: parent relationships, activation status with soft delete filtering
- **User Relationships**: user and category foreign keys for industries/interests
- **Connections**: sender, recipient, and status for efficient matching
- **Boosts**: user foreign keys and active status with expiration filtering

### JSONB Indexes
- Location data in profile tables uses GIN indexes for spatial queries
- Enables efficient geographic searches and filtering
- Supports complex location-based matching algorithms

## Data Relationships

### User Management
- Single users table serves all user types (BUSINESS, INDIVIDUAL, ADMIN)
- One-to-one relationships with type-specific profile tables
- Many-to-many relationships with roles (supports multiple roles per user)
- Role-based permissions provide granular access control

### Profile System
- Type-specific profile tables linked to users table
- Flexible JSONB location data for geographic features
- Boost status tracking across all profile types
- Soft delete preservation of profile history

### Category Hierarchy
- Self-referencing tree structure for industries and interests
- Many-to-many relationships with users for personalization
- Primary industry designation for business matching
- Interest tracking for enhanced recommendation algorithms

### Connection Network
- Bidirectional connection request system
- Status tracking throughout connection lifecycle
- Message support for personalized connection requests
- Soft delete preservation of connection history

## Security and Compliance

### Role-Based Access Control
- Granular permissions using resource.action pattern
- System role protection prevents accidental deletion
- Audit trail for all role and permission changes
- Temporary role assignments with automatic expiration

### Data Protection
- Soft delete strategy preserves data for compliance
- Timestamp-based tracking for audit requirements
- Foreign key constraints ensure referential integrity
- Password hashing for secure authentication

### Performance Optimization
- UUID v7 provides optimal B-tree performance
- Comprehensive indexing strategy for fast queries
- JSONB for flexible data structures with efficient querying
- Soft delete filtering optimized with partial indexes

## Scalability Considerations
- UUID v7 primary keys scale better than sequential integers
- JSONB location data supports evolving geographic requirements
- Role-based permissions scale with organizational complexity
- Soft delete strategy maintains performance while preserving data
- Hierarchical categories support unlimited depth and complexity
- Connection system scales to millions of users and relationships 