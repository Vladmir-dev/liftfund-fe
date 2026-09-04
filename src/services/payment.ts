// Payment gateway helpers (MarzPay is the primary gateway)

export interface FlutterwaveCheckoutOptions {
  public_key?: string
  tx_ref: string
  amount: number
  currency: string
  payment_options?: string
  customer: {
    email: string
    name: string
    phonenumber?: string
  }
  subaccounts?: { id: string }[]
  customizations?: {
    title: string
    description?: string
    logo?: string
  }
  callback: (response: any) => void
  onclose?: () => void
}

export async function openFlutterwavePayment(options: FlutterwaveCheckoutOptions): Promise<void> {
  console.warn('Flutterwave inline checkout is disabled. MarzPay is the active gateway.', options)
  throw new Error('Flutterwave inline checkout is deprecated. Please use MarzPay.')
}

