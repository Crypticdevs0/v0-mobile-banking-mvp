import Link from "next/link"

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Security</h1>
        <p className="text-slate-700 mb-6">
          We use bank-level encryption and continuous monitoring to keep your accounts safe. Learn about our security
          practices and tips to protect your information.
        </p>
        <Link href="/security" className="text-blue-600 hover:underline">
          Learn about account protection
        </Link>
      </div>
    </div>
  )
}
