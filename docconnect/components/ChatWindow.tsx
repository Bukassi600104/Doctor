'use client'

import { useState, useRef, useEffect } from 'react'
import { cn, formatRelativeTime, getInitials } from '@/lib/utils'
import { OnlineIndicator } from '@/components/OnlineIndicator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Send,
  Paperclip,
  ArrowLeft,
  Check,
  CheckCheck,
  Download,
  FileText,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageType = 'text' | 'file' | 'system'

interface Message {
  id: string
  type: MessageType
  content: string
  senderId: string
  timestamp: string
  read: boolean
  fileName?: string
  fileUrl?: string
}

interface ChatWindowProps {
  sessionId: string
  currentUserId: string
  otherUser: {
    name: string
    avatar_url: string | null
    role: 'doctor' | 'patient'
  }
}

// ─── Placeholder Data (TODO: Replace with Supabase Realtime) ─────────────────

function getPlaceholderMessages(currentUserId: string, otherUserId: string): Message[] {
  return [
    {
      id: '1',
      type: 'system',
      content: 'Session started',
      senderId: 'system',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: true,
    },
    {
      id: '2',
      type: 'text',
      content: 'Good day, doctor. I have been experiencing persistent headaches for the past week.',
      senderId: otherUserId,
      timestamp: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
      read: true,
    },
    {
      id: '3',
      type: 'text',
      content: 'Good day! I\'m sorry to hear that. Can you describe the pain? Is it throbbing or constant? Which part of your head does it affect?',
      senderId: currentUserId,
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      read: true,
    },
    {
      id: '4',
      type: 'text',
      content: 'It\'s mostly on the right side, throbbing. It gets worse when I\'m in bright light.',
      senderId: otherUserId,
      timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
      read: true,
    },
    {
      id: '5',
      type: 'file',
      content: 'I\'ve attached my recent test results.',
      senderId: otherUserId,
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      read: true,
      fileName: 'blood_test_results.pdf',
      fileUrl: '#',
    },
    {
      id: '6',
      type: 'text',
      content: 'Thank you for sharing those. Based on what you\'ve described — unilateral throbbing pain with photosensitivity — this sounds like it could be a migraine. Let me review your test results.',
      senderId: currentUserId,
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      read: true,
    },
    {
      id: '7',
      type: 'text',
      content: 'Your blood work looks normal. I\'d recommend trying ibuprofen 400mg at the onset, resting in a dark room, and keeping a headache diary. If symptoms persist beyond 2 weeks, we should consider imaging.',
      senderId: currentUserId,
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      read: false,
    },
  ]
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  message,
  isOwn,
}: {
  message: Message
  isOwn: boolean
}) {
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-4">
        <span className="text-xs text-muted-foreground bg-gray-100 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div className={cn('flex gap-2 mb-3', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2.5 space-y-1',
          isOwn
            ? 'rounded-tr-sm text-white'
            : 'rounded-tl-sm bg-gray-100 text-gray-900'
        )}
        style={isOwn ? { background: 'linear-gradient(135deg, #6C3CE1, #5429c4)' } : {}}
      >
        {/* File attachment */}
        {message.type === 'file' && message.fileName && (
          <div
            className={cn(
              'flex items-center gap-2 p-2 rounded-lg mb-1',
              isOwn ? 'bg-white/15' : 'bg-white border border-gray-200'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                isOwn ? 'bg-white/20' : 'bg-[#6C3CE1]/10'
              )}
            >
              <FileText className={cn('w-4 h-4', isOwn ? 'text-white' : 'text-[#6C3CE1]')} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn('text-xs font-medium truncate', isOwn ? 'text-white' : 'text-gray-800')}>
                {message.fileName}
              </p>
            </div>
            {message.fileUrl && (
              <a
                href={message.fileUrl}
                download={message.fileName}
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                  isOwn ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-100 hover:bg-gray-200'
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <Download className={cn('w-3 h-3', isOwn ? 'text-white' : 'text-gray-600')} />
              </a>
            )}
          </div>
        )}

        {/* Text content */}
        <p className="text-sm leading-relaxed">{message.content}</p>

        {/* Timestamp + Read receipt */}
        <div className={cn('flex items-center gap-1', isOwn ? 'justify-end' : 'justify-start')}>
          <span className={cn('text-[10px]', isOwn ? 'text-white/60' : 'text-gray-400')}>
            {formatRelativeTime(message.timestamp)}
          </span>
          {isOwn && (
            message.read
              ? <CheckCheck className="w-3 h-3 text-[#00D4C8]" />
              : <Check className="w-3 h-3 text-white/50" />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-2 mb-3">
      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Main ChatWindow ──────────────────────────────────────────────────────────

export function ChatWindow({ sessionId, currentUserId, otherUser }: ChatWindowProps) {
  const otherUserId = `other-${sessionId}`

  // TODO: Replace static messages with Supabase Realtime subscription:
  // const channel = supabase.channel(`session:${sessionId}`)
  // channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `session_id=eq.${sessionId}` }, handler)
  const [messages, setMessages] = useState<Message[]>(() =>
    getPlaceholderMessages(currentUserId, otherUserId)
  )
  const [inputValue, setInputValue] = useState('')
  const [isTyping] = useState(false) // TODO: Drive from Supabase presence
  const [isOtherOnline] = useState(true) // TODO: Drive from presence channel
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-grow textarea
  const handleTextareaInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const maxHeight = 96 // 4 rows approx
    el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px'
  }

  const handleSend = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'text',
      content: trimmed,
      senderId: currentUserId,
      timestamp: new Date().toISOString(),
      read: false,
    }

    // TODO: Insert into Supabase messages table:
    // await supabase.from('messages').insert({ session_id: sessionId, sender_id: currentUserId, content: trimmed })
    setMessages((prev) => [...prev, newMessage])
    setInputValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // TODO: Upload to Supabase Storage and insert file message
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'file',
      content: 'Sent a file',
      senderId: currentUserId,
      timestamp: new Date().toISOString(),
      read: false,
      fileName: file.name,
      fileUrl: '#',
    }
    setMessages((prev) => [...prev, newMessage])
    e.target.value = ''
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        <Button variant="ghost" size="icon" className="w-8 h-8 lg:hidden" aria-label="Back">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="relative">
          <Avatar className="w-10 h-10">
            {otherUser.avatar_url && (
              <AvatarImage src={otherUser.avatar_url} alt={otherUser.name} />
            )}
            <AvatarFallback
              className="text-white text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, #6C3CE1, #00D4C8)' }}
            >
              {getInitials(otherUser.name)}
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-0.5 -right-0.5">
            <OnlineIndicator isOnline={isOtherOnline} size="sm" />
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{otherUser.name}</p>
          <p className="text-xs text-muted-foreground">
            {otherUser.role === 'doctor' ? 'Doctor' : 'Patient'} ·{' '}
            {isOtherOnline ? (
              <span className="text-green-600">Online</span>
            ) : (
              <span>Offline</span>
            )}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6C3CE1/10, #00D4C8/10)' }}
            >
              <Send className="w-6 h-6 text-[#6C3CE1]/40" />
            </div>
            <div>
              <p className="font-medium text-gray-500">No messages yet.</p>
              <p className="text-sm text-muted-foreground">Say hello!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === currentUserId}
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Bar */}
      <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-end gap-2">
          {/* File attachment */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#6C3CE1] hover:bg-[#6C3CE1]/5 transition-colors flex-shrink-0 mb-0.5"
            aria-label="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileChange}
          />

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onInput={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className={cn(
                'w-full resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm',
                'focus:outline-none focus:ring-2 focus:ring-[#6C3CE1]/30 focus:border-[#6C3CE1]/50',
                'placeholder:text-gray-400 transition-all'
              )}
              style={{ minHeight: '40px', maxHeight: '96px' }}
            />
          </div>

          {/* Send */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0 mb-0.5',
              inputValue.trim()
                ? 'text-white shadow-md hover:shadow-lg hover:scale-105'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            )}
            style={
              inputValue.trim()
                ? { background: 'linear-gradient(135deg, #6C3CE1, #00D4C8)' }
                : {}
            }
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
