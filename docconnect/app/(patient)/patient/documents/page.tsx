'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  FileText, Trash2, Download, Upload, File, Image as ImageIcon,
  FileArchive, Loader2, CheckCircle2, X, CloudUpload,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// ── Constants ─────────────────────────────────────────────────────────────────

const BUCKET = 'documents'

const ALLOWED_MIME = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
]

const ALLOWED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.xls,.xlsx,.txt'
const MAX_MB = 10
const MAX_BYTES = MAX_MB * 1024 * 1024

// ── Types ─────────────────────────────────────────────────────────────────────

interface DocItem {
  id: string
  file_name: string
  file_size: number
  mime_type: string
  storage_path: string   // path inside Supabase Storage bucket
  created_at: string
  signedUrl: string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function MimeIcon({ mime }: { mime: string }) {
  if (mime.startsWith('image/')) return <ImageIcon className="w-5 h-5" style={{ color: '#0C6B4E' }} />
  if (mime === 'application/pdf') return <FileText className="w-5 h-5" style={{ color: '#C0392B' }} />
  if (mime.includes('zip') || mime.includes('rar')) return <FileArchive className="w-5 h-5" style={{ color: '#D4A017' }} />
  return <File className="w-5 h-5" style={{ color: '#6B7280' }} />
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#E5E7EB' }}>
      <div
        className="h-full rounded-full transition-all duration-200"
        style={{ width: `${value}%`, background: '#0C4A2F' }}
      />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PatientDocumentsPage() {
  const [docs, setDocs] = useState<DocItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadFileName, setUploadFileName] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadDocs()
  }, [])

  // ── Load documents ──────────────────────────────────────────────────────────

  async function loadDocs() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsLoading(false); return }

    const { data, error } = await supabase
      .from('documents')
      .select('id, file_name, file_size, mime_type, file_url, created_at')
      .eq('uploader_id', user.id)
      .order('created_at', { ascending: false })

    if (error || !data?.length) { setIsLoading(false); return }

    // Batch-generate signed URLs (1 hour) for the private bucket
    const paths = data.map((d: { file_url: string }) => d.file_url)
    const { data: signedUrls } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(paths, 3600)

    const signedMap = new Map(
      (signedUrls ?? []).map(
        (s: { path: string | null; signedUrl: string | null }) => [s.path, s.signedUrl]
      )
    )

    setDocs(
      data.map((d: { id: string; file_name: string; file_size: number; mime_type: string; file_url: string; created_at: string }) => ({
        id: d.id,
        file_name: d.file_name,
        file_size: d.file_size ?? 0,
        mime_type: d.mime_type ?? 'application/octet-stream',
        storage_path: d.file_url,
        created_at: d.created_at,
        signedUrl: signedMap.get(d.file_url) ?? null,
      }))
    )
    setIsLoading(false)
  }

  // ── Upload ─────────────────────────────────────────────────────────────────

  async function uploadFile(file: File) {
    // Validate MIME
    if (!ALLOWED_MIME.includes(file.type)) {
      toast.error('Unsupported file type. Allowed: PDF, images, Word, Excel, text.')
      return
    }
    // Validate size
    if (file.size > MAX_BYTES) {
      toast.error(`File too large — maximum is ${MAX_MB} MB.`)
      return
    }

    setUploading(true)
    setUploadProgress(5)
    setUploadFileName(file.name)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return }

    // Sanitize filename and build storage path
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `${user.id}/${Date.now()}-${safeName}`

    // Animate progress to 80% while uploading
    const ticker = setInterval(() => {
      setUploadProgress((p) => (p < 80 ? p + 8 : p))
    }, 250)

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    clearInterval(ticker)

    if (uploadError) {
      setUploading(false)
      setUploadProgress(0)
      if (uploadError.message.includes('Bucket not found')) {
        toast.error('Storage bucket "documents" is not set up yet. Please create it in Supabase Dashboard → Storage.')
      } else {
        toast.error(`Upload failed: ${uploadError.message}`)
      }
      return
    }

    setUploadProgress(90)

    // Generate a 1-hour signed URL for immediate display
    const { data: signedData } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, 3600)

    // Insert record into `documents` table
    const { data: record, error: dbError } = await supabase
      .from('documents')
      .insert({
        uploader_id: user.id,
        file_url: storagePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        access_level: 'private',
      })
      .select('id, created_at')
      .single()

    if (dbError) {
      // Roll back: remove from storage
      await supabase.storage.from(BUCKET).remove([storagePath])
      setUploading(false)
      setUploadProgress(0)
      toast.error('Upload failed: could not save document record.')
      return
    }

    setUploadProgress(100)

    // Optimistically prepend to list
    setDocs((prev) => [
      {
        id: record.id,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_path: storagePath,
        created_at: record.created_at,
        signedUrl: signedData?.signedUrl ?? null,
      },
      ...prev,
    ])

    setTimeout(() => {
      setUploading(false)
      setUploadProgress(0)
      setUploadFileName('')
    }, 600)

    toast.success(`"${file.name}" uploaded!`)
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting same file
    if (file) uploadFile(file)
  }

  // ── Drag & drop ─────────────────────────────────────────────────────────────

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Download ────────────────────────────────────────────────────────────────

  async function handleDownload(doc: DocItem) {
    // Always regenerate a fresh 5-minute signed URL for download
    const supabase = createClient()
    const { data } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(doc.storage_path, 300)

    const url = data?.signedUrl ?? doc.signedUrl
    if (!url) { toast.error('Could not generate download link'); return }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  async function handleDelete(doc: DocItem) {
    setDeleting(doc.id)
    const supabase = createClient()

    // Remove file from storage
    await supabase.storage.from(BUCKET).remove([doc.storage_path])

    // Try to remove DB record (may fail if RLS DELETE policy not set — safe to ignore)
    await supabase.from('documents').delete().eq('id', doc.id)

    setDocs((prev) => prev.filter((d) => d.id !== doc.id))
    setDeleting(null)
    toast.success('Document deleted')
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-3xl mx-auto w-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_EXTENSIONS}
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: '"Palatino Linotype", Palatino, Georgia, serif', color: '#1C1917' }}
          >
            My Documents
          </h1>
          <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
            Lab results, prescriptions, and medical records
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
          style={{ background: '#0C4A2F' }}
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </div>

      {/* Upload progress bar */}
      {uploading && (
        <div className="mb-4 rounded-xl p-4 bg-white" style={{ border: '1.5px solid #E5E7EB' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#0C4A2F' }} />
              <span className="text-sm font-medium truncate max-w-xs" style={{ color: '#1C1917' }}>
                {uploadFileName}
              </span>
            </div>
            <span className="text-xs font-semibold" style={{ color: '#0C4A2F' }}>
              {uploadProgress < 100 ? `${uploadProgress}%` : <CheckCircle2 className="w-4 h-4 text-green-500 inline" />}
            </span>
          </div>
          <ProgressBar value={uploadProgress} />
        </div>
      )}

      {/* Drag overlay */}
      {isDragOver && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(12,74,47,0.15)', backdropFilter: 'blur(2px)' }}
        >
          <div className="flex flex-col items-center gap-3 p-8 rounded-2xl bg-white shadow-xl" style={{ border: '2px dashed #0C4A2F' }}>
            <CloudUpload className="w-10 h-10" style={{ color: '#0C4A2F' }} />
            <p className="font-bold text-lg" style={{ color: '#0C4A2F' }}>Drop your file here</p>
            <p className="text-sm" style={{ color: '#9CA3AF' }}>PDF, images, Word, Excel — max {MAX_MB} MB</p>
          </div>
        </div>
      )}

      {/* Allowed types hint */}
      <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>
        Supported: PDF, JPG, PNG, Word, Excel, TXT · Max {MAX_MB} MB · Drag & drop anywhere on this page
      </p>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: '#E5E7EB' }} />
          ))}
        </div>
      ) : docs.length === 0 ? (
        <div
          className="rounded-2xl bg-white p-10 text-center cursor-pointer transition-all hover:shadow-sm"
          style={{ border: '2px dashed #E5E7EB' }}
          onClick={() => fileInputRef.current?.click()}
        >
          <CloudUpload className="w-12 h-12 mx-auto mb-3" style={{ color: '#D1D5DB' }} />
          <p className="font-semibold" style={{ color: '#1C1917' }}>No documents yet</p>
          <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
            Click here or drag & drop a file to upload your first document.
          </p>
          <p className="text-xs mt-2" style={{ color: '#D1D5DB' }}>
            PDF, images, Word, Excel, text — max {MAX_MB} MB
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="group flex items-center gap-3 bg-white rounded-xl px-4 py-3 hover:shadow-sm transition-all"
              style={{ border: '1.5px solid #E5E7EB', opacity: deleting === doc.id ? 0.4 : 1, transition: 'opacity 0.3s' }}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: '#F3F4F6' }}
              >
                <MimeIcon mime={doc.mime_type} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: '#1C1917' }}>
                  {doc.file_name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                  {formatBytes(doc.file_size)} · {new Date(doc.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleDownload(doc)}
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                  aria-label="Download"
                  title="Download"
                >
                  <Download className="w-4 h-4" style={{ color: '#6B7280' }} />
                </button>
                <button
                  onClick={() => handleDelete(doc)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all hover:bg-red-50"
                  disabled={deleting === doc.id}
                  aria-label="Delete document"
                  title="Delete"
                >
                  {deleting === doc.id
                    ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#C0392B' }} />
                    : <X className="w-4 h-4" style={{ color: '#C0392B' }} />
                  }
                </button>
              </div>
            </div>
          ))}

          {/* Upload another */}
          <button
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all hover:shadow-sm disabled:opacity-60"
            style={{ border: '1.5px dashed #E5E7EB', color: '#9CA3AF', background: 'transparent' }}
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            Upload another document
          </button>
        </div>
      )}
    </div>
  )
}
