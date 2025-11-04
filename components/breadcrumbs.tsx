import Link from 'next/link'

export default function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="text-sm mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-slate-500">
        {items.map((it, idx) => (
          <li key={idx} className="flex items-center">
            {it.href ? (
              <Link href={it.href} className="hover:underline text-slate-600">
                {it.label}
              </Link>
            ) : (
              <span className="text-slate-700">{it.label}</span>
            )}
            {idx < items.length - 1 && <span className="mx-2">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
