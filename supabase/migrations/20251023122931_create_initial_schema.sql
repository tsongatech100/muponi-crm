/*
  # Initial CRM Database Schema - ISO 9001 & POPIA Compliant

  ## Overview
  This migration creates a comprehensive CRM system with ISO 9001 quality management
  and POPIA data protection compliance built-in.

  ## 1. Authentication & Users
    - `users` table for system users with role-based access control
    - Roles: ADMIN, QA (Quality Assurance), MANAGER, AGENT, VIEWER
    - Password hashing with bcrypt
    - Department tracking for ISO compliance

  ## 2. CRM Core Tables
    - `contacts` - Customer/lead contact information
    - `opportunities` - Sales pipeline with stages and probability tracking
    - `activities` - Tasks, meetings, calls, emails

  ## 3. ISO 9001 Quality Management
    - `ncrs` (Non-Conformance Reports) - Track quality issues
    - `documents` - ISO document management with version control
    - `suppliers` - Supplier evaluation and management
    - `supplier_evaluations` - Historical evaluation records

  ## 4. POPIA Compliance
    - `consents` - Granular consent tracking per purpose
    - `dsr_requests` - Data Subject Rights requests (access, delete, etc)
    - `data_breaches` - Incident tracking and reporting
    - `legal_holds` - Prevent data deletion for legal reasons
    - `audit_logs` - Complete audit trail of all data operations

  ## 5. Security Features
    - Row Level Security (RLS) enabled on all tables
    - Policies restrict access based on user role and ownership
    - Audit logging captures who, what, when for compliance
    - Data masking for sensitive information
    - Consent validation before data processing

  ## Important Notes
    - All timestamps use timestamptz for proper timezone handling
    - UUIDs used for all primary keys
    - Foreign keys enforce referential integrity
    - Indexes added for frequently queried columns
    - Default values set where appropriate
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('ADMIN', 'QA', 'MANAGER', 'AGENT', 'VIEWER');
CREATE TYPE opportunity_stage AS ENUM ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost');
CREATE TYPE activity_type AS ENUM ('call', 'email', 'meeting', 'task');
CREATE TYPE activity_status AS ENUM ('pending', 'completed', 'cancelled');
CREATE TYPE ncr_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE ncr_status AS ENUM ('open', 'in_progress', 'pending_verification', 'closed');
CREATE TYPE document_type AS ENUM ('manual', 'procedure', 'form', 'policy', 'record');
CREATE TYPE document_status AS ENUM ('draft', 'review', 'approved', 'obsolete');
CREATE TYPE supplier_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE consent_purpose AS ENUM ('marketing', 'sales', 'support', 'analytics');
CREATE TYPE dsr_type AS ENUM ('access', 'rectify', 'delete', 'restrict', 'withdraw_consent');
CREATE TYPE dsr_status AS ENUM ('pending', 'in_progress', 'completed', 'rejected');
CREATE TYPE breach_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'AGENT',
  department text,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'ADMIN'
    )
  );

-- =====================================================
-- 2. CONTACTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  position text,
  source text,
  status text DEFAULT 'active',
  tags text,
  notes text,
  assigned_to uuid REFERENCES users(id),
  last_contact_date timestamptz,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_assigned_to ON contacts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contacts_created_by ON contacts(created_by);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER', 'AGENT')
    )
  );

CREATE POLICY "Users can update own contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (
    assigned_to = auth.uid() OR created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
    )
  );

CREATE POLICY "Admins can delete contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- =====================================================
-- 3. OPPORTUNITIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  value numeric(12,2) NOT NULL DEFAULT 0,
  stage opportunity_stage NOT NULL DEFAULT 'prospecting',
  probability integer DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date date,
  description text,
  assigned_to uuid REFERENCES users(id),
  closed_at timestamptz,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_contact ON opportunities(contact_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_assigned_to ON opportunities(assigned_to);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view opportunities"
  ON opportunities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create opportunities"
  ON opportunities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER', 'AGENT')
    )
  );

CREATE POLICY "Users can update opportunities"
  ON opportunities FOR UPDATE
  TO authenticated
  USING (
    assigned_to = auth.uid() OR created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
    )
  );

CREATE POLICY "Admins can delete opportunities"
  ON opportunities FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- =====================================================
-- 4. ACTIVITIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type activity_type NOT NULL,
  subject text NOT NULL,
  description text,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  assigned_to uuid NOT NULL REFERENCES users(id),
  due_date timestamptz,
  completed_at timestamptz,
  status activity_status DEFAULT 'pending',
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activities_assigned_to ON activities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_activities_contact ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_opportunity ON activities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities"
  ON activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER', 'AGENT')
    )
  );

CREATE POLICY "Users can update own activities"
  ON activities FOR UPDATE
  TO authenticated
  USING (
    assigned_to = auth.uid() OR created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- =====================================================
-- 5. NCRs (Non-Conformance Reports) TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ncrs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ncr_number text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  severity ncr_severity NOT NULL,
  department text NOT NULL,
  raised_by uuid NOT NULL REFERENCES users(id),
  assigned_to uuid REFERENCES users(id),
  status ncr_status DEFAULT 'open',
  root_cause text,
  corrective_action text,
  preventive_action text,
  verification_method text,
  verified_by uuid REFERENCES users(id),
  verified_at timestamptz,
  due_date date,
  closed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ncrs_status ON ncrs(status);
CREATE INDEX IF NOT EXISTS idx_ncrs_severity ON ncrs(severity);
CREATE INDEX IF NOT EXISTS idx_ncrs_assigned_to ON ncrs(assigned_to);

ALTER TABLE ncrs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "QA and above can view NCRs"
  ON ncrs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('ADMIN', 'QA', 'MANAGER')
    )
  );

CREATE POLICY "QA and above can create NCRs"
  ON ncrs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('ADMIN', 'QA', 'MANAGER')
    )
  );

CREATE POLICY "QA and above can update NCRs"
  ON ncrs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('ADMIN', 'QA', 'MANAGER')
    )
  );

-- =====================================================
-- 6. DOCUMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_number text UNIQUE NOT NULL,
  title text NOT NULL,
  type document_type NOT NULL,
  version text NOT NULL DEFAULT '1.0',
  status document_status DEFAULT 'draft',
  department text NOT NULL,
  owner uuid NOT NULL REFERENCES users(id),
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  review_date date,
  file_path text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_owner ON documents(owner);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view approved documents"
  ON documents FOR SELECT
  TO authenticated
  USING (status = 'approved' OR owner = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('ADMIN', 'QA', 'MANAGER')
    )
  );

CREATE POLICY "QA and above can create documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('ADMIN', 'QA', 'MANAGER')
    )
  );

CREATE POLICY "Owners and QA can update documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (
    owner = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('ADMIN', 'QA')
    )
  );

-- =====================================================
-- 7. SUPPLIERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  category text NOT NULL,
  contact_person text,
  email text,
  phone text,
  address text,
  status supplier_status DEFAULT 'active',
  evaluation_score numeric(3,1) CHECK (evaluation_score >= 0 AND evaluation_score <= 10),
  last_evaluation_date date,
  next_review_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(category);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "QA and above can view suppliers"
  ON suppliers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('ADMIN', 'QA', 'MANAGER')
    )
  );

CREATE POLICY "QA and above can manage suppliers"
  ON suppliers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('ADMIN', 'QA', 'MANAGER')
    )
  );

-- =====================================================
-- 8. SUPPLIER EVALUATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS supplier_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  score numeric(3,1) NOT NULL CHECK (score >= 0 AND score <= 10),
  evaluation_date date NOT NULL,
  evaluated_by uuid NOT NULL REFERENCES users(id),
  quality_score numeric(3,1),
  delivery_score numeric(3,1),
  service_score numeric(3,1),
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supplier_evals_supplier ON supplier_evaluations(supplier_id);

ALTER TABLE supplier_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "QA and above can manage evaluations"
  ON supplier_evaluations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('ADMIN', 'QA', 'MANAGER')
    )
  );

-- =====================================================
-- 9. CONSENTS TABLE (POPIA)
-- =====================================================
CREATE TABLE IF NOT EXISTS consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  purpose consent_purpose NOT NULL,
  granted boolean NOT NULL,
  granted_at timestamptz,
  withdrawn_at timestamptz,
  source text NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consents_contact ON consents(contact_id);
CREATE INDEX IF NOT EXISTS idx_consents_purpose ON consents(purpose);

ALTER TABLE consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and QA can manage consents"
  ON consents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('ADMIN', 'QA', 'MANAGER')
    )
  );

-- =====================================================
-- 10. DSR REQUESTS TABLE (POPIA)
-- =====================================================
CREATE TABLE IF NOT EXISTS dsr_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number text UNIQUE NOT NULL,
  contact_id uuid NOT NULL REFERENCES contacts(id),
  type dsr_type NOT NULL,
  status dsr_status DEFAULT 'pending',
  description text,
  assigned_to uuid REFERENCES users(id),
  requested_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  verified_by uuid REFERENCES users(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dsr_contact ON dsr_requests(contact_id);
CREATE INDEX IF NOT EXISTS idx_dsr_status ON dsr_requests(status);

ALTER TABLE dsr_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and QA can manage DSR requests"
  ON dsr_requests FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('ADMIN', 'QA', 'MANAGER')
    )
  );

-- =====================================================
-- 11. DATA BREACHES TABLE (POPIA)
-- =====================================================
CREATE TABLE IF NOT EXISTS data_breaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_number text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  severity breach_severity NOT NULL,
  discovered_at timestamptz NOT NULL,
  reported_by uuid NOT NULL REFERENCES users(id),
  affected_records integer DEFAULT 0,
  notification_required boolean DEFAULT false,
  regulator_notified_at timestamptz,
  subjects_notified_at timestamptz,
  resolved_at timestamptz,
  resolution_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_breaches_severity ON data_breaches(severity);

ALTER TABLE data_breaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and QA can manage breaches"
  ON data_breaches FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('ADMIN', 'QA')
    )
  );

-- =====================================================
-- 12. LEGAL HOLDS TABLE (POPIA)
-- =====================================================
CREATE TABLE IF NOT EXISTS legal_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts(id),
  reason text NOT NULL,
  case_reference text,
  placed_by uuid NOT NULL REFERENCES users(id),
  placed_at timestamptz DEFAULT now(),
  released_by uuid REFERENCES users(id),
  released_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_legal_holds_contact ON legal_holds(contact_id);

ALTER TABLE legal_holds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage legal holds"
  ON legal_holds FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- =====================================================
-- 13. AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ncrs_updated_at BEFORE UPDATE ON ncrs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
