-- Migration: 001_workspaces_and_workflows.sql
-- Description: Create workspaces table and update workflows schema
-- Date: 2025-12-26

-- ============================================================================
-- STEP 1: Create workspaces table
-- ============================================================================

CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    visibility VARCHAR(20) DEFAULT 'private',
    owner_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tenant_id VARCHAR(255)
);

-- Indexes for workspaces
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_tenant_id ON workspaces(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_tenant ON workspaces(owner_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_updated_at ON workspaces(updated_at);
CREATE INDEX IF NOT EXISTS idx_workspaces_name ON workspaces(name);

-- ============================================================================
-- STEP 2: Migrate existing workflows table
-- ============================================================================

-- First, create a default workspace for existing data (if any)
INSERT INTO workspaces (id, name, description, visibility, owner_id, tenant_id)
SELECT 
    gen_random_uuid(),
    'Default Workspace',
    'Migrated workflows from legacy system',
    'private',
    COALESCE(tenant_id, 'system'),
    tenant_id
FROM (SELECT DISTINCT tenant_id FROM workflows WHERE tenant_id IS NOT NULL) AS tenants
ON CONFLICT DO NOTHING;

-- Backup old workflows table if it exists with old schema
DO $$
BEGIN
    -- Check if workflows has the old integer id column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workflows' 
        AND column_name = 'id' 
        AND data_type = 'integer'
    ) THEN
        -- Rename old table
        ALTER TABLE workflows RENAME TO workflows_legacy;
        
        -- Create new workflows table with UUID
        CREATE TABLE workflows (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(20) DEFAULT 'draft',
            definition_json JSONB,
            created_by VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            tenant_id VARCHAR(255)
        );
        
        -- Migrate data from legacy table
        INSERT INTO workflows (name, description, status, created_by, tenant_id, workspace_id)
        SELECT 
            wl.name,
            wl.description,
            COALESCE(wl.status, 'draft'),
            COALESCE(wl.tenant_id, 'system'),
            wl.tenant_id,
            (SELECT id FROM workspaces WHERE tenant_id = wl.tenant_id LIMIT 1)
        FROM workflows_legacy wl
        WHERE EXISTS (SELECT 1 FROM workspaces WHERE tenant_id = wl.tenant_id);
        
        -- Drop legacy table
        DROP TABLE workflows_legacy;
    ELSE
        -- Table already has UUID, just add workspace_id if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'workflows' 
            AND column_name = 'workspace_id'
        ) THEN
            ALTER TABLE workflows ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
        END IF;
        
        -- Add other missing columns
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'workflows' 
            AND column_name = 'definition_json'
        ) THEN
            ALTER TABLE workflows ADD COLUMN definition_json JSONB;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'workflows' 
            AND column_name = 'created_by'
        ) THEN
            ALTER TABLE workflows ADD COLUMN created_by VARCHAR(255);
        END IF;
    END IF;
END $$;

-- Create indexes for workflows
CREATE INDEX IF NOT EXISTS idx_workflows_workspace_id ON workflows(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflows_tenant_id ON workflows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflows_workspace_status ON workflows(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_workflows_updated_at ON workflows(updated_at);
CREATE INDEX IF NOT EXISTS idx_workflows_name ON workflows(name);

-- ============================================================================
-- STEP 3: Create workflow_runs table
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    logs_location VARCHAR(500),
    error_message TEXT,
    tenant_id VARCHAR(255)
);

-- Indexes for workflow_runs
CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow_id ON workflow_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow_status ON workflow_runs(workflow_id, status);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_started_at ON workflow_runs(started_at);

-- ============================================================================
-- STEP 4: Add updated_at trigger function
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to workspaces
DROP TRIGGER IF EXISTS update_workspaces_updated_at ON workspaces;
CREATE TRIGGER update_workspaces_updated_at
    BEFORE UPDATE ON workspaces
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to workflows
DROP TRIGGER IF EXISTS update_workflows_updated_at ON workflows;
CREATE TRIGGER update_workflows_updated_at
    BEFORE UPDATE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Migration complete
-- ============================================================================
