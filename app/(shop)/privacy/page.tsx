import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — R+R",
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <article className="prose prose-invert prose-zinc max-w-none">
        <h1>Privacy Policy</h1>
        <p><strong>Last updated: January 2025</strong></p>

        <h2>Who We Are</h2>
        <p>
          R+R is a sports supplement retailer operating in Ireland.
          Contact: privacy@rnr.ie
        </p>

        <h2>What Data We Collect</h2>
        <ul>
          <li>Account information: name, email address, phone number</li>
          <li>
            Order information: products purchased, delivery address, payment
            details (processed securely by Stripe — we never store card numbers)
          </li>
          <li>Club membership: which club you are associated with</li>
          <li>
            Usage data: we use essential cookies only for authentication and
            cart functionality
          </li>
        </ul>

        <h2>How We Use Your Data</h2>
        <ul>
          <li>To process and fulfil your orders</li>
          <li>To send order confirmation and shipping updates</li>
          <li>To manage your club membership</li>
          <li>To contact you about your account if needed</li>
        </ul>

        <h2>Data Sharing</h2>
        <ul>
          <li>Stripe: payment processing</li>
          <li>Resend: transactional email delivery</li>
          <li>Cloudflare: image hosting and CDN</li>
          <li>Railway: application and database hosting</li>
        </ul>
        <p>We do not sell your data or share it for advertising.</p>

        <h2>Your Rights (GDPR)</h2>
        <p>Under GDPR you have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Export your data in a portable format</li>
          <li>Object to processing</li>
        </ul>
        <p>
          To exercise these rights, use the options in your Account Settings or
          contact us directly.
        </p>

        <h2>Data Retention</h2>
        <p>
          Order records are retained for 7 years for tax compliance. Account
          data is deleted within 30 days of an account deletion request.
        </p>

        <h2>Cookies</h2>
        <p>We use essential cookies only:</p>
        <ul>
          <li>Authentication session cookie</li>
          <li>Shopping cart (localStorage)</li>
        </ul>
        <p>No analytics, advertising or third-party tracking cookies.</p>

        <h2>Contact</h2>
        <p>For privacy enquiries: privacy@rnr.ie</p>
      </article>
    </div>
  )
}
