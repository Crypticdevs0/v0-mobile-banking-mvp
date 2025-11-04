import Link from "next/link"

export default function SavingsProductPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Premier Savings</h1>
        <p className="text-slate-700 mb-6">
          Competitive interest rates and automated tools to help you reach your savings goals faster.
        </p>
        <Link href="/auth/signup" className="text-blue-600 hover:underline">
          Start Saving
        </Link>
      </div>
    </div>
  )
}
