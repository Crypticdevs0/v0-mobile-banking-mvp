import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">About Premier America</h1>
        <p className="text-slate-700 mb-6">
          Premier America Credit Union is dedicated to providing fair, modern, and human-centered financial
          products. We focus on transparent pricing, excellent support, and tools that help you reach your financial
          goals.
        </p>
        <Link href="/" className="text-blue-600 hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
