-- Migration: create guest_support_requests table
-- Run this SQL against your Postgres database (psql or via your provider UI)

CREATE TABLE IF NOT EXISTS guest_support_requests (
  id SERIAL PRIMARY KEY,
  guest_name TEXT NOT NULL DEFAULT '',
  room_number TEXT NOT NULL DEFAULT '',
  request_type TEXT NOT NULL DEFAULT 'support',
  issue_category TEXT NOT NULL DEFAULT 'other',
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  staff_response TEXT NOT NULL DEFAULT '',
  staff_response_by TEXT NOT NULL DEFAULT '',
  staff_response_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
