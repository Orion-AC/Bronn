-- =============================================================================
-- Database Initialization Script
-- Creates separate databases for Bronn and Activepieces
-- =============================================================================

-- Create Activepieces database if it doesn't exist
SELECT 'CREATE DATABASE activepieces'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'activepieces')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE activepieces TO bronn;
