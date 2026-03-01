-- DocConnect — Documents Storage Setup
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- This creates the documents bucket and adds the missing RLS policies.

-- ============================================================
-- 1. Create the 'documents' storage bucket (private, 10 MB limit)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
)
ON CONFLICT (id) DO UPDATE
  SET file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;


-- ============================================================
-- 2. Storage RLS policies for the 'documents' bucket
-- ============================================================

-- Users can upload files to their own folder ({user_id}/...)
CREATE POLICY "documents storage: own upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can read/download their own files
CREATE POLICY "documents storage: own read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own files
CREATE POLICY "documents storage: own delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);


-- ============================================================
-- 3. Add missing DELETE policy for the documents table
-- ============================================================
CREATE POLICY "documents: uploader delete" ON documents
  FOR DELETE USING (uploader_id = auth.uid());
