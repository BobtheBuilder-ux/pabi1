-- V20250727180000__add_boosting_to_user_industries.sql

-- Remove boost-related columns from profile tables
ALTER TABLE business_profiles
    DROP COLUMN is_boosted;
ALTER TABLE business_profiles
    DROP COLUMN boost_expires_at;

ALTER TABLE individual_profiles
    DROP COLUMN is_boosted;
ALTER TABLE individual_profiles
    DROP COLUMN boost_expires_at;

-- Add boost-related columns to user_industries table
ALTER TABLE user_industries
    ADD COLUMN is_boosted BOOLEAN DEFAULT false;
ALTER TABLE user_industries
    ADD COLUMN boost_expires_at TIMESTAMP;

-- Drop old indexes
DROP INDEX IF EXISTS idx_business_profiles_boosted;
DROP INDEX IF EXISTS idx_individual_profiles_boosted;

-- Create new index for boosted industries
CREATE INDEX idx_user_industries_boosted ON user_industries (is_boosted, boost_expires_at) WHERE is_boosted = true AND deleted_at IS NULL;
CREATE INDEX idx_user_industries_boosted_category ON user_industries (is_boosted, category_id, boost_expires_at) WHERE is_boosted = true AND deleted_at IS NULL;
