import { NextResponse, type NextRequest } from "next/server"
import { handleSessionUpdate } from "./lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  try {
    return await handleSessionUpdate(request)
  } catch (err) {
    // If supabase isn't configured in this environment, allow the request to continue
    return NextResponse.next()
  }
}

export const config = {
  // Run middleware for all routes (excluding Next internals)
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
}
