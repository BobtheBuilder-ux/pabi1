# Search Functionality Specification

## Overview

The search functionality enables logged-in users to discover other users based on mutual industry-interest matching and
geographic filtering. This system implements a sophisticated matching algorithm that considers both business
relationships and personal interests.

## Core Matching Logic

### User Visibility Rules

1. **Industry-Interest Matching**: A user can see other users only if there's a mutual match:
    - User A's industries match User B's interests
    - User A's interests match User B's industries

2. **Bidirectional Matching**: The matching is reciprocal - if User A can see User B, User B can also see User A

3. **Geographic Filtering**: Users can filter by country using either:
    - `registration_country` (for business users)
    - `residence_country` (for individual users)

### Matching Algorithm

#### Step 1: Interest-Industry Cross-Matching

```
For each logged-in user:
  - Get user's industries (from user_industries)
  - Get user's interests (from user_interests)
  
For each potential match:
  - Check if user's industries match target's interests
  - Check if user's interests match target's industries
  - If either condition is true, include in results
```

#### Step 2: Geographic Filtering

```
Default filter: registration_country OR residence_country
Optional: Allow users to specify which country field to search
```

## Database Schema Analysis

### Current Tables Involved

- `users` - Core user information
- `user_industries` - User's primary industries
- `user_interests` - User's interests
- `business_profiles` - Business user details
- `individual_profiles` - Individual user details
- `categories` - Industry/interest categories

### Indexes for Performance

```sql
-- User industries
CREATE INDEX idx_user_industries_user ON user_industries(user_id) WHERE deleted_at IS NULL;

-- User interests
CREATE INDEX idx_user_interests_user ON user_interests(user_id) WHERE deleted_at IS NULL;

-- Category matching
CREATE INDEX idx_user_industries_category ON user_industries(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_interests_category ON user_interests(category_id) WHERE deleted_at IS NULL;

-- Geographic filtering
CREATE INDEX idx_business_profiles_country ON business_profiles(registration_country) WHERE deleted_at IS NULL;
CREATE INDEX idx_individual_profiles_country ON individual_profiles(residence_country) WHERE deleted_at IS NULL;

-- Composite indexes for complex queries
CREATE INDEX idx_user_industries_user_category ON user_industries(user_id, category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_interests_user_category ON user_interests(user_id, category_id) WHERE deleted_at IS NULL;
```

## Performance Optimization Strategies

### 1. Query Optimization

#### Primary Query Structure

```sql
WITH user_industries AS (
    SELECT user_id, category_id 
    FROM user_industries 
    WHERE deleted_at IS NULL
),
user_interests AS (
    SELECT user_id, category_id 
    FROM user_interests 
    WHERE deleted_at IS NULL
),
matching_users AS (
    -- Find users whose interests match current user's industries
    SELECT DISTINCT ui.user_id
    FROM user_interests ui
    JOIN user_industries current_industries ON ui.category_id = current_industries.category_id
    WHERE current_industries.user_id = :current_user_id
    
    UNION
    
    -- Find users whose industries match current user's interests
    SELECT DISTINCT ui.user_id
    FROM user_industries ui
    JOIN user_interests current_interests ON ui.category_id = current_interests.category_id
    WHERE current_interests.user_id = :current_user_id
)
SELECT u.*, bp.*, ip.*
FROM users u
LEFT JOIN business_profiles bp ON u.id = bp.user_id AND u.user_type = 'BUSINESS'
LEFT JOIN individual_profiles ip ON u.id = ip.user_id AND u.user_type = 'INDIVIDUAL'
WHERE u.id IN (SELECT user_id FROM matching_users)
AND u.id != :current_user_id
AND u.deleted_at IS NULL
AND (bp.registration_country = :country OR ip.residence_country = :country)
```

### 2. Caching Strategy

#### Redis Caching Layers

1. **User Industry/Interest Cache**
    - Cache user's industries and interests
    - TTL: 1 hour
    - Invalidate on profile updates

2. **Matching Results Cache**
    - Cache search results for common queries
    - TTL: 30 minutes
    - Key: `search:user:{user_id}:country:{country}`

3. **Category Hierarchy Cache**
    - Cache category tree structure
    - TTL: 24 hours
    - Invalidate on category updates

### 3. Pagination and Result Limiting

#### Efficient Pagination

```sql
-- Used cursor-based pagination instead of offset
SELECT * FROM matching_results 
WHERE (last_seen_at, id) < (:cursor_timestamp, :cursor_id)
ORDER BY last_seen_at DESC, id DESC
LIMIT :page_size
```

## API Design

### Search Endpoints

```
GET /api/v1/search
Query Parameters:
- country (optional): Filter by country
- page: Page number (default: 0)
- size: Page size (default: 20)
- sort: Sort order (name, recent)
```