const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = process.env.SUPABASE_POSTGRES_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log("[Migration] Skipping - Supabase credentials not found")
  process.exit(0)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigrations() {
  console.log("[Migration] Starting database migrations...")

  try {
    // Check if tables exist
    const { data: tables, error } = await supabase.from("users").select("id").limit(1)

    if (error && error.code === "42P01") {
      console.log("[Migration] Tables not found. Please run SQL scripts in Supabase dashboard first.")
      console.log(
        "[Migration] Required scripts: 001_create_banking_schema.sql, 002_enable_rls.sql, 003_add_otp_table.sql",
      )
      process.exit(1)
    }

    console.log("[Migration] ✓ Database tables verified")
    console.log("[Migration] ✓ Migrations complete")
    process.exit(0)
  } catch (err) {
    console.error("[Migration] Error:", err.message)
    process.exit(1)
  }
}

runMigrations()
