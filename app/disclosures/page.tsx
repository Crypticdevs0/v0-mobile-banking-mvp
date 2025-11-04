import Link from "next/link"
import SEO from '@/components/seo'
import Breadcrumbs from '@/components/breadcrumbs'

export default function DisclosuresPage() {
  const title = 'Disclosures - Premier America'
  const description = 'Regulatory disclosures and important information for Premier America account holders.'
  const url = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000') + '/disclosures'

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <SEO title={title} description={description} url={url} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Legal', href: '/terms' }, { label: 'Disclosures' }]} />
        <h1 className="text-3xl font-bold text-slate-900 mb-4">{title}</h1>

        <section className="prose max-w-none text-slate-700">
          <h2>Account Disclosures</h2>
          <p>Rates, fees, and terms for deposit accounts are provided in the account-specific disclosures. These
          disclosures supplement the Terms of Service.</p>

          <h2>Regulatory Notices</h2>
          <p>Regulatory notices and consumer protection information are available to customers upon request and in
          account documentation.</p>

          <h2>FDIC/NCUA Insurance</h2>
          <p>Information about deposit insurance coverage and limits is provided for eligible accounts.</p>

          <h2>Contact</h2>
          <p>For questions about disclosures, contact support@premieramerica.example.</p>
        </section>
      </div>
    </div>
  )
}
