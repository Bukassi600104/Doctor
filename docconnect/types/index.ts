export type UserRole = 'patient' | 'doctor' | 'admin'
export type VerificationStatus = 'pending' | 'pending_verification' | 'verified' | 'rejected'
export type SessionStatus = 'pending' | 'active' | 'completed' | 'cancelled'
export type SessionType = 'one_time' | 'subscription'
export type MessageType = 'text' | 'document' | 'image' | 'system'
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  phone: string | null
  avatar_url: string | null
  email: string
  created_at: string
  updated_at: string
}

export interface DoctorProfile {
  id: string
  user_id: string
  specialization_id: string | null
  bio: string | null
  location_state: string | null
  location_city: string | null
  mdcn_number: string | null
  verification_status: VerificationStatus
  one_time_rate: number | null
  subscription_rate: number | null
  is_online: boolean
  last_seen: string | null
  languages: string[]
  years_experience: number | null
  education: string | null
  paystack_subaccount_code: string | null
  slug: string
  rating_avg: number
  rating_count: number
  created_at: string
  updated_at: string
}

export interface Specialization {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  parent_id: string | null
}

export interface Credential {
  id: string
  doctor_id: string
  doc_type: 'mdcn_certificate' | 'medical_degree' | 'residency_certificate' | 'other'
  file_url: string
  file_name: string
  status: 'pending' | 'approved' | 'rejected'
  reviewer_note: string | null
  reviewed_at: string | null
  reviewer_id: string | null
  created_at: string
}

export interface ChatSession {
  id: string
  doctor_id: string
  patient_id: string
  session_type: SessionType
  status: SessionStatus
  payment_status: PaymentStatus
  amount: number
  platform_fee: number
  created_at: string
  updated_at: string
  // joined
  doctor?: DoctorProfile & { profile: Profile }
  patient?: Profile
  messages?: Message[]
  unread_count?: number
}

export interface Message {
  id: string
  session_id: string
  sender_id: string
  content: string
  type: MessageType
  file_url: string | null
  file_name: string | null
  is_read: boolean
  created_at: string
  // joined
  sender?: Profile
}

export interface Document {
  id: string
  uploader_id: string
  session_id: string | null
  file_url: string
  file_name: string
  file_size: number
  mime_type: string
  ocr_text: string | null
  access_level: 'private' | 'session'
  created_at: string
}

export interface Payment {
  id: string
  session_id: string
  paystack_ref: string
  amount: number
  platform_cut: number
  doctor_cut: number
  status: PaymentStatus
  created_at: string
}

export interface Subscription {
  id: string
  patient_id: string
  doctor_id: string
  plan_amount: number
  paystack_plan_code: string | null
  start_date: string
  end_date: string | null
  status: 'active' | 'cancelled' | 'expired'
  created_at: string
}

export interface Review {
  id: string
  doctor_id: string
  patient_id: string
  session_id: string
  rating: number
  comment: string | null
  created_at: string
}

export interface DoctorAvailability {
  id: string
  doctor_id: string
  day_of_week: number  // 0=Sunday, 6=Saturday
  start_time: string   // HH:MM
  end_time: string     // HH:MM
  is_available: boolean
}

// API response types
export interface ApiResponse<T = unknown> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  per_page: number
}

// Paystack types
export interface PaystackTransaction {
  reference: string
  amount: number
  email: string
  metadata?: Record<string, unknown>
}
