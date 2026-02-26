// Server-side only — use in Server Actions or API routes only.
// Never import this module in client components.

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!

// ─── Initialize Transaction ───────────────────────────────────────────────────

export async function initializeTransaction(params: {
  email: string
  amount: number // in kobo (NGN * 100)
  reference: string
  metadata?: Record<string, unknown>
  subaccount?: string
  transaction_charge?: number // platform fee in kobo
}) {
  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...params,
      bearer: params.subaccount ? 'subaccount' : undefined,
    }),
  })
  return res.json()
}

// ─── Verify Transaction ───────────────────────────────────────────────────────

export async function verifyTransaction(reference: string) {
  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  })
  return res.json()
}

// ─── Create Subaccount ────────────────────────────────────────────────────────

export async function createSubaccount(params: {
  business_name: string
  settlement_bank: string // Nigerian bank code (e.g. "044" for Access Bank)
  account_number: string
  percentage_charge: number // 30 for 30% platform commission
}) {
  const res = await fetch('https://api.paystack.co/subaccount', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })
  return res.json()
}

// ─── List Banks ───────────────────────────────────────────────────────────────
// Utility to fetch supported Nigerian banks for subaccount creation UI

export async function listBanks(country: string = 'nigeria') {
  const res = await fetch(
    `https://api.paystack.co/bank?country=${country}&perPage=100`,
    {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    }
  )
  return res.json()
}

// ─── Resolve Account Number ───────────────────────────────────────────────────
// Verify a doctor's bank account number before creating a subaccount

export async function resolveAccountNumber(params: {
  account_number: string
  bank_code: string
}) {
  const url = new URL('https://api.paystack.co/bank/resolve')
  url.searchParams.set('account_number', params.account_number)
  url.searchParams.set('bank_code', params.bank_code)
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  })
  return res.json()
}

// ─── Generate Payment Reference ───────────────────────────────────────────────
// Produce a unique, traceable reference for each transaction

export function generateReference(prefix: string = 'DC'): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}
