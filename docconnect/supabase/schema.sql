-- DocConnect — Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy text search on doctor names


-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
  full_name   TEXT NOT NULL,
  phone       TEXT,
  avatar_url  TEXT,
  email       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup via trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- SPECIALIZATIONS
-- ============================================================
CREATE TABLE specializations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  icon        TEXT,
  parent_id   UUID REFERENCES specializations(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed 24 primary specialties
INSERT INTO specializations (name, slug) VALUES
  ('General Practice', 'general-practice'),
  ('Cardiology', 'cardiology'),
  ('Dermatology', 'dermatology'),
  ('Pediatrics', 'pediatrics'),
  ('Obstetrics & Gynecology', 'obs-gyn'),
  ('Orthopedics', 'orthopedics'),
  ('Neurology', 'neurology'),
  ('Psychiatry', 'psychiatry'),
  ('ENT (Ear, Nose & Throat)', 'ent'),
  ('Ophthalmology', 'ophthalmology'),
  ('Surgery', 'surgery'),
  ('Internal Medicine', 'internal-medicine'),
  ('Urology', 'urology'),
  ('Nephrology', 'nephrology'),
  ('Gastroenterology', 'gastroenterology'),
  ('Pulmonology', 'pulmonology'),
  ('Endocrinology', 'endocrinology'),
  ('Oncology', 'oncology'),
  ('Rheumatology', 'rheumatology'),
  ('Radiology', 'radiology'),
  ('Pathology', 'pathology'),
  ('Emergency Medicine', 'emergency-medicine'),
  ('Anesthesiology', 'anesthesiology'),
  ('Family Medicine', 'family-medicine');


-- ============================================================
-- DOCTOR PROFILES
-- ============================================================
CREATE TABLE doctor_profiles (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  specialization_id       UUID REFERENCES specializations(id),
  bio                     TEXT,
  location_state          TEXT,
  location_city           TEXT,
  mdcn_number             TEXT UNIQUE,
  verification_status     TEXT NOT NULL DEFAULT 'pending'
                          CHECK (verification_status IN ('pending', 'pending_verification', 'verified', 'rejected')),
  one_time_rate           NUMERIC(12, 2),
  subscription_rate       NUMERIC(12, 2),
  is_online               BOOLEAN NOT NULL DEFAULT FALSE,
  last_seen               TIMESTAMPTZ,
  languages               TEXT[] NOT NULL DEFAULT '{"English"}',
  years_experience        INTEGER,
  education               TEXT,
  paystack_subaccount_code TEXT,
  slug                    TEXT NOT NULL UNIQUE,
  rating_avg              NUMERIC(3, 2) NOT NULL DEFAULT 0,
  rating_count            INTEGER NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doctor_profiles_specialization ON doctor_profiles(specialization_id);
CREATE INDEX idx_doctor_profiles_location_state ON doctor_profiles(location_state);
CREATE INDEX idx_doctor_profiles_is_online ON doctor_profiles(is_online);
CREATE INDEX idx_doctor_profiles_verification ON doctor_profiles(verification_status);

CREATE TRIGGER doctor_profiles_updated_at
  BEFORE UPDATE ON doctor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- CREDENTIALS
-- ============================================================
CREATE TABLE credentials (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id     UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  doc_type      TEXT NOT NULL CHECK (doc_type IN ('mdcn_certificate', 'medical_degree', 'residency_certificate', 'other')),
  file_url      TEXT NOT NULL,
  file_name     TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_note TEXT,
  reviewed_at   TIMESTAMPTZ,
  reviewer_id   UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credentials_doctor ON credentials(doctor_id);
CREATE INDEX idx_credentials_status ON credentials(status);


-- ============================================================
-- CHAT SESSIONS
-- ============================================================
CREATE TABLE chat_sessions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id      UUID NOT NULL REFERENCES doctor_profiles(id),
  patient_id     UUID NOT NULL REFERENCES profiles(id),
  session_type   TEXT NOT NULL DEFAULT 'one_time' CHECK (session_type IN ('one_time', 'subscription')),
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending'
                 CHECK (payment_status IN ('pending', 'success', 'failed', 'refunded')),
  amount         NUMERIC(12, 2) NOT NULL,
  platform_fee   NUMERIC(12, 2) NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_sessions_doctor ON chat_sessions(doctor_id);
CREATE INDEX idx_chat_sessions_patient ON chat_sessions(patient_id);
CREATE INDEX idx_chat_sessions_status ON chat_sessions(status);

CREATE TRIGGER chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender_id  UUID NOT NULL REFERENCES profiles(id),
  content    TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'document', 'image', 'system')),
  file_url   TEXT,
  file_name  TEXT,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_session ON messages(session_id, created_at);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_unread ON messages(session_id, is_read) WHERE is_read = FALSE;


-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE documents (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uploader_id  UUID NOT NULL REFERENCES profiles(id),
  session_id   UUID REFERENCES chat_sessions(id),
  file_url     TEXT NOT NULL,
  file_name    TEXT NOT NULL,
  file_size    BIGINT,
  mime_type    TEXT,
  ocr_text     TEXT,
  access_level TEXT NOT NULL DEFAULT 'private' CHECK (access_level IN ('private', 'session')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_uploader ON documents(uploader_id);
CREATE INDEX idx_documents_session ON documents(session_id);


-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE payments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id    UUID NOT NULL REFERENCES chat_sessions(id),
  paystack_ref  TEXT NOT NULL UNIQUE,
  amount        NUMERIC(12, 2) NOT NULL,
  platform_cut  NUMERIC(12, 2) NOT NULL,
  doctor_cut    NUMERIC(12, 2) NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_session ON payments(session_id);
CREATE INDEX idx_payments_ref ON payments(paystack_ref);


-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE subscriptions (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id           UUID NOT NULL REFERENCES profiles(id),
  doctor_id            UUID NOT NULL REFERENCES doctor_profiles(id),
  plan_amount          NUMERIC(12, 2) NOT NULL,
  paystack_plan_code   TEXT,
  paystack_sub_code    TEXT,
  start_date           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date             TIMESTAMPTZ,
  status               TEXT NOT NULL DEFAULT 'active'
                       CHECK (status IN ('active', 'cancelled', 'expired')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_patient ON subscriptions(patient_id);
CREATE INDEX idx_subscriptions_doctor ON subscriptions(doctor_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);


-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE reviews (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id  UUID NOT NULL REFERENCES doctor_profiles(id),
  patient_id UUID NOT NULL REFERENCES profiles(id),
  session_id UUID NOT NULL UNIQUE REFERENCES chat_sessions(id),
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(doctor_id, patient_id, session_id)
);

CREATE INDEX idx_reviews_doctor ON reviews(doctor_id);

-- Auto-update doctor rating on review insert/update/delete
CREATE OR REPLACE FUNCTION update_doctor_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE doctor_profiles
  SET
    rating_avg   = (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM reviews WHERE doctor_id = COALESCE(NEW.doctor_id, OLD.doctor_id)),
    rating_count = (SELECT COUNT(*) FROM reviews WHERE doctor_id = COALESCE(NEW.doctor_id, OLD.doctor_id))
  WHERE id = COALESCE(NEW.doctor_id, OLD.doctor_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER reviews_update_doctor_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_doctor_rating();


-- ============================================================
-- DOCTOR AVAILABILITY
-- ============================================================
CREATE TABLE doctor_availability (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id    UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  day_of_week  INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(doctor_id, day_of_week)
);

CREATE INDEX idx_doctor_availability_doctor ON doctor_availability(doctor_id);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;


-- PROFILES
CREATE POLICY "profiles: public read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles: own write" ON profiles FOR UPDATE USING (auth.uid() = id);

-- DOCTOR PROFILES
CREATE POLICY "doctor_profiles: public read verified" ON doctor_profiles
  FOR SELECT USING (verification_status = 'verified' OR user_id = auth.uid());
CREATE POLICY "doctor_profiles: own write" ON doctor_profiles
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "doctor_profiles: own insert" ON doctor_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- SPECIALIZATIONS (public read)
CREATE POLICY "specializations: public read" ON specializations FOR SELECT USING (true);

-- CREDENTIALS (doctor sees own, admin sees all)
CREATE POLICY "credentials: doctor own" ON credentials
  FOR SELECT USING (
    doctor_id IN (SELECT id FROM doctor_profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "credentials: doctor insert" ON credentials
  FOR INSERT WITH CHECK (
    doctor_id IN (SELECT id FROM doctor_profiles WHERE user_id = auth.uid())
  );

-- CHAT SESSIONS
CREATE POLICY "chat_sessions: participant access" ON chat_sessions
  FOR SELECT USING (
    patient_id = auth.uid()
    OR doctor_id IN (SELECT id FROM doctor_profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "chat_sessions: patient create" ON chat_sessions
  FOR INSERT WITH CHECK (patient_id = auth.uid());
CREATE POLICY "chat_sessions: participant update" ON chat_sessions
  FOR UPDATE USING (
    patient_id = auth.uid()
    OR doctor_id IN (SELECT id FROM doctor_profiles WHERE user_id = auth.uid())
  );

-- MESSAGES
CREATE POLICY "messages: session participant" ON messages
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM chat_sessions
      WHERE patient_id = auth.uid()
         OR doctor_id IN (SELECT id FROM doctor_profiles WHERE user_id = auth.uid())
    )
  );
CREATE POLICY "messages: sender insert" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "messages: read update" ON messages
  FOR UPDATE USING (sender_id = auth.uid() OR
    session_id IN (
      SELECT id FROM chat_sessions
      WHERE patient_id = auth.uid()
         OR doctor_id IN (SELECT id FROM doctor_profiles WHERE user_id = auth.uid())
    )
  );

-- DOCUMENTS
CREATE POLICY "documents: uploader access" ON documents
  FOR SELECT USING (
    uploader_id = auth.uid()
    OR session_id IN (
      SELECT id FROM chat_sessions
      WHERE patient_id = auth.uid()
         OR doctor_id IN (SELECT id FROM doctor_profiles WHERE user_id = auth.uid())
    )
  );
CREATE POLICY "documents: uploader insert" ON documents
  FOR INSERT WITH CHECK (uploader_id = auth.uid());

-- PAYMENTS
CREATE POLICY "payments: participant read" ON payments
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM chat_sessions
      WHERE patient_id = auth.uid()
         OR doctor_id IN (SELECT id FROM doctor_profiles WHERE user_id = auth.uid())
      UNION
      SELECT id FROM chat_sessions WHERE EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- SUBSCRIPTIONS
CREATE POLICY "subscriptions: participant read" ON subscriptions
  FOR SELECT USING (
    patient_id = auth.uid()
    OR doctor_id IN (SELECT id FROM doctor_profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "subscriptions: patient insert" ON subscriptions
  FOR INSERT WITH CHECK (patient_id = auth.uid());

-- REVIEWS
CREATE POLICY "reviews: public read" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews: patient insert" ON reviews
  FOR INSERT WITH CHECK (patient_id = auth.uid());

-- AVAILABILITY (public read for discovery)
CREATE POLICY "availability: public read" ON doctor_availability FOR SELECT USING (true);
CREATE POLICY "availability: doctor write" ON doctor_availability
  FOR ALL USING (doctor_id IN (SELECT id FROM doctor_profiles WHERE user_id = auth.uid()));


-- ============================================================
-- REALTIME (enable for relevant tables)
-- ============================================================
-- Run in Supabase Dashboard > Database > Replication
-- Or via: ALTER PUBLICATION supabase_realtime ADD TABLE messages, chat_sessions, doctor_profiles;


-- ============================================================
-- STORAGE BUCKETS (run separately in Supabase Storage settings)
-- ============================================================
-- bucket: 'credentials'  — private, for doctor credential files
-- bucket: 'avatars'      — public, for profile photos
-- bucket: 'documents'    — private, for patient medical documents
-- bucket: 'chat-files'   — private, for files shared in chat
