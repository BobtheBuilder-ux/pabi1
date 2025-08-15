-- V20250727120100__add_constraint_to_prevent_parent_categories.sql
-- This migration adds a check constraint to the user_interests and user_industries
-- tables to prevent parent categories from being added.

-- Step 1: Create a function to check if a category is a parent.
-- A category is considered a parent if its parent_id is NULL.
-- The function returns true if the category is NOT a parent (i.e., it's a sub-category).
CREATE OR REPLACE FUNCTION is_not_parent_category(p_category_id UUID)
    RETURNS BOOLEAN AS
$$
DECLARE
    is_parent BOOLEAN;
BEGIN
    SELECT parent_id IS NULL
    INTO is_parent
    FROM categories
    WHERE id = p_category_id;

    -- If the category does not exist, it will return NULL which is not TRUE, failing the check.
    -- The check constraint will only pass if this function returns TRUE.
    RETURN NOT is_parent;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Add the check constraint to the user_interests table.
-- This ensures that only sub-categories can be added as interests.
ALTER TABLE user_interests
    ADD CONSTRAINT chk_user_interests_not_parent_category
        CHECK (is_not_parent_category(category_id));

-- Step 3: Add the check constraint to the user_industries table.
-- This ensures that only sub-categories can be added as industries.
ALTER TABLE user_industries
    ADD CONSTRAINT chk_user_industries_not_parent_category
        CHECK (is_not_parent_category(category_id));

