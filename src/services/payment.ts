// Flutterwave inline payment integration

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

let scriptLoadingPromise: Promise<void> | null = null

export function loadFlutterwaveScript(): Promise<void> {
  if (typeof (window as any).FlutterwaveCheckout === 'function') {
    return Promise.resolve()
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise
  }

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('flutterwave-inline-v3')
    if (existing) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.id = 'flutterwave-inline-v3'
    script.src = 'https://checkout.flutterwave.com/v3.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = (err) => {
      scriptLoadingPromise = null
      reject(new Error('Failed to load Flutterwave checkout script: ' + err))
    }
    document.head.appendChild(script)
  })

  return scriptLoadingPromise
}

export const FLUTTERWAVE_PUBLIC_KEY =
  import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-DEMO-KEY'

export async function openFlutterwavePayment(options: FlutterwaveCheckoutOptions): Promise<void> {
  await loadFlutterwaveScript()

  if (typeof (window as any).FlutterwaveCheckout !== 'function') {
    throw new Error('Flutterwave payment system is currently unavailable.')
  }

  const checkoutConfig: any = {
    public_key: options.public_key || FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: options.tx_ref,
    amount: options.amount,
    currency: options.currency || 'UGX',
    payment_options: options.payment_options || 'card, mobilemoney',
    customer: options.customer,
    customizations: options.customizations || {
      title: 'HelpFund Donation',
      description: 'Support this verified fundraiser',
      logo: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80&w=150',
    },
    callback: options.callback,
    onclose: options.onclose || (() => {}),
  }

  const firstSub = options.subaccounts?.[0]
  if (firstSub && firstSub.id) {
    checkoutConfig.subaccounts = options.subaccounts
  }

  ;(window as any).FlutterwaveCheckout(checkoutConfig)
}
