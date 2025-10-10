-- =====================================================
-- SUPABASE-OPTIMIZED SECURITY SCANNER DATABASE SCHEMA
-- =====================================================
-- This script creates all tables, relationships, and constraints 
-- optimized for Supabase (PostgreSQL + Auth + RLS + Real-time)

-- =====================================================
-- 1. DROP EXISTING TABLES (if recreating)
-- =====================================================
DROP TABLE IF EXISTS scorereport CASCADE;
DROP TABLE IF EXISTS detailedreport CASCADE;
DROP TABLE IF EXISTS threatsummary CASCADE;
DROP TABLE IF EXISTS history CASCADE;
DROP TABLE IF EXISTS usagecounter CASCADE;
DROP TABLE IF EXISTS auditlog CASCADE;
DROP TABLE IF EXISTS adminaction CASCADE;
DROP TABLE IF EXISTS review CASCADE;
DROP TABLE IF EXISTS scan CASCADE;
DROP TABLE IF EXISTS subscription CASCADE;
DROP TABLE IF EXISTS planpolicy CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS role CASCADE;
DROP TABLE IF EXISTS plan CASCADE;

-- =====================================================
-- 2. CREATE CORE TABLES (ALL LOWERCASE)
-- =====================================================

-- Create plan table
CREATE TABLE plan (
    plan_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create role table
CREATE TABLE role (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table (Supabase-optimized with auth integration)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Supabase auth integration
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    -- User profile data
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    last_login TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES role(role_id)
);

-- Create planpolicy table
CREATE TABLE planpolicy (
    policy_id SERIAL PRIMARY KEY,
    plan_id INTEGER NOT NULL,
    daily_scan_limit INTEGER NOT NULL DEFAULT 10,
    monthly_scan_limit INTEGER DEFAULT 100,
    export_allowed BOOLEAN DEFAULT FALSE,
    detailed_report_allowed BOOLEAN DEFAULT FALSE,
    api_access_allowed BOOLEAN DEFAULT FALSE,
    priority_support BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plan(plan_id) ON DELETE CASCADE
);

-- Create subscription table
CREATE TABLE subscription (
    subscription_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    plan_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plan(plan_id) ON DELETE CASCADE
);

-- Create adminaction table
CREATE TABLE adminaction (
    action_id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL,
    target_user_id INTEGER NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    reason TEXT,
    metadata JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create review table
CREATE TABLE review (
    review_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create scan table (optimized for real-time updates)
CREATE TABLE scan (
    scan_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    url_scanned VARCHAR(500) NOT NULL,
    scan_type VARCHAR(50) DEFAULT 'full',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    analyzed_at TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    error_message TEXT,
    scan_duration_seconds INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create history table
CREATE TABLE history (
    history_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    scan_id INTEGER NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (scan_id) REFERENCES scan(scan_id) ON DELETE CASCADE,
    UNIQUE(user_id, scan_id) -- Prevent duplicate saves
);

-- Create threatsummary table
CREATE TABLE threatsummary (
    summary_id SERIAL PRIMARY KEY,
    scan_id INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) NOT NULL,
    description TEXT,
    confidence_score DECIMAL(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (scan_id) REFERENCES scan(scan_id) ON DELETE CASCADE
);

-- Create detailedreport table
CREATE TABLE detailedreport (
    detail_id SERIAL PRIMARY KEY,
    scan_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    result TEXT NOT NULL,
    extra_info JSONB,
    recommendation TEXT,
    technical_details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (scan_id) REFERENCES scan(scan_id) ON DELETE CASCADE
);

-- Create scorereport table
CREATE TABLE scorereport (
    detail_id INTEGER PRIMARY KEY,
    scan_id INTEGER NOT NULL,
    overall_score DECIMAL(5,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    security_score DECIMAL(5,2),
    performance_score DECIMAL(5,2),
    seo_score DECIMAL(5,2),
    accessibility_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (detail_id) REFERENCES detailedreport(detail_id) ON DELETE CASCADE,
    FOREIGN KEY (scan_id) REFERENCES scan(scan_id) ON DELETE CASCADE
);

-- Create auditlog table (optimized for real-time monitoring)
CREATE TABLE auditlog (
    log_id SERIAL PRIMARY KEY,
    actor_user_id INTEGER NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create usagecounter table
CREATE TABLE usagecounter (
    usage_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    scans_used INTEGER DEFAULT 0,
    api_calls_used INTEGER DEFAULT 0,
    last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(user_id, period_start, period_end)
);

-- =====================================================
-- 3. INSERT INITIAL DATA
-- =====================================================

-- Insert roles
INSERT INTO role (name, description) VALUES 
('Free', 'Free tier user with basic scanning features'),
('Premium', 'Premium user with advanced features and higher limits'),
('Admin', 'Administrator with full system access'),
('Enterprise', 'Enterprise user with unlimited access and custom features');

-- Insert plans
INSERT INTO plan (name, description, price) VALUES 
('Free', 'Basic security scanning with limited features', 0.00),
('Premium', 'Advanced security scanning with detailed reports', 19.99),
('Enterprise', 'Full-featured security scanning with API access', 99.99),
('Team', 'Multi-user plan for teams and organizations', 49.99);

-- Insert plan policies
INSERT INTO planpolicy (plan_id, daily_scan_limit, monthly_scan_limit, export_allowed, detailed_report_allowed, api_access_allowed, priority_support) VALUES 
(1, 5, 50, FALSE, FALSE, FALSE, FALSE),    -- Free plan
(2, 100, 1000, TRUE, TRUE, FALSE, TRUE),   -- Premium plan
(3, -1, -1, TRUE, TRUE, TRUE, TRUE),       -- Enterprise plan (unlimited)
(4, 200, 2000, TRUE, TRUE, TRUE, TRUE);    -- Team plan

-- =====================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- User table indexes
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_username ON users(username);
CREATE INDEX idx_user_auth_id ON users(auth_user_id);
CREATE INDEX idx_user_status ON users(status);

-- Scan table indexes
CREATE INDEX idx_scan_user_id ON scan(user_id);
CREATE INDEX idx_scan_status ON scan(status);
CREATE INDEX idx_scan_submitted_at ON scan(submitted_at);
CREATE INDEX idx_scan_url ON scan(url_scanned);

-- Subscription indexes
CREATE INDEX idx_subscription_user_id ON subscription(user_id);
CREATE INDEX idx_subscription_status ON subscription(status);
CREATE INDEX idx_subscription_end_date ON subscription(end_date);

-- Audit log indexes
CREATE INDEX idx_audit_log_actor ON auditlog(actor_user_id);
CREATE INDEX idx_audit_log_timestamp ON auditlog(timestamp);
CREATE INDEX idx_audit_log_action ON auditlog(action);

-- History indexes
CREATE INDEX idx_history_user_id ON history(user_id);
CREATE INDEX idx_history_scan_id ON history(scan_id);

-- Usage counter indexes
CREATE INDEX idx_usage_counter_user_id ON usagecounter(user_id);
CREATE INDEX idx_usage_counter_period ON usagecounter(period_start, period_end);

-- =====================================================
-- 5. CREATE TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update scan timestamps based on status
CREATE OR REPLACE FUNCTION update_scan_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    -- Update timestamps based on status changes
    IF NEW.status = 'processing' AND OLD.status = 'pending' THEN
        NEW.started_at = CURRENT_TIMESTAMP;
    ELSIF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.analyzed_at = CURRENT_TIMESTAMP;
        NEW.completed_at = CURRENT_TIMESTAMP;
        NEW.progress = 100;
        -- Calculate scan duration
        IF NEW.started_at IS NOT NULL THEN
            NEW.scan_duration_seconds = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at));
        END IF;
    ELSIF NEW.status = 'failed' AND OLD.status != 'failed' THEN
        NEW.completed_at = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log user actions
CREATE OR REPLACE FUNCTION log_user_action()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the action in audit log
    INSERT INTO auditlog (actor_user_id, action, entity_type, entity_id, metadata)
    VALUES (
        NEW.user_id, 
        TG_OP || '_' || TG_TABLE_NAME,
        TG_TABLE_NAME,
        NEW.scan_id,
        jsonb_build_object(
            'status', NEW.status,
            'url', NEW.url_scanned,
            'scan_type', NEW.scan_type
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_user_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_updated_at
    BEFORE UPDATE ON subscription
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_updated_at
    BEFORE UPDATE ON review
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scan_timestamps
    BEFORE UPDATE ON scan
    FOR EACH ROW
    EXECUTE FUNCTION update_scan_timestamps();

CREATE TRIGGER log_scan_actions
    AFTER INSERT OR UPDATE ON scan
    FOR EACH ROW
    EXECUTE FUNCTION log_user_action();

-- =====================================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS) - FIXED POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE review ENABLE ROW LEVEL SECURITY;
ALTER TABLE adminaction ENABLE ROW LEVEL SECURITY;
ALTER TABLE usagecounter ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE role ENABLE ROW LEVEL SECURITY;
ALTER TABLE planpolicy ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES (NO RECURSION)
-- =====================================================

-- Allow authenticated users to INSERT their own profile (for signup)
CREATE POLICY "allow_authenticated_insert_users" 
ON users
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = auth_user_id);

-- Allow users to SELECT their own profile (simple, no subquery on users)
CREATE POLICY "allow_select_own_profile" 
ON users
FOR SELECT 
TO authenticated
USING (auth.uid() = auth_user_id);

-- Allow users to UPDATE their own profile
CREATE POLICY "allow_update_own_profile" 
ON users
FOR UPDATE 
TO authenticated
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

-- =====================================================
-- SUBSCRIPTION TABLE POLICIES
-- =====================================================

-- Allow authenticated users to INSERT subscriptions
CREATE POLICY "allow_authenticated_insert_subscription" 
ON subscription
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.user_id = subscription.user_id 
    AND users.auth_user_id = auth.uid()
  )
);

-- Allow users to SELECT their own subscriptions
CREATE POLICY "allow_select_own_subscription" 
ON subscription
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.user_id = subscription.user_id 
    AND users.auth_user_id = auth.uid()
  )
);

-- Allow users to UPDATE their own subscriptions
CREATE POLICY "allow_update_own_subscription" 
ON subscription
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.user_id = subscription.user_id 
    AND users.auth_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.user_id = subscription.user_id 
    AND users.auth_user_id = auth.uid()
  )
);

-- =====================================================
-- SCAN TABLE POLICIES
-- =====================================================

-- Users can view their own scans
CREATE POLICY "allow_select_own_scans" ON scan
FOR SELECT 
TO authenticated
USING (
    user_id IN (
        SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
);

-- Users can create their own scans
CREATE POLICY "allow_insert_own_scans" ON scan
FOR INSERT 
TO authenticated
WITH CHECK (
    user_id IN (
        SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
);

-- Users can update their own scans
CREATE POLICY "allow_update_own_scans" ON scan
FOR UPDATE 
TO authenticated
USING (
    user_id IN (
        SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
);

-- =====================================================
-- HISTORY TABLE POLICIES
-- =====================================================

CREATE POLICY "allow_manage_own_history" ON history
FOR ALL 
TO authenticated
USING (
    user_id IN (
        SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
);

-- =====================================================
-- REVIEW TABLE POLICIES
-- =====================================================

CREATE POLICY "allow_manage_own_reviews" ON review
FOR ALL 
TO authenticated
USING (
    user_id IN (
        SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
);

-- =====================================================
-- USAGE COUNTER POLICIES
-- =====================================================

CREATE POLICY "allow_view_own_usage" ON usagecounter
FOR SELECT 
TO authenticated
USING (
    user_id IN (
        SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
);

-- =====================================================
-- LOOKUP TABLE POLICIES (READABLE BY ALL AUTHENTICATED USERS)
-- =====================================================

CREATE POLICY "authenticated_can_read_plans" ON plan
FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_can_read_roles" ON role
FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_can_read_policies" ON planpolicy
FOR SELECT TO authenticated USING (true);

-- =====================================================
-- 7. CREATE USEFUL VIEWS
-- =====================================================

-- Active subscriptions view
CREATE VIEW active_subscriptions AS
SELECT 
    s.subscription_id, 
    u.username, 
    u.email,
    p.name as plan_name, 
    s.start_date, 
    s.end_date, 
    s.status,
    pp.daily_scan_limit,
    pp.monthly_scan_limit,
    pp.export_allowed,
    pp.detailed_report_allowed,
    pp.api_access_allowed
FROM subscription s
JOIN users u ON s.user_id = u.user_id
JOIN plan p ON s.plan_id = p.plan_id
JOIN planpolicy pp ON p.plan_id = pp.plan_id
WHERE s.status = 'active' AND s.end_date > CURRENT_DATE;

-- User scan summary view
CREATE VIEW user_scan_summary AS
SELECT 
    u.user_id,
    u.username,
    u.email,
    r.name as role_name,
    COUNT(s.scan_id) as total_scans,
    COUNT(CASE WHEN s.status = 'completed' THEN 1 END) as completed_scans,
    COUNT(CASE WHEN s.status = 'failed' THEN 1 END) as failed_scans,
    COUNT(CASE WHEN s.status = 'pending' THEN 1 END) as pending_scans,
    MAX(s.submitted_at) as last_scan_date,
    AVG(s.scan_duration_seconds) as avg_scan_duration
FROM users u
LEFT JOIN scan s ON u.user_id = s.user_id
LEFT JOIN role r ON u.role_id = r.role_id
GROUP BY u.user_id, u.username, u.email, r.name;

-- Daily usage stats view
CREATE VIEW daily_usage_stats AS
SELECT 
    u.user_id,
    u.username,
    p.name as plan_name,
    pp.daily_scan_limit,
    COUNT(s.scan_id) as scans_used_today,
    CASE 
        WHEN pp.daily_scan_limit = -1 THEN -1
        ELSE (pp.daily_scan_limit - COUNT(s.scan_id))
    END as remaining_scans,
    CASE 
        WHEN pp.daily_scan_limit = -1 THEN false
        ELSE COUNT(s.scan_id) >= pp.daily_scan_limit
    END as limit_reached
FROM users u
JOIN subscription sub ON u.user_id = sub.user_id
JOIN plan p ON sub.plan_id = p.plan_id
JOIN planpolicy pp ON p.plan_id = pp.plan_id
LEFT JOIN scan s ON u.user_id = s.user_id AND DATE(s.submitted_at) = CURRENT_DATE
WHERE sub.status = 'active'
GROUP BY u.user_id, u.username, p.name, pp.daily_scan_limit;

-- Scan analytics view
CREATE VIEW scan_analytics AS
SELECT 
    DATE(s.submitted_at) as scan_date,
    COUNT(*) as total_scans,
    COUNT(CASE WHEN s.status = 'completed' THEN 1 END) as completed_scans,
    COUNT(CASE WHEN s.status = 'failed' THEN 1 END) as failed_scans,
    AVG(s.scan_duration_seconds) as avg_duration,
    COUNT(DISTINCT s.user_id) as unique_users
FROM scan s
WHERE s.submitted_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(s.submitted_at)
ORDER BY scan_date DESC;

-- =====================================================
-- 8. ENABLE REAL-TIME SUBSCRIPTIONS
-- =====================================================

-- Enable real-time for key tables (lowercase names)
ALTER PUBLICATION supabase_realtime ADD TABLE scan;
ALTER PUBLICATION supabase_realtime ADD TABLE auditlog;
ALTER PUBLICATION supabase_realtime ADD TABLE detailedreport;
ALTER PUBLICATION supabase_realtime ADD TABLE threatsummary;
ALTER PUBLICATION supabase_realtime ADD TABLE history;

-- =====================================================
-- 9. GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- 10. DUMMY DATA FOR TESTING
-- =====================================================

-- Note: In Supabase, you'll create users through the auth system first,
-- then link them to your User table. Here's the dummy data structure:

-- Sample user data (you'll need to create these users in Supabase Auth first)
-- Then link them using their auth UUIDs:

/*
INSERT INTO users (role_id, email, username, status, auth_user_id, first_name, last_name) VALUES 
-- Admin user (create in Supabase Auth first)
(3, 'admin@test.com', 'admin_user', 'active', '3e6ad30d-d7a6-49e3-9b85-759834dc391a', 'Admin', 'User'),

-- Premium users
(2, 'john.doe@example.com', 'john_doe', 'active', 'your-auth-uuid-here', 'John', 'Doe'),
(2, 'jane.smith@company.com', 'jane_smith', 'active', 'your-auth-uuid-here', 'Jane', 'Smith'),

-- Free tier users
(1, 'bob.wilson@email.com', 'bob_wilson', 'active', 'your-auth-uuid-here', 'Bob', 'Wilson'),
(1, 'alice.brown@gmail.com', 'alice_brown', 'active', 'your-auth-uuid-here', 'Alice', 'Brown'),

-- Suspended user
(1, 'suspended.user@test.com', 'suspended_user', 'suspended', 'your-auth-uuid-here', 'Suspended', 'User');

-- Sample subscriptions
INSERT INTO subscription (user_id, plan_id, start_date, end_date, status, auto_renew) VALUES 
(1, 2, '2024-01-01', '2024-12-31', 'active', true),   -- john_doe - Premium
(2, 2, '2024-02-01', '2024-11-30', 'active', true),   -- jane_smith - Premium
(3, 1, '2024-01-01', '2025-01-01', 'active', false),  -- bob_wilson - Free
(4, 1, '2024-02-01', '2025-02-01', 'active', false),  -- alice_brown - Free
(5, 1, '2024-01-01', '2024-01-31', 'expired', false); -- suspended_user - Free

-- Sample scans
INSERT INTO scan (user_id, url_scanned, scan_type, submitted_at, started_at, analyzed_at, completed_at, status, progress, scan_duration_seconds) VALUES 
(1, 'https://example.com', 'full', '2024-02-20 10:00:00', '2024-02-20 10:00:05', '2024-02-20 10:05:00', '2024-02-20 10:05:00', 'completed', 100, 295),
(1, 'https://test-site.org', 'full', '2024-02-21 14:30:00', '2024-02-21 14:30:05', '2024-02-21 14:35:00', '2024-02-21 14:35:00', 'completed', 100, 295),
(2, 'https://company-website.com', 'full', '2024-02-22 09:15:00', '2024-02-22 09:15:05', '2024-02-22 09:20:00', '2024-02-22 09:20:00', 'completed', 100, 295),
(3, 'https://pending-site.com', 'full', '2024-02-23 16:00:00', '2024-02-23 16:00:05', NULL, NULL, 'processing', 45, NULL),
(4, 'https://another-pending.com', 'full', '2024-02-23 17:30:00', NULL, NULL, NULL, 'pending', 0, NULL);

-- Sample detailed reports
INSERT INTO detailedreport (scan_id, type, result, extra_info, recommendation, technical_details) VALUES 
(1, 'full', 'No threats detected. Site appears secure with proper SSL configuration.', 
 '{"ssl_score": 95, "headers_secure": true, "malware_detected": false, "vulnerabilities_found": 0}', 
 'Continue regular monitoring. Consider implementing CSP headers.',
 '{"ssl_protocol": "TLS 1.3", "cipher_suite": "AES-256-GCM", "cert_valid_until": "2025-12-31"}'),

(2, 'full', 'Potential security issues detected: outdated jQuery version found.', 
 '{"jquery_version": "1.8.3", "vulnerabilities": ["CVE-2020-11022"], "ssl_score": 85, "vulnerabilities_found": 1}', 
 'Update jQuery to latest version. Enable HSTS headers.',
 '{"outdated_libraries": ["jQuery 1.8.3"], "security_headers": {"x-frame-options": "missing", "hsts": "missing"}}'),

(3, 'full', 'Site appears clean but missing security headers.', 
 '{"missing_headers": ["X-Frame-Options", "X-Content-Type-Options"], "ssl_score": 90, "vulnerabilities_found": 0}', 
 'Implement missing security headers for better protection.',
 '{"security_headers": {"x-frame-options": "missing", "x-content-type-options": "missing", "csp": "missing"}}');

-- Sample threat summaries
INSERT INTO threatsummary (scan_id, category, severity, status, description, confidence_score) VALUES 
(1, 'malware', 'low', 'clean', 'No malware signatures detected', 99.5),
(1, 'phishing', 'low', 'clean', 'No phishing indicators found', 98.2),
(1, 'ssl', 'low', 'secure', 'SSL configuration is secure', 95.0),
(2, 'malware', 'low', 'clean', 'No malware signatures detected', 99.1),
(2, 'vulnerability', 'medium', 'detected', 'Outdated jQuery library with known vulnerabilities', 87.3),
(2, 'ssl', 'low', 'secure', 'SSL configuration is mostly secure', 85.0),
(3, 'malware', 'low', 'clean', 'No malware signatures detected', 99.0),
(3, 'ssl', 'low', 'secure', 'SSL configuration is secure', 90.0);

-- Sample score reports
INSERT INTO scorereport (detail_id, scan_id, overall_score, risk_level, security_score, performance_score, seo_score, accessibility_score) VALUES 
(1, 1, 95.5, 'low', 95.0, 88.2, 92.1, 87.3),
(2, 2, 72.3, 'medium', 72.0, 85.4, 78.9, 82.1),
(3, 3, 88.7, 'low', 88.0, 91.2, 85.6, 89.4);

-- Sample reviews
INSERT INTO review (user_id, rating, comment, is_featured, created_at) VALUES 
(1, 5, 'Excellent service! Found vulnerabilities I never knew existed. The detailed reports are incredibly helpful.', true, '2024-02-21 15:00:00'),
(2, 4, 'Very helpful tool for security auditing. Great detailed reports and easy to understand recommendations.', false, '2024-02-22 10:00:00'),
(3, 5, 'Perfect for my needs. Easy to use and comprehensive results. Highly recommend!', true, '2024-02-20 12:00:00'),
(4, 3, 'Good tool but daily limits are restrictive for free users. Would consider upgrading to premium.', false, '2024-02-23 18:00:00');

-- Sample history (saved scans)
INSERT INTO history (user_id, scan_id, saved_at, notes, is_favorite) VALUES 
(1, 1, '2024-02-20 10:10:00', 'Clean scan results - bookmarking for reference', true),
(1, 2, '2024-02-21 14:40:00', 'Found jQuery vulnerability - need to update', false),
(2, 3, '2024-02-22 09:25:00', 'Good baseline scan for company website', true),
(3, 1, '2024-02-20 11:00:00', 'Interesting results - saved for comparison', false);

-- Sample usage counters
INSERT INTO usagecounter (user_id, period_start, period_end, scans_used, api_calls_used, last_reset) VALUES 
(1, '2024-02-01', '2024-02-29', 25, 0, '2024-02-01 00:00:00'),  -- john_doe (premium)
(2, '2024-02-01', '2024-02-29', 15, 0, '2024-02-01 00:00:00'),  -- jane_smith (premium)
(3, '2024-02-01', '2024-02-29', 5, 0, '2024-02-01 00:00:00'),   -- bob_wilson (free - at limit)
(4, '2024-02-01', '2024-02-29', 3, 0, '2024-02-01 00:00:00'),   -- alice_brown (free)
(1, '2024-03-01', '2024-03-31', 8, 0, '2024-03-01 00:00:00');   -- john_doe (new month)

-- Sample audit logs
INSERT INTO auditlog (actor_user_id, action, entity_type, entity_id, metadata, ip_address, user_agent, timestamp) VALUES 
(1, 'login', 'user', 1, '{"login_method": "email", "success": true}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2024-02-20 09:55:00'),
(1, 'scan_submitted', 'scan', 1, '{"url": "https://example.com", "scan_type": "full", "plan": "premium"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2024-02-20 10:00:00'),
(2, 'login', 'user', 2, '{"login_method": "email", "success": true}', '10.0.0.50', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '2024-02-21 09:10:00'),
(3, 'login', 'user', 3, '{"login_method": "email", "success": true}', '172.16.0.25', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15', '2024-02-22 08:30:00'),
(1, 'admin_action', 'admin_action', 1, '{"action": "suspend_user", "target": 5, "reason": "Terms violation"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2024-01-30 14:00:00');
*/

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

SELECT 'Supabase-optimized database schema created successfully!' as status;

-- =====================================================
-- NEXT STEPS FOR SUPABASE SETUP:
-- =====================================================
-- 1. Create users in Supabase Auth dashboard
-- 2. Get their auth UUIDs from auth.users table
-- 3. Insert user records with the auth UUIDs
-- 4. Test the dummy data by running the commented INSERT statements above
-- 5. Set up real-time subscriptions in your frontend
-- 6. Configure your application to use the RLS policies
