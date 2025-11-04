import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
        <p className="text-slate-700 mb-6">We respect your privacy and describe how we collect and use personal data here.</p>
        <Link href="/privacy" className="text-blue-600 hover:underline">
          View privacy details
        </Link>
      </div>
    </div>
  )
}
