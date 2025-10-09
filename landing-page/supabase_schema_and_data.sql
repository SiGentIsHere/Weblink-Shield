-- =====================================================
-- SUPABASE-OPTIMIZED SECURITY SCANNER DATABASE SCHEMA
-- =====================================================
-- This script creates all tables, relationships, and constraints 
-- optimized for Supabase (PostgreSQL + Auth + RLS + Real-time)

-- =====================================================
-- 1. DROP EXISTING TABLES (if recreating)
-- =====================================================
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

-- =====================================================
-- 2. CREATE CORE TABLES
-- =====================================================

-- Create Plan table
CREATE TABLE Plan (
    plan_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Role table
CREATE TABLE Role (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create User table (Supabase-optimized with auth integration)
CREATE TABLE "User" (
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
    FOREIGN KEY (role_id) REFERENCES Role(role_id)
);

-- Create PlanPolicy table
CREATE TABLE PlanPolicy (
    policy_id SERIAL PRIMARY KEY,
    plan_id INTEGER NOT NULL,
    daily_scan_limit INTEGER NOT NULL DEFAULT 10,
    monthly_scan_limit INTEGER DEFAULT 100,
    export_allowed BOOLEAN DEFAULT FALSE,
    detailed_report_allowed BOOLEAN DEFAULT FALSE,
    api_access_allowed BOOLEAN DEFAULT FALSE,
    priority_support BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    metadata JSONB,
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
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE
);

-- Create Scan table (optimized for real-time updates)
CREATE TABLE Scan (
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
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE
);

-- Create History table
CREATE TABLE History (
    history_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    scan_id INTEGER NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (scan_id) REFERENCES Scan(scan_id) ON DELETE CASCADE,
    UNIQUE(user_id, scan_id) -- Prevent duplicate saves
);

-- Create ThreatSummary table
CREATE TABLE ThreatSummary (
    summary_id SERIAL PRIMARY KEY,
    scan_id INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) NOT NULL,
    description TEXT,
    confidence_score DECIMAL(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    technical_details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (scan_id) REFERENCES Scan(scan_id) ON DELETE CASCADE
);

-- Create ScoreReport table
CREATE TABLE ScoreReport (
    detail_id INTEGER PRIMARY KEY,
    scan_id INTEGER NOT NULL,
    overall_score DECIMAL(5,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    security_score DECIMAL(5,2),
    performance_score DECIMAL(5,2),
    seo_score DECIMAL(5,2),
    accessibility_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (detail_id) REFERENCES DetailedReport(detail_id) ON DELETE CASCADE,
    FOREIGN KEY (scan_id) REFERENCES Scan(scan_id) ON DELETE CASCADE
);

-- Create AuditLog table (optimized for real-time monitoring)
CREATE TABLE AuditLog (
    log_id SERIAL PRIMARY KEY,
    actor_user_id INTEGER NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
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
    api_calls_used INTEGER DEFAULT 0,
    last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE,
    UNIQUE(user_id, period_start, period_end)
);

-- =====================================================
-- 3. INSERT INITIAL DATA
-- =====================================================

-- Insert roles
INSERT INTO Role (name, description) VALUES 
('Free', 'Free tier user with basic scanning features'),
('Premium', 'Premium user with advanced features and higher limits'),
('Admin', 'Administrator with full system access'),
('Enterprise', 'Enterprise user with unlimited access and custom features');

-- Insert plans
INSERT INTO Plan (name, description, price) VALUES 
('Free', 'Basic security scanning with limited features', 0.00),
('Premium', 'Advanced security scanning with detailed reports', 19.99),
('Enterprise', 'Full-featured security scanning with API access', 99.99),
('Team', 'Multi-user plan for teams and organizations', 49.99);

-- Insert plan policies
INSERT INTO PlanPolicy (plan_id, daily_scan_limit, monthly_scan_limit, export_allowed, detailed_report_allowed, api_access_allowed, priority_support) VALUES 
(1, 5, 50, FALSE, FALSE, FALSE, FALSE),    -- Free plan
(2, 100, 1000, TRUE, TRUE, FALSE, TRUE),   -- Premium plan
(3, -1, -1, TRUE, TRUE, TRUE, TRUE),       -- Enterprise plan (unlimited)
(4, 200, 2000, TRUE, TRUE, TRUE, TRUE);    -- Team plan

-- =====================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- User table indexes
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_username ON "User"(username);
CREATE INDEX idx_user_auth_id ON "User"(auth_user_id);
CREATE INDEX idx_user_status ON "User"(status);

-- Scan table indexes
CREATE INDEX idx_scan_user_id ON Scan(user_id);
CREATE INDEX idx_scan_status ON Scan(status);
CREATE INDEX idx_scan_submitted_at ON Scan(submitted_at);
CREATE INDEX idx_scan_url ON Scan(url_scanned);

-- Subscription indexes
CREATE INDEX idx_subscription_user_id ON Subscription(user_id);
CREATE INDEX idx_subscription_status ON Subscription(status);
CREATE INDEX idx_subscription_end_date ON Subscription(end_date);

-- Audit log indexes
CREATE INDEX idx_audit_log_actor ON AuditLog(actor_user_id);
CREATE INDEX idx_audit_log_timestamp ON AuditLog(timestamp);
CREATE INDEX idx_audit_log_action ON AuditLog(action);

-- History indexes
CREATE INDEX idx_history_user_id ON History(user_id);
CREATE INDEX idx_history_scan_id ON History(scan_id);

-- Usage counter indexes
CREATE INDEX idx_usage_counter_user_id ON UsageCounter(user_id);
CREATE INDEX idx_usage_counter_period ON UsageCounter(period_start, period_end);

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
    INSERT INTO AuditLog (actor_user_id, action, entity_type, entity_id, metadata)
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
    BEFORE UPDATE ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_updated_at
    BEFORE UPDATE ON Subscription
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_updated_at
    BEFORE UPDATE ON Review
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scan_timestamps
    BEFORE UPDATE ON Scan
    FOR EACH ROW
    EXECUTE FUNCTION update_scan_timestamps();

CREATE TRIGGER log_scan_actions
    AFTER INSERT OR UPDATE ON Scan
    FOR EACH ROW
    EXECUTE FUNCTION log_user_action();

-- =====================================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE Scan ENABLE ROW LEVEL SECURITY;
ALTER TABLE Subscription ENABLE ROW LEVEL SECURITY;
ALTER TABLE History ENABLE ROW LEVEL SECURITY;
ALTER TABLE Review ENABLE ROW LEVEL SECURITY;
ALTER TABLE AdminAction ENABLE ROW LEVEL SECURITY;
ALTER TABLE UsageCounter ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON "User"
    FOR SELECT USING (auth.uid()::text = auth_user_id::text);

CREATE POLICY "Users can update own profile" ON "User"
    FOR UPDATE USING (auth.uid()::text = auth_user_id::text);

-- Users can only see their own scans
CREATE POLICY "Users can view own scans" ON Scan
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM "User" WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own scans" ON Scan
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT user_id FROM "User" WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own scans" ON Scan
    FOR UPDATE USING (
        user_id IN (
            SELECT user_id FROM "User" WHERE auth_user_id = auth.uid()
        )
    );

-- Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON Subscription
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM "User" WHERE auth_user_id = auth.uid()
        )
    );

-- Users can only see their own history
CREATE POLICY "Users can view own history" ON History
    FOR ALL USING (
        user_id IN (
            SELECT user_id FROM "User" WHERE auth_user_id = auth.uid()
        )
    );

-- Users can only see their own reviews
CREATE POLICY "Users can manage own reviews" ON Review
    FOR ALL USING (
        user_id IN (
            SELECT user_id FROM "User" WHERE auth_user_id = auth.uid()
        )
    );

-- Users can only see their own usage counters
CREATE POLICY "Users can view own usage" ON UsageCounter
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM "User" WHERE auth_user_id = auth.uid()
        )
    );

-- Admin policies (admins can see everything)
CREATE POLICY "Admins can view all users" ON "User"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "User" u 
            JOIN Role r ON u.role_id = r.role_id 
            WHERE u.auth_user_id = auth.uid() 
            AND r.name IN ('Admin', 'Enterprise')
        )
    );

CREATE POLICY "Admins can view all scans" ON Scan
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "User" u 
            JOIN Role r ON u.role_id = r.role_id 
            WHERE u.auth_user_id = auth.uid() 
            AND r.name IN ('Admin', 'Enterprise')
        )
    );

-- Public policies (everyone can see certain data)
CREATE POLICY "Everyone can view plans" ON Plan FOR SELECT TO public USING (true);
CREATE POLICY "Everyone can view roles" ON Role FOR SELECT TO public USING (true);
CREATE POLICY "Everyone can view plan policies" ON PlanPolicy FOR SELECT TO public USING (true);

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
FROM Subscription s
JOIN "User" u ON s.user_id = u.user_id
JOIN Plan p ON s.plan_id = p.plan_id
JOIN PlanPolicy pp ON p.plan_id = pp.plan_id
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
FROM "User" u
LEFT JOIN Scan s ON u.user_id = s.user_id
LEFT JOIN Role r ON u.role_id = r.role_id
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
FROM "User" u
JOIN Subscription sub ON u.user_id = sub.user_id
JOIN Plan p ON sub.plan_id = p.plan_id
JOIN PlanPolicy pp ON p.plan_id = pp.plan_id
LEFT JOIN Scan s ON u.user_id = s.user_id AND DATE(s.submitted_at) = CURRENT_DATE
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
FROM Scan s
WHERE s.submitted_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(s.submitted_at)
ORDER BY scan_date DESC;

-- =====================================================
-- 8. ENABLE REAL-TIME SUBSCRIPTIONS
-- =====================================================

-- Enable real-time for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE Scan;
ALTER PUBLICATION supabase_realtime ADD TABLE AuditLog;
ALTER PUBLICATION supabase_realtime ADD TABLE DetailedReport;
ALTER PUBLICATION supabase_realtime ADD TABLE ThreatSummary;

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
INSERT INTO "User" (role_id, email, username, status, auth_user_id, first_name, last_name) VALUES 
-- Admin user (create in Supabase Auth first)
(3, 'admin@securityscanner.com', 'admin_user', 'active', 'your-auth-uuid-here', 'Admin', 'User'),

-- Premium users
(2, 'john.doe@example.com', 'john_doe', 'active', 'your-auth-uuid-here', 'John', 'Doe'),
(2, 'jane.smith@company.com', 'jane_smith', 'active', 'your-auth-uuid-here', 'Jane', 'Smith'),

-- Free tier users
(1, 'bob.wilson@email.com', 'bob_wilson', 'active', 'your-auth-uuid-here', 'Bob', 'Wilson'),
(1, 'alice.brown@gmail.com', 'alice_brown', 'active', 'your-auth-uuid-here', 'Alice', 'Brown'),

-- Suspended user
(1, 'suspended.user@test.com', 'suspended_user', 'suspended', 'your-auth-uuid-here', 'Suspended', 'User');

-- Sample subscriptions
INSERT INTO Subscription (user_id, plan_id, start_date, end_date, status, auto_renew) VALUES 
(1, 2, '2024-01-01', '2024-12-31', 'active', true),   -- john_doe - Premium
(2, 2, '2024-02-01', '2024-11-30', 'active', true),   -- jane_smith - Premium
(3, 1, '2024-01-01', '2025-01-01', 'active', false),  -- bob_wilson - Free
(4, 1, '2024-02-01', '2025-02-01', 'active', false),  -- alice_brown - Free
(5, 1, '2024-01-01', '2024-01-31', 'expired', false); -- suspended_user - Free

-- Sample scans
INSERT INTO Scan (user_id, url_scanned, scan_type, submitted_at, started_at, analyzed_at, completed_at, status, progress, scan_duration_seconds) VALUES 
(1, 'https://example.com', 'full', '2024-02-20 10:00:00', '2024-02-20 10:00:05', '2024-02-20 10:05:00', '2024-02-20 10:05:00', 'completed', 100, 295),
(1, 'https://test-site.org', 'full', '2024-02-21 14:30:00', '2024-02-21 14:30:05', '2024-02-21 14:35:00', '2024-02-21 14:35:00', 'completed', 100, 295),
(2, 'https://company-website.com', 'full', '2024-02-22 09:15:00', '2024-02-22 09:15:05', '2024-02-22 09:20:00', '2024-02-22 09:20:00', 'completed', 100, 295),
(3, 'https://pending-site.com', 'full', '2024-02-23 16:00:00', '2024-02-23 16:00:05', NULL, NULL, 'processing', 45, NULL),
(4, 'https://another-pending.com', 'full', '2024-02-23 17:30:00', NULL, NULL, NULL, 'pending', 0, NULL);

-- Sample detailed reports
INSERT INTO DetailedReport (scan_id, type, result, extra_info, recommendation, technical_details) VALUES 
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
INSERT INTO ThreatSummary (scan_id, category, severity, status, description, confidence_score) VALUES 
(1, 'malware', 'low', 'clean', 'No malware signatures detected', 99.5),
(1, 'phishing', 'low', 'clean', 'No phishing indicators found', 98.2),
(1, 'ssl', 'low', 'secure', 'SSL configuration is secure', 95.0),
(2, 'malware', 'low', 'clean', 'No malware signatures detected', 99.1),
(2, 'vulnerability', 'medium', 'detected', 'Outdated jQuery library with known vulnerabilities', 87.3),
(2, 'ssl', 'low', 'secure', 'SSL configuration is mostly secure', 85.0),
(3, 'malware', 'low', 'clean', 'No malware signatures detected', 99.0),
(3, 'ssl', 'low', 'secure', 'SSL configuration is secure', 90.0);

-- Sample score reports
INSERT INTO ScoreReport (detail_id, scan_id, overall_score, risk_level, security_score, performance_score, seo_score, accessibility_score) VALUES 
(1, 1, 95.5, 'low', 95.0, 88.2, 92.1, 87.3),
(2, 2, 72.3, 'medium', 72.0, 85.4, 78.9, 82.1),
(3, 3, 88.7, 'low', 88.0, 91.2, 85.6, 89.4);

-- Sample reviews
INSERT INTO Review (user_id, rating, comment, is_featured, created_at) VALUES 
(1, 5, 'Excellent service! Found vulnerabilities I never knew existed. The detailed reports are incredibly helpful.', true, '2024-02-21 15:00:00'),
(2, 4, 'Very helpful tool for security auditing. Great detailed reports and easy to understand recommendations.', false, '2024-02-22 10:00:00'),
(3, 5, 'Perfect for my needs. Easy to use and comprehensive results. Highly recommend!', true, '2024-02-20 12:00:00'),
(4, 3, 'Good tool but daily limits are restrictive for free users. Would consider upgrading to premium.', false, '2024-02-23 18:00:00');

-- Sample history (saved scans)
INSERT INTO History (user_id, scan_id, saved_at, notes, is_favorite) VALUES 
(1, 1, '2024-02-20 10:10:00', 'Clean scan results - bookmarking for reference', true),
(1, 2, '2024-02-21 14:40:00', 'Found jQuery vulnerability - need to update', false),
(2, 3, '2024-02-22 09:25:00', 'Good baseline scan for company website', true),
(3, 1, '2024-02-20 11:00:00', 'Interesting results - saved for comparison', false);

-- Sample usage counters
INSERT INTO UsageCounter (user_id, period_start, period_end, scans_used, api_calls_used, last_reset) VALUES 
(1, '2024-02-01', '2024-02-29', 25, 0, '2024-02-01 00:00:00'),  -- john_doe (premium)
(2, '2024-02-01', '2024-02-29', 15, 0, '2024-02-01 00:00:00'),  -- jane_smith (premium)
(3, '2024-02-01', '2024-02-29', 5, 0, '2024-02-01 00:00:00'),   -- bob_wilson (free - at limit)
(4, '2024-02-01', '2024-02-29', 3, 0, '2024-02-01 00:00:00'),   -- alice_brown (free)
(1, '2024-03-01', '2024-03-31', 8, 0, '2024-03-01 00:00:00');   -- john_doe (new month)

-- Sample audit logs
INSERT INTO AuditLog (actor_user_id, action, entity_type, entity_id, metadata, ip_address, user_agent, timestamp) VALUES 
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
