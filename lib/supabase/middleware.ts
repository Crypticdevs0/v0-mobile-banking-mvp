import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/supabase-js" // Declare the createServerClient variable

export async function handleSessionUpdate(request: NextRequest) {
  const res = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  await supabase.auth.getUser()

  return res
}
