-- Enable Row-Level Security (RLS) for Bronn Industrialization Phase 3

-- Enable RLS on core tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Each policy ensures that users can only see/modify data belonging to their tenant_id
-- We use a session variable 'app.current_tenant' to identify the current tenant

CREATE POLICY tenant_isolation_agents ON agents
    USING (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation_workflows ON workflows
    USING (tenant_id = current_setting('app.current_tenant', true));

-- Default tenant_id for existing data
UPDATE agents SET tenant_id = 'default' WHERE tenant_id IS NULL;
UPDATE workflows SET tenant_id = 'default' WHERE tenant_id IS NULL;

-- Trigger-Based Auditing Setup
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_data JSONB,
    new_data JSONB,
    changed_by TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), current_setting('app.current_user', true));
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), current_setting('app.current_user', true));
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), current_setting('app.current_user', true));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply auditing to Agents and Workflows
DROP TRIGGER IF EXISTS audit_agents_trigger ON agents;
CREATE TRIGGER audit_agents_trigger
AFTER INSERT OR UPDATE OR DELETE ON agents
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_workflows_trigger ON workflows;
CREATE TRIGGER audit_workflows_trigger
AFTER INSERT OR UPDATE OR DELETE ON workflows
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
