-- ============================================================
-- Big Money Realty — Seed Data
-- Run AFTER schema.sql and AFTER creating auth users
-- Replace UUIDs with real auth.users UUIDs after creation
-- ============================================================

-- Insert Big Money Realty organization
INSERT INTO bmr_organizations (id, name, slug, phone, email, website, city, state)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'Big Money Realty',
  'big-money-realty',
  '(702) 555-0100',
  'damien@bigmoneyrealty.com',
  'https://bigmoneyrealty.com',
  'Las Vegas',
  'NV'
) ON CONFLICT (id) DO NOTHING;

-- NOTE: After running schema.sql, create these 3 users in Supabase Auth:
-- 1. damien@bigmoneyrealty.com (broker_owner)
-- 2. agent1@bigmoneyrealty.com (agent)
-- 3. agent2@bigmoneyrealty.com (agent)
-- Then run the rest of this seed with real UUIDs

-- Sample leads (org-scoped, no assigned agent yet)
INSERT INTO bmr_leads (organization_id, name, email, phone, lead_type, lead_source, status, priority, message)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Marcus Johnson', 'marcus.j@email.com', '702-555-1001', 'buyer', 'Website', 'new', 'hot', 'Looking for 3BR home in Summerlin, budget $450K'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Sarah Chen', 'schen@gmail.com', '702-555-1002', 'seller', 'Zillow', 'contacted', 'warm', 'Want to sell my Henderson home in 60 days'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'David Rodriguez', 'drodriguez@yahoo.com', '702-555-1003', 'buyer', 'Facebook Ads', 'qualified', 'hot', 'First-time buyer, pre-approved $380K'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Jennifer Park', 'jpark@hotmail.com', '702-555-1004', 'valuation', 'Website', 'new', 'warm', 'Need CMA for my North Las Vegas property'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Robert Williams', 'rwilliams@email.com', '702-555-1005', 'investor', 'Referral', 'appointment', 'hot', 'Looking for multi-family properties, cash buyer'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Amanda Foster', 'afoster@gmail.com', '702-555-1006', 'seller', 'Open House', 'new', 'cold', 'Thinking about selling, no timeline yet'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Kevin Martinez', 'kmartinez@email.com', '702-555-1007', 'buyer', 'Realtor.com', 'contacted', 'warm', 'Relocating from California, need 4BR'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Lisa Thompson', 'lthompson@gmail.com', '702-555-1008', 'buyer', 'Website', 'new', 'cold', 'Just browsing, 6-12 month timeline'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Michael Davis', 'mdavis@yahoo.com', '702-555-1009', 'seller', 'Facebook Ads', 'qualified', 'hot', 'Divorce situation, needs to sell fast'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Tanya Brown', 'tbrown@email.com', '702-555-1010', 'investor', 'Referral', 'new', 'warm', 'Looking for fix-and-flip opportunities');
