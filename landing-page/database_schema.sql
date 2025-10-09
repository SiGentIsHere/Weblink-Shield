-- Security Scanner Database Schema (PostgreSQL)
-- This script creates all tables, relationships, and constraints for the security scanning application

-- Create database (uncomment if needed)
-- CREATE DATABASE security_scanner;

-- Drop tables in reverse dependency order (if recreating)
DROP TABLE IF EXISTS ScoreReport CASCADE;
DROP TABLE IF EXISTS DetailedReport CASCADE;
DROP TABLE IF EXISTS ThreatSummary CASCADE;
DROP TABLE IF EXISTS History CASCADE;
DROP TABLE IF EXISTS UsageCounter CASCADE;
DROP TABLE IF EXISTS AuditLog CASCADE;
DROP TABLE IF EXISTS AdminAction CASCADE;
DROP TABLE IF EXISTS Review CASCADE;
DROP TABLE IF EXISTS Scan CASCADE;
DROP TABLE IF EXISTS Subscription CASCADE;
DROP TABLE IF EXISTS PlanPolicy CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS Role CASCADE;
DROP TABLE IF EXISTS Plan CASCADE;

-- Create Plan table
CREATE TABLE Plan (
    plan_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- Create Role table
CREATE TABLE Role (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Create User table (quoted because it's a reserved word in PostgreSQL)
CREATE TABLE "User" (
    user_id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Role(role_id)
);

-- Create PlanPolicy table
CREATE TABLE PlanPolicy (
    policy_id SERIAL PRIMARY KEY,
    plan_id INTEGER NOT NULL,
    daily_scan_limit INTEGER NOT NULL DEFAULT 10,
    export_allowed BOOLEAN DEFAULT FALSE,
    detailed_report_allowed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (plan_id) REFERENCES Plan(plan_id) ON DELETE CASCADE
);

-- Create Subscription table
CREATE TABLE Subscription (
    subscription_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    plan_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES Plan(plan_id) ON DELETE CASCADE
);

-- Create AdminAction table
CREATE TABLE AdminAction (
    action_id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL,
    target_user_id INTEGER NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    reason TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES "User"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES "User"(user_id) ON DELETE CASCADE
);

-- Create Review table
CREATE TABLE Review (
    review_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE
);

-- Create Scan table
CREATE TABLE Scan (
    scan_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    url_scanned VARCHAR(500) NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    analyzed_at TIMESTAMP NULL,
    status VARCHAR(20) DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE
);

-- Create History table
CREATE TABLE History (
    history_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    scan_id INTEGER NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (scan_id) REFERENCES Scan(scan_id) ON DELETE CASCADE
);

-- Create ThreatSummary table
CREATE TABLE ThreatSummary (
    summary_id SERIAL PRIMARY KEY,
    scan_id INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    FOREIGN KEY (scan_id) REFERENCES Scan(scan_id) ON DELETE CASCADE
);

-- Create DetailedReport table
CREATE TABLE DetailedReport (
    detail_id SERIAL PRIMARY KEY,
    scan_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    result TEXT NOT NULL,
    extra_info JSONB,
    recommendation TEXT,
    FOREIGN KEY (scan_id) REFERENCES Scan(scan_id) ON DELETE CASCADE
);

-- Create ScoreReport table
CREATE TABLE ScoreReport (
    detail_id INTEGER PRIMARY KEY,
    scan_id INTEGER NOT NULL,
    overall_score DECIMAL(5,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    risk_level VARCHAR(20) NOT NULL,
    FOREIGN KEY (detail_id) REFERENCES DetailedReport(detail_id) ON DELETE CASCADE,
    FOREIGN KEY (scan_id) REFERENCES Scan(scan_id) ON DELETE CASCADE
);

-- Create AuditLog table
CREATE TABLE AuditLog (
    log_id SERIAL PRIMARY KEY,
    actor_user_id INTEGER NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_user_id) REFERENCES "User"(user_id) ON DELETE CASCADE
);

-- Create UsageCounter table
CREATE TABLE UsageCounter (
    usage_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    scans_used INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE
);

-- Insert initial data for roles
INSERT INTO Role (name) VALUES 
('Free'),
('Premium'),
('Admin');

-- Insert initial plans
INSERT INTO Plan (name, description) VALUES 
('Free', 'Basic security scanning with limited features'),
('Premium', 'Advanced security scanning with detailed reports and unlimited scans'),
('Enterprise', 'Full-featured security scanning with API access and custom policies');

-- Insert plan policies
INSERT INTO PlanPolicy (plan_id, daily_scan_limit, export_allowed, detailed_report_allowed) VALUES 
(1, 5, FALSE, FALSE),   -- Free plan
(2, 100, TRUE, TRUE),   -- Premium plan
(3, -1, TRUE, TRUE);    -- Enterprise plan (unlimited scans)

-- Create indexes for better performance
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_username ON "User"(username);
CREATE INDEX idx_scan_user_id ON Scan(user_id);
CREATE INDEX idx_scan_status ON Scan(status);
CREATE INDEX idx_subscription_user_id ON Subscription(user_id);
CREATE INDEX idx_subscription_status ON Subscription(status);
CREATE INDEX idx_audit_log_actor ON AuditLog(actor_user_id);
CREATE INDEX idx_audit_log_timestamp ON AuditLog(timestamp);
CREATE INDEX idx_history_user_id ON History(user_id);
CREATE INDEX idx_usage_counter_user_id ON UsageCounter(user_id);

-- Add constraints and triggers for business logic

-- Function to update analyzed_at when scan status changes to completed
CREATE OR REPLACE FUNCTION update_scan_analyzed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.analyzed_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update analyzed_at when scan status changes to completed
CREATE TRIGGER update_scan_analyzed_at
    BEFORE UPDATE ON Scan
    FOR EACH ROW
    EXECUTE FUNCTION update_scan_analyzed_at();

-- Function to log user actions in audit log
CREATE OR REPLACE FUNCTION log_user_login()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.action = 'login' THEN
        INSERT INTO AuditLog (actor_user_id, action, entity_type, entity_id, metadata)
        VALUES (NEW.actor_user_id, 'login_attempt', 'user', NEW.entity_id, NEW.metadata);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log user actions in audit log
CREATE TRIGGER log_user_login
    AFTER INSERT ON AuditLog
    FOR EACH ROW
    EXECUTE FUNCTION log_user_login();

-- Create views for common queries
CREATE VIEW active_subscriptions AS
SELECT s.subscription_id, u.username, p.name as plan_name, s.start_date, s.end_date, s.status
FROM Subscription s
JOIN "User" u ON s.user_id = u.user_id
JOIN Plan p ON s.plan_id = p.plan_id
WHERE s.status = 'active' AND s.end_date > CURRENT_DATE;

CREATE VIEW user_scan_summary AS
SELECT 
    u.user_id,
    u.username,
    u.email,
    COUNT(s.scan_id) as total_scans,
    COUNT(CASE WHEN s.status = 'completed' THEN 1 END) as completed_scans,
    COUNT(CASE WHEN s.status = 'failed' THEN 1 END) as failed_scans,
    MAX(s.submitted_at) as last_scan_date
FROM "User" u
LEFT JOIN Scan s ON u.user_id = s.user_id
GROUP BY u.user_id, u.username, u.email;

CREATE VIEW daily_usage_stats AS
SELECT 
    u.user_id,
    u.username,
    p.name as plan_name,
    pp.daily_scan_limit,
    COUNT(s.scan_id) as scans_used_today,
    (pp.daily_scan_limit - COUNT(s.scan_id)) as remaining_scans
FROM "User" u
JOIN Subscription sub ON u.user_id = sub.user_id
JOIN Plan p ON sub.plan_id = p.plan_id
JOIN PlanPolicy pp ON p.plan_id = pp.plan_id
LEFT JOIN Scan s ON u.user_id = s.user_id AND DATE(s.submitted_at) = CURRENT_DATE
WHERE sub.status = 'active'
GROUP BY u.user_id, u.username, p.name, pp.daily_scan_limit;

-- Grant permissions (adjust as needed for your environment)
-- CREATE USER app_user WITH PASSWORD 'your_password';
-- CREATE USER readonly_user WITH PASSWORD 'your_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- End of schema creation
SELECT 'Database schema created successfully!' as status;
