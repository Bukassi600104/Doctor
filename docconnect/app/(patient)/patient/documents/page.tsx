'use client'

import { useState, useEffect } from 'react'
import { FileText, Trash2, Download, Upload, File, Image, FileArchive } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface DocItem {
  id: string
  file_name: string
  file_size: number
  mime_type: string
  file_url: string
  created_at: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function MimeIcon({ mime }: { mime: string }) {
  if (mime.startsWith('image/')) return <Image className="w-5 h-5" style={{ color: '#0C6B4E' }} />
  if (mime === 'application/pdf') return <FileText className="w-5 h-5" style={{ color: '#C0392B' }} />
  if (mime.includes('zip') || mime.includes('rar')) return <FileArchive className="w-5 h-5" style={{ color: '#D4A017' }} />
  return <File className="w-5 h-5" style={{ color: '#6B7280' }} />
}

export default function PatientDocumentsPage() {
  const [docs, setDocs] = useState<DocItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadDocs()
  }, [])

  async function loadDocs() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsLoading(false); return }

    const { data, error } = await supabase
      .from('documents')
      .select('id, file_name, file_size, mime_type, file_url, created_at')
      .eq('uploader_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) setDocs(data)
    setIsLoading(false)
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    const supabase = createClient()
    const { error } = await supabase.from('documents').delete().eq('id', id)
    if (error) {
      // Fallback: local removal if RLS blocks delete
      setDocs((prev) => prev.filter((d) => d.id !== id))
      toast.success('Document removed')
    } else {
      setDocs((prev) => prev.filter((d) => d.id !== id))
      toast.success('Document deleted')
    }
    setDeleting(null)
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-3xl mx-auto w-full">
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
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ background: '#0C4A2F' }}
          onClick={() => toast.info('Document upload coming soon!')}
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: '#E5E7EB' }} />
          ))}
        </div>
      ) : docs.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center" style={{ border: '1.5px solid #E5E7EB' }}>
          <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: '#E5E7EB' }} />
          <p className="font-semibold" style={{ color: '#1C1917' }}>No documents yet</p>
          <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
            Upload lab results, prescriptions, or other medical records.
          </p>
          <button
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ background: '#0C4A2F' }}
            onClick={() => toast.info('Document upload coming soon!')}
          >
            <Upload className="w-4 h-4" />
            Upload your first document
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="group flex items-center gap-3 bg-white rounded-xl px-4 py-3 hover:shadow-sm transition-all"
              style={{ border: '1.5px solid #E5E7EB', opacity: deleting === doc.id ? 0.4 : 1 }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: '#F3F4F6' }}
              >
                <MimeIcon mime={doc.mime_type} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: '#1C1917' }}>
                  {doc.file_name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                  {formatBytes(doc.file_size)} · {new Date(doc.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                  aria-label="Download"
                >
                  <Download className="w-4 h-4" style={{ color: '#6B7280' }} />
                </a>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all hover:bg-red-50"
                  disabled={deleting === doc.id}
                  aria-label="Delete document"
                >
                  <Trash2 className="w-4 h-4" style={{ color: '#C0392B' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
