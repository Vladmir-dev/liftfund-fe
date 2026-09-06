// Full-screen interstitial shown only briefly before the user is handed off to
// the external card payment gateway. It sets clear expectations so the payer
// completes the checkout while their gateway session is still valid, which
// prevents the "Failed: NOT FOUND" abandoned-session failures.

let overlayEl: HTMLElement | null = null

export function redirectToGateway(paymentLink: string, delayMs = 1400) {
  if (!paymentLink) return

  if (!overlayEl) {
    overlayEl = document.createElement('div')
    overlayEl.id = 'gateway-redirect-overlay'
    overlayEl.style.cssText =
      'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:1.5rem;background:rgba(2,32,22,0.7);backdrop-filter:blur(6px);'
    overlayEl.innerHTML = `
      <div style="width:100%;max-width:26rem;background:#ffffff;border-radius:1.5rem;padding:2rem;text-align:center;box-shadow:0 25px 50px -12px rgba(0,0,0,0.4);font-family:inherit;">
        <div style="margin:0 auto 1.25rem;width:3.5rem;height:3.5rem;border-radius:9999px;border:3px solid #024731;border-top-color:transparent;animation:gatewaySpin 0.8s linear infinite;"></div>
        <h2 style="margin:0 0 0.5rem;font-size:1.25rem;font-weight:800;color:#024731;">Preparing Secure Checkout</h2>
        <p style="margin:0 0 1rem;font-size:0.85rem;color:#475569;line-height:1.55;">
          You are being redirected to the secure card payment gateway.<br/>
          Please complete your payment within <strong>5 minutes</strong>.
        </p>
        <ul style="margin:0 0 0.75rem;padding:0;list-style:none;text-align:left;font-size:0.78rem;color:#64748b;line-height:1.8;">
          <li>&#9989; Keep this tab open</li>
          <li>&#10060; Don't refresh the page or press Back</li>
          <li>&#128260; You'll return here automatically after payment</li>
        </ul>
        <p style="margin:0;font-size:0.72rem;color:#94a3b8;">Redirecting&hellip;</p>
      </div>
      <style>@keyframes gatewaySpin{to{transform:rotate(360deg)}}</style>
    `
    document.body.appendChild(overlayEl)
  }

  window.setTimeout(() => {
    window.location.href = paymentLink
  }, delayMs)
}