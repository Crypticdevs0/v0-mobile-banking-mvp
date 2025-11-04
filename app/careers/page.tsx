import Link from "next/link"

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Careers</h1>
        <p className="text-slate-700 mb-6">
          Join our team. We value inclusion, learning, and building products that help people manage money with
          confidence. Visit our careers portal for current openings and application details.
        </p>
        <Link href="/careers" className="text-blue-600 hover:underline">
          View Open Positions
        </Link>
      </div>
    </div>
  )
}
