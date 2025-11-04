import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { randomUUID } from "crypto"

export async function GET() {
  try {
    const token = randomUUID()

    // Set a secure, httpOnly CSRF cookie valid for 1 hour
    cookies().set({
      name: "csrf-token",
      value: token,
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60,
    })

    return NextResponse.json({ csrfToken: token })
  } catch (err) {
    return NextResponse.json({ error: "Failed to generate CSRF token" }, { status: 500 })
  }
}
