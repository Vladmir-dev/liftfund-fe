// In-memory + localStorage record of the most recently initiated donation so
// the success page can verify the right transaction even when the payment
// gateway's return URL carries no usable parameters.
const KEY = 'helpfund_last_donation'

export interface LastDonation {
  txRef?: string
  at: number
}

export function rememberDonation(txRef?: string) {
  if (!txRef) return
  try {
    localStorage.setItem(KEY, JSON.stringify({ txRef, at: Date.now() }))
  } catch {
    /* ignore quota/private-mode errors */
  }
}

export function lastDonation(): LastDonation | undefined {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as LastDonation) : undefined
  } catch {
    return undefined
  }
}

export function clearLastDonation() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}