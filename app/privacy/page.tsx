import Link from "next/link"
import SEO from '@/components/seo'
import Breadcrumbs from '@/components/breadcrumbs'

export default function PrivacyPage() {
  const title = 'Privacy Policy - Premier America'
  const description = 'How Premier America collects, uses, and protects your personal information.'
  const url = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000') + '/privacy'

  return (
    <div className="min-h-screen bg-white py-16">
      <SEO title={title} description={description} url={url} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Legal', href: '/terms' }, { label: 'Privacy Policy' }]} />
        <h1 className="text-3xl font-bold text-slate-900 mb-4">{title}</h1>

        <section className="prose max-w-none text-slate-700">
          <h2>Information We Collect</h2>
          <p>We collect information you provide when creating an account, such as name, email, phone number,
          and identity documents, as well as transactional data and device information.</p>

          <h2>How We Use Information</h2>
          <p>Your data is used to provide and improve services, process transactions, verify identity, send
          notifications, and comply with legal obligations.</p>

          <h2>Sharing and Disclosure</h2>
          <p>We may share information with service providers, legal authorities when required, and other entities
          as described in account disclosures. We do not sell personal data.</p>

          <h2>Data Security</h2>
          <p>We employ technical and administrative safeguards to protect your data, including encryption and
          access controls. However, no system is 100% secure.</p>

          <h2>Your Rights</h2>
          <p>You may access, correct, or request deletion of your personal data in accordance with applicable law.
          Contact support to exercise these rights.</p>

          <h2>Contact</h2>
          <p>Questions about privacy can be sent to support@premieramerica.example.</p>
        </section>
      </div>
    </div>
  )
}
