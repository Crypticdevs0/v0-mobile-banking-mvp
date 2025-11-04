import Link from "next/link"

export default function FdicPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">FDIC Insurance</h1>
        <p className="text-slate-700 mb-6">Accounts are FDIC insured up to applicable limits. Learn how your deposits are protected.</p>
        <Link href="/disclosures" className="text-blue-600 hover:underline">
          View Disclosures
        </Link>
      </div>
    </div>
  )
}
