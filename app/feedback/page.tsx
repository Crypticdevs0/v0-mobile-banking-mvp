import Link from "next/link"

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Feedback</h1>
        <p className="text-slate-700 mb-6">We appreciate your feedback. Share suggestions or report issues to help us improve.</p>
        <Link href="/contact" className="text-blue-600 hover:underline">
          Contact Support
        </Link>
      </div>
    </div>
  )
}
