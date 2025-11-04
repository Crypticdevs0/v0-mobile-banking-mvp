import Link from "next/link"
import SEO from '@/components/seo'
import Breadcrumbs from '@/components/breadcrumbs'

export default function TermsPage() {
  const title = 'Terms of Service - Premier America'
  const description = 'Terms of Service for Premier America Credit Union. Read the rules that govern our services.'
  const url = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000') + '/terms'

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <SEO title={title} description={description} url={url} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Legal', href: '/terms' }, { label: 'Terms of Service' }]} />
        <h1 className="text-3xl font-bold text-slate-900 mb-4">{title}</h1>

        <section className="prose max-w-none text-slate-700">
          <h2>Introduction</h2>
          <p>
            These Terms of Service ("Terms") govern your access to and use of the services, websites, and
            applications (the "Service") provided by Premier America Credit Union. By accessing or using the
            Service, you agree to be bound by these Terms.
          </p>

          <h2>Eligibility</h2>
          <p>You must be at least 18 years old and legally capable of entering into binding contracts to use the
          Service. Accounts for minors must be managed jointly with a legal guardian.</p>

          <h2>Accounts and Verification</h2>
          <p>When you create an account, you agree to provide accurate and complete information. We may require
          identity verification and documentation. Failure to verify your identity may result in account
          restrictions or closure.</p>

          <h2>Fees and Charges</h2>
          <p>Fees, if any, will be disclosed in the relevant account disclosures. We reserve the right to change
          fees with notice as required by law.</p>

          <h2>User Conduct</h2>
          <p>Users must not use the Service for illegal activities, fraud, or any activity that violates applicable
          laws or third-party rights. We may suspend or terminate accounts for violations.</p>

          <h2>Intellectual Property</h2>
          <p>All content, trademarks, and logos are the property of Premier America or its licensors. You may not
          reproduce or use such materials without prior written permission.</p>

          <h2>Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, Premier America is not liable for indirect, incidental, or
          consequential damages arising from your use of the Service.</p>

          <h2>Governing Law</h2>
          <p>These Terms are governed by the laws of the state in which Premier America operates, without regard to
          conflict of law principles.</p>

          <h2>Changes to Terms</h2>
          <p>We may modify these Terms from time to time. We will provide notice of material changes as required by
          law; your continued use constitutes acceptance of the updated Terms.</p>

          <h2>Contact</h2>
          <p>If you have questions about these Terms, contact us at support@premieramerica.example.</p>
        </section>
      </div>
    </div>
  )
}
