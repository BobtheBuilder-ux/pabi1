-- V20250727120000__migrate_parent_categories_to_subcategories.sql
-- This migration script identifies users who have been assigned parent categories
-- as interests or industries and replaces them with the respective sub-categories.

DO
$$
    DECLARE
        -- Temporary tables to hold the mappings that need to be migrated.
    BEGIN
        -- Step 1: Create temporary tables to store users with parent category interests and industries.
        CREATE TEMP TABLE temp_user_parent_interests
        (
            user_id            UUID,
            parent_category_id UUID
        );

        CREATE TEMP TABLE temp_user_parent_industries
        (
            user_id            UUID,
            parent_category_id UUID
        );

        -- Step 2: Populate the temporary tables with users who have parent categories.
        -- A parent category is identified by having a NULL parent_id.
        INSERT INTO temp_user_parent_interests (user_id, parent_category_id)
        SELECT ui.user_id, ui.category_id
        FROM user_interests ui
                 JOIN categories c ON ui.category_id = c.id
        WHERE c.parent_id IS NULL;

        INSERT INTO temp_user_parent_industries (user_id, parent_category_id)
        SELECT ui.user_id, ui.category_id
        FROM user_industries ui
                 JOIN categories c ON ui.category_id = c.id
        WHERE c.parent_id IS NULL;

        -- Step 3: For each user with a parent category interest, add the sub-categories.
        -- This query finds all sub-categories for each parent category in the temp table
        -- and inserts them into the user_interests table.
        -- The ON CONFLICT clause prevents adding duplicate interests.
        INSERT INTO user_interests (user_id, category_id)
        SELECT t.user_id, sub.id
        FROM temp_user_parent_interests t
                 JOIN categories sub ON sub.parent_id = t.parent_category_id
        ON CONFLICT (user_id, category_id) DO NOTHING;

        -- Step 4: For each user with a parent category industry, add the sub-categories.
        -- Similar to the step above, but for user_industries.
        INSERT INTO user_industries (user_id, category_id)
        SELECT t.user_id, sub.id
        FROM temp_user_parent_industries t
                 JOIN categories sub ON sub.parent_id = t.parent_category_id
        ON CONFLICT (user_id, category_id) DO NOTHING;

        -- Step 5: Remove the original parent category interests from the users.
        -- Now that the sub-categories have been added, the parent category is no longer needed.
        DELETE
        FROM user_interests
        WHERE (user_id, category_id) IN (SELECT user_id, parent_category_id
                                         FROM temp_user_parent_interests);

        -- Step 6: Remove the original parent category industries from the users.
        DELETE
        FROM user_industries
        WHERE (user_id, category_id) IN (SELECT user_id, parent_category_id
                                         FROM temp_user_parent_industries);

        -- Step 7: Clean up the temporary tables.
        DROP TABLE temp_user_parent_interests;
        DROP TABLE temp_user_parent_industries;

    END
$$;

