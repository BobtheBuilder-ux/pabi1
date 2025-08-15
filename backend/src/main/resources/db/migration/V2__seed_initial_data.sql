-- V2__seed_initial_data.sql
-- Seed data for PBI Business Matching Platform

-- Insert main industry categories
INSERT INTO categories (id, name, description, parent_id) VALUES
    (uuidv7(), 'Technology', 'Technology and software companies', NULL),
    (uuidv7(), 'Healthcare', 'Healthcare and medical services', NULL),
    (uuidv7(), 'Finance', 'Financial services and fintech', NULL),
    (uuidv7(), 'Education', 'Educational institutions and services', NULL),
    (uuidv7(), 'Manufacturing', 'Manufacturing and industrial companies', NULL),
    (uuidv7(), 'Retail', 'Retail and e-commerce businesses', NULL),
    (uuidv7(), 'Consulting', 'Consulting and professional services', NULL),
    (uuidv7(), 'Real Estate', 'Real estate and property services', NULL),
    (uuidv7(), 'Transportation', 'Transportation and logistics', NULL),
    (uuidv7(), 'Energy', 'Energy and utilities sector', NULL);

-- Insert technology subcategories
INSERT INTO categories (id, name, description, parent_id) VALUES
    (uuidv7(), 'Software Development', 'Custom software development services', (SELECT id FROM categories WHERE name = 'Technology')),
    (uuidv7(), 'Mobile Apps', 'Mobile application development', (SELECT id FROM categories WHERE name = 'Technology')),
    (uuidv7(), 'Web Development', 'Web development and design', (SELECT id FROM categories WHERE name = 'Technology')),
    (uuidv7(), 'AI/Machine Learning', 'Artificial intelligence and ML solutions', (SELECT id FROM categories WHERE name = 'Technology')),
    (uuidv7(), 'Cybersecurity', 'Information security services', (SELECT id FROM categories WHERE name = 'Technology')),
    (uuidv7(), 'Cloud Services', 'Cloud computing and infrastructure', (SELECT id FROM categories WHERE name = 'Technology')),
    (uuidv7(), 'Data Analytics', 'Data analysis and business intelligence', (SELECT id FROM categories WHERE name = 'Technology'));

-- Insert healthcare subcategories
INSERT INTO categories (id, name, description, parent_id) VALUES
    (uuidv7(), 'Medical Devices', 'Medical equipment and devices', (SELECT id FROM categories WHERE name = 'Healthcare')),
    (uuidv7(), 'Pharmaceuticals', 'Pharmaceutical companies and research', (SELECT id FROM categories WHERE name = 'Healthcare')),
    (uuidv7(), 'Telemedicine', 'Remote healthcare services', (SELECT id FROM categories WHERE name = 'Healthcare')),
    (uuidv7(), 'Healthcare IT', 'Healthcare information technology', (SELECT id FROM categories WHERE name = 'Healthcare')),
    (uuidv7(), 'Mental Health', 'Mental health services and support', (SELECT id FROM categories WHERE name = 'Healthcare'));

-- Insert finance subcategories
INSERT INTO categories (id, name, description, parent_id) VALUES
    (uuidv7(), 'Banking', 'Traditional and digital banking', (SELECT id FROM categories WHERE name = 'Finance')),
    (uuidv7(), 'Investment', 'Investment management and advisory', (SELECT id FROM categories WHERE name = 'Finance')),
    (uuidv7(), 'Insurance', 'Insurance services and products', (SELECT id FROM categories WHERE name = 'Finance')),
    (uuidv7(), 'Fintech', 'Financial technology solutions', (SELECT id FROM categories WHERE name = 'Finance')),
    (uuidv7(), 'Cryptocurrency', 'Blockchain and cryptocurrency services', (SELECT id FROM categories WHERE name = 'Finance'));

-- Insert education subcategories
INSERT INTO categories (id, name, description, parent_id) VALUES
    (uuidv7(), 'Online Learning', 'E-learning platforms and courses', (SELECT id FROM categories WHERE name = 'Education')),
    (uuidv7(), 'Corporate Training', 'Professional development and training', (SELECT id FROM categories WHERE name = 'Education')),
    (uuidv7(), 'Educational Technology', 'EdTech solutions and platforms', (SELECT id FROM categories WHERE name = 'Education')),
    (uuidv7(), 'Language Learning', 'Language education and training', (SELECT id FROM categories WHERE name = 'Education'));

-- Insert consulting subcategories
INSERT INTO categories (id, name, description, parent_id) VALUES
    (uuidv7(), 'Management Consulting', 'Business strategy and operations', (SELECT id FROM categories WHERE name = 'Consulting')),
    (uuidv7(), 'IT Consulting', 'Technology consulting services', (SELECT id FROM categories WHERE name = 'Consulting')),
    (uuidv7(), 'Marketing Consulting', 'Marketing strategy and execution', (SELECT id FROM categories WHERE name = 'Consulting')),
    (uuidv7(), 'HR Consulting', 'Human resources consulting', (SELECT id FROM categories WHERE name = 'Consulting')),
    (uuidv7(), 'Legal Services', 'Legal consulting and services', (SELECT id FROM categories WHERE name = 'Consulting'));

-- Insert boost plans
INSERT INTO boost_plans (id, name, description, duration_days, price_cents) VALUES
    (uuidv7(), 'Basic Boost', 'Increase profile visibility for 7 days', 7, 999),
    (uuidv7(), 'Premium Boost', 'Enhanced visibility for 30 days', 30, 2999),
    (uuidv7(), 'Professional Boost', 'Maximum visibility for 90 days', 90, 7999);

-- Insert system roles
INSERT INTO roles (id, name, description, is_system_role) VALUES
    (uuidv7(), 'SUPER_ADMIN', 'Full system access with all permissions', true),
    (uuidv7(), 'ADMIN', 'General administrator with most permissions', true),
    (uuidv7(), 'MODERATOR', 'Content moderation and user management', true),
    (uuidv7(), 'USER', 'Regular platform user', true),
    (uuidv7(), 'PREMIUM_USER', 'Premium user with additional features', true);

-- Insert system permissions
INSERT INTO permissions (id, name, description, resource, action, is_system_permission) VALUES
    -- User management permissions
    (uuidv7(), 'users.create', 'Create new users', 'users', 'create', true),
    (uuidv7(), 'users.read', 'View user information', 'users', 'read', true),
    (uuidv7(), 'users.update', 'Update user information', 'users', 'update', true),
    (uuidv7(), 'users.delete', 'Delete users', 'users', 'delete', true),
    (uuidv7(), 'users.manage_roles', 'Assign/remove user roles', 'users', 'manage_roles', true),
    
    -- Profile management permissions
    (uuidv7(), 'profiles.create', 'Create profiles', 'profiles', 'create', true),
    (uuidv7(), 'profiles.read', 'View profiles', 'profiles', 'read', true),
    (uuidv7(), 'profiles.update', 'Update profiles', 'profiles', 'update', true),
    (uuidv7(), 'profiles.delete', 'Delete profiles', 'profiles', 'delete', true),
    (uuidv7(), 'profiles.moderate', 'Moderate profile content', 'profiles', 'moderate', true),
    
    -- Category management permissions
    (uuidv7(), 'categories.create', 'Create categories', 'categories', 'create', true),
    (uuidv7(), 'categories.read', 'View categories', 'categories', 'read', true),
    (uuidv7(), 'categories.update', 'Update categories', 'categories', 'update', true),
    (uuidv7(), 'categories.delete', 'Delete categories', 'categories', 'delete', true),
    
    -- Connection management permissions
    (uuidv7(), 'connections.create', 'Create connections', 'connections', 'create', true),
    (uuidv7(), 'connections.read', 'View connections', 'connections', 'read', true),
    (uuidv7(), 'connections.update', 'Update connections', 'connections', 'update', true),
    (uuidv7(), 'connections.delete', 'Delete connections', 'connections', 'delete', true),
    (uuidv7(), 'connections.moderate', 'Moderate connections', 'connections', 'moderate', true),
    
    -- Analytics and reporting permissions
    (uuidv7(), 'analytics.read', 'View analytics', 'analytics', 'read', true),
    (uuidv7(), 'analytics.export', 'Export analytics data', 'analytics', 'export', true),
    
    -- System administration permissions
    (uuidv7(), 'system.configure', 'Configure system settings', 'system', 'configure', true),
    (uuidv7(), 'system.monitor', 'Monitor system health', 'system', 'monitor', true),
    (uuidv7(), 'system.backup', 'Manage system backups', 'system', 'backup', true),
    
    -- Role and permission management
    (uuidv7(), 'roles.create', 'Create roles', 'roles', 'create', true),
    (uuidv7(), 'roles.read', 'View roles', 'roles', 'read', true),
    (uuidv7(), 'roles.update', 'Update roles', 'roles', 'update', true),
    (uuidv7(), 'roles.delete', 'Delete roles', 'roles', 'delete', true),
    (uuidv7(), 'permissions.read', 'View permissions', 'permissions', 'read', true),
    (uuidv7(), 'permissions.assign', 'Assign permissions to roles', 'permissions', 'assign', true);

-- Assign permissions to SUPER_ADMIN role (all permissions)
INSERT INTO role_permissions (id, role_id, permission_id) 
SELECT uuidv7(), r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'SUPER_ADMIN';

-- Assign permissions to ADMIN role (most permissions except system-critical ones)
INSERT INTO role_permissions (id, role_id, permission_id) 
SELECT uuidv7(), r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'ADMIN' 
AND p.name NOT IN ('system.configure', 'system.backup', 'roles.delete', 'users.delete');

-- Assign permissions to MODERATOR role (content moderation focused)
INSERT INTO role_permissions (id, role_id, permission_id) 
SELECT uuidv7(), r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'MODERATOR' 
AND p.name IN ('users.read', 'profiles.read', 'profiles.moderate', 'connections.read', 'connections.moderate', 'categories.read');

-- Assign permissions to USER role (basic user permissions)
INSERT INTO role_permissions (id, role_id, permission_id) 
SELECT uuidv7(), r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'USER' 
AND p.name IN ('profiles.create', 'profiles.read', 'profiles.update', 'connections.create', 'connections.read', 'connections.update', 'categories.read');

-- Assign permissions to PREMIUM_USER role (user permissions plus extras)
INSERT INTO role_permissions (id, role_id, permission_id) 
SELECT uuidv7(), r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'PREMIUM_USER' 
AND p.name IN ('profiles.create', 'profiles.read', 'profiles.update', 'connections.create', 'connections.read', 'connections.update', 'categories.read', 'analytics.read');

-- Create a default admin user (password: admin123 - should be changed in production)
INSERT INTO users (id, email, password_hash, user_type, activated_at, verified_at) VALUES
    (uuidv7(), 'admin@pbi.com', '$2a$12$vXwiSzlrgqTFCet4zdzezeDFVIu4ysqu0K1do.fm42JbjMuiOyoqW', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Create admin profile
INSERT INTO admin_profiles (id, user_id, name, department, job_title) VALUES
    (uuidv7(), (SELECT id FROM users WHERE email = 'admin@pbi.com'), 'System Administrator', 'IT', 'System Administrator');

-- Assign SUPER_ADMIN role to the default admin user
INSERT INTO user_roles (id, user_id, role_id, assigned_by) VALUES
    (uuidv7(), 
     (SELECT id FROM users WHERE email = 'admin@pbi.com'), 
     (SELECT id FROM roles WHERE name = 'SUPER_ADMIN'),
     (SELECT id FROM users WHERE email = 'admin@pbi.com')); 