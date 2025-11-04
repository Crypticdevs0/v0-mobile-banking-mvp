import Link from "next/link"

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Blog</h1>
        <p className="text-slate-700 mb-6">Insights, guides, and updates about banking, saving, and investing.</p>
        <Link href="/blog" className="text-blue-600 hover:underline">
          See Articles
        </Link>
      </div>
    </div>
  )
}
