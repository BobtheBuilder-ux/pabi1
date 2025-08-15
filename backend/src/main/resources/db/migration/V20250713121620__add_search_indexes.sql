-- V20250713121620__add_search_indexes.sql
-- Add optimized indexes for search functionality

-- 1. User Industries indexes for fast matching
-- Composite index for user_id + category_id with soft delete filtering
CREATE INDEX idx_user_industries_user_category_active
    ON user_industries (user_id, category_id)
    WHERE deleted_at IS NULL;

-- Index for category_id lookups in CTEs
CREATE INDEX idx_user_industries_category_active
    ON user_industries (category_id)
    WHERE deleted_at IS NULL;

-- 2. User Interests indexes for fast matching
-- Composite index for user_id + category_id with soft delete filtering
CREATE INDEX idx_user_interests_user_category_active
    ON user_interests (user_id, category_id)
    WHERE deleted_at IS NULL;

-- Index for category_id lookups in CTEs
CREATE INDEX idx_user_interests_category_active
    ON user_interests (category_id)
    WHERE deleted_at IS NULL;

-- 3. Geographic filtering indexes
-- Business profiles country filtering
CREATE INDEX idx_business_profiles_registration_country_active
    ON business_profiles (registration_country)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_business_profiles_residence_country_active
    ON business_profiles (residence_country)
    WHERE deleted_at IS NULL;

-- Individual profiles country filtering
CREATE INDEX idx_individual_profiles_residence_country_active
    ON individual_profiles (residence_country)
    WHERE deleted_at IS NULL;

-- 4. User filtering and sorting indexes
-- Active users index for soft delete filtering
CREATE INDEX idx_users_active_id
    ON users (id)
    WHERE deleted_at IS NULL;

-- 5. Profile joins optimization
-- Business profiles user join
CREATE INDEX idx_business_profiles_user_active
    ON business_profiles (user_id)
    WHERE deleted_at IS NULL;

-- Individual profiles user join
CREATE INDEX idx_individual_profiles_user_active
    ON individual_profiles (user_id)
    WHERE deleted_at IS NULL;

-- 6. Sorting optimization indexes
-- Company name sorting for business users
CREATE INDEX idx_business_profiles_company_name_active
    ON business_profiles (company_name, user_id)
    WHERE deleted_at IS NULL;

-- Personal name sorting for individual users
CREATE INDEX idx_individual_profiles_name_active
    ON individual_profiles (name, user_id)
    WHERE deleted_at IS NULL;

-- 7. Composite indexes for complex queries
-- Combined user industries lookup
CREATE INDEX idx_user_industries_composite
    ON user_industries (user_id, category_id, deleted_at)
    WHERE deleted_at IS NULL;

-- Combined user interests lookup
CREATE INDEX idx_user_interests_composite
    ON user_interests (user_id, category_id, deleted_at)
    WHERE deleted_at IS NULL;

-- 8. Geographic composite indexes for OR conditions
-- Business profiles geographic composite
CREATE INDEX idx_business_profiles_geographic
    ON business_profiles (registration_country, residence_country, user_id)
    WHERE deleted_at IS NULL;

-- 9. Cursor pagination optimization
-- UUID-based cursor pagination (UUID v7 is already time-ordered)
CREATE INDEX idx_users_id_active
    ON users (id)
    WHERE deleted_at IS NULL;

-- 10. Profile completeness for ranking (optional)
-- Business profiles with company name
CREATE INDEX idx_business_profiles_complete
    ON business_profiles (user_id, company_name, registration_country)
    WHERE deleted_at IS NULL AND company_name IS NOT NULL;

-- Individual profiles with name
CREATE INDEX idx_individual_profiles_complete
    ON individual_profiles (user_id, name, residence_country)
    WHERE deleted_at IS NULL AND name IS NOT NULL;

-- Add comments for documentation
COMMENT ON INDEX idx_user_industries_user_category_active IS 'Optimized for user-industry matching in search CTEs';
COMMENT ON INDEX idx_user_interests_user_category_active IS 'Optimized for user-interest matching in search CTEs';
COMMENT ON INDEX idx_business_profiles_registration_country_active IS 'Optimized for business profile country filtering';
COMMENT ON INDEX idx_individual_profiles_residence_country_active IS 'Optimized for individual profile country filtering';
COMMENT ON INDEX idx_users_active_id IS 'Optimized for active user filtering and cursor pagination';
COMMENT ON INDEX idx_business_profiles_company_name_active IS 'Optimized for business profile name sorting';
COMMENT ON INDEX idx_individual_profiles_name_active IS 'Optimized for individual profile name sorting';