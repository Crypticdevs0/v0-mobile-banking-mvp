#!/usr/bin/env node

/* Seed Supabase with demo data. Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL in environment. */

const { createClient } = require('@supabase/supabase-js')

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) must be set')
    process.exit(1)
  }

  const supabase = createClient(url, serviceKey)

  try {
    console.log('Listing existing users...')
    const { data: existingUsers } = await supabase.auth.admin.listUsers({ perPage: 100 })
    const existingEmails = new Set((existingUsers || []).map(u => u.email))

    const demoUsers = [
      { email: 'alice@bank.com', password: 'password123', first_name: 'Alice', last_name: 'Anderson' },
      { email: 'bob@bank.com', password: 'password123', first_name: 'Bob', last_name: 'Brown' },
    ]

    const createdUsers = []

    for (const u of demoUsers) {
      if (existingEmails.has(u.email)) {
        console.log(`User ${u.email} exists, fetching user id...`)
        const { data } = await supabase.auth.admin.listUsers({ perPage: 100 })
        const found = (data || []).find(x => x.email === u.email)
        if (found) createdUsers.push(found)
        continue
      }

      console.log(`Creating auth user: ${u.email}`)
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { first_name: u.first_name, last_name: u.last_name },
      })
      if (createError) {
        console.error('Error creating user', u.email, createError.message)
        continue
      }
      createdUsers.push(createData.user)
    }

    // Upsert profiles into users table and create an account for each
    for (const user of createdUsers) {
      const userId = user.id
      const first = user.user_metadata?.first_name || 'Demo'
      const last = user.user_metadata?.last_name || 'User'

      console.log(`Upserting profile for ${user.email}`)
      const { error: upsertErr } = await supabase.from('users').upsert({
        id: userId,
        email: user.email,
        first_name: first,
        last_name: last,
        fineract_client_id: `client_${userId.slice(0,8)}`,
      })
      if (upsertErr) console.error('Profile upsert error:', upsertErr.message)

      // Check if account exists
      const { data: existingAccount } = await supabase.from('accounts').select('*').eq('user_id', userId).limit(1)
      if (existingAccount && existingAccount.length > 0) {
        console.log('Account exists for user, skipping account creation')
        continue
      }

      console.log('Creating account for', user.email)
      const { error: accErr } = await supabase.from('accounts').insert({
        user_id: userId,
        fineract_account_id: `acct_${Math.floor(Math.random()*1000000)}`,
        balance: 1000 + Math.floor(Math.random()*9000),
        account_number: `ACCT${Math.floor(100000 + Math.random()*900000)}`,
      })
      if (accErr) console.error('Account creation error:', accErr.message)
    }

    // Create example transactions between demo users
    if (createdUsers.length >= 2) {
      const a = createdUsers[0].id
      const b = createdUsers[1].id
      console.log('Creating demo transactions')
      const { error: txErr } = await supabase.from('transactions').insert([
        { sender_id: a, receiver_id: b, amount: 25, description: 'Coffee', fineract_transaction_id: 'tx_demo_1', status: 'completed' },
        { sender_id: b, receiver_id: a, amount: 100, description: 'Rent split', fineract_transaction_id: 'tx_demo_2', status: 'completed' },
      ])
      if (txErr) console.error('Transactions insert error:', txErr.message)
    }

    // Create demo notifications
    for (const user of createdUsers) {
      const { error: nErr } = await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Welcome to Premier America',
        message: 'This is a demo notification. Your account was seeded successfully.',
        notification_type: 'info',
      })
      if (nErr) console.error('Notification error:', nErr.message)
    }

    console.log('Seeding complete')
  } catch (err) {
    console.error('Seeding failed', err)
    process.exit(1)
  }
}

main()
