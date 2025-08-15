# Boost Functionality

This document outlines the functionality for boosting user profiles within the PBI Business Matching Platform. The boost
feature is designed to increase the visibility of a user's profile to other relevant users.

## Overview

Instead of boosting an entire profile, users can choose to boost one or more of their specific **industry categories**.

When a user boosts an industry category, their profile will be featured more prominently to other users who have the
same category listed in their own industries.

## How it Works

1. **Boosting an Industry:**
    * A user can select one or more of the industry categories they have associated with their profile.
    * They can then apply a "boost" to these selected categories, typically for a specific duration and cost (managed
      via `boost_plans`).

2. **Boosted Visibility:**
    * There will be a dedicated section or endpoint (e.g., `/api/v1/search/boosted`) for users to discover boosted
      profiles.
    * When a user (let's call them "User A") views this boosted section, they will see a list of other users ("User
      B", "User C", etc.) who have boosted an industry category that **matches one of User A's own industry categories
      **.
    * This matching is based solely on shared industry categories and is independent of the "interests" matching used in
      the main search functionality. This provides a direct way for users to be discovered by others in the same field.

## Database Schema Implications

To support this functionality, the following changes will be made to the database schema:

* The `user_industries` table, which links users to their industry categories, includes:
    * `is_boosted` (BOOLEAN): A flag to indicate if that specific user-industry link is boosted.
    * `boost_expires_at` (TIMESTAMP): A timestamp to indicate when the boost for that industry expires.

This approach allows for granular control over which aspects of a user's profile are promoted.

