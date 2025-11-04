import Link from "next/link"

export default function CheckingProductPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Premier Checking</h1>
        <p className="text-slate-700 mb-6">
          Everyday checking built for simplicity — no hidden fees, easy mobile deposits, and instant transfers.
        </p>
        <Link href="/auth/signup" className="text-blue-600 hover:underline">
          Open an Account
        </Link>
      </div>
    </div>
  )
}
