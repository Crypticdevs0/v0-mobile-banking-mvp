import Link from "next/link"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Contact Us</h1>
        <p className="text-slate-700 mb-6">Email: support@premieramerica.example | Phone: (800) 555-0123</p>
        <Link href="/help" className="text-blue-600 hover:underline">
          Visit Help Center
        </Link>
      </div>
    </div>
  )
}
