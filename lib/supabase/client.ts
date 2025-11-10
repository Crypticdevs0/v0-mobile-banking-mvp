// Lightweight local stub that replaces Supabase client functionality for the frontend.
// Uses localStorage as a tiny persistent store so the app can run without Supabase.

type Row = Record<string, any>

type QueryResult = { data: any; error: any }

function readTable(name: string): Row[] {
  try {
    const raw = localStorage.getItem(`db_${name}`)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error(`Failed to read table ${name}:`, e)
    return []
  }
}

function writeTable(name: string, rows: Row[]) {
  try {
    localStorage.setItem(`db_${name}`, JSON.stringify(rows))
  } catch (e) {
    console.error(`Failed to write table ${name}:`, e)
  }
}

function match(row: Row, filters: { op: string; field: string; value: any }[]) {
  return filters.every((f) => {
    const actual = row[f.field]
    if (f.op === "eq") return actual === f.value
    if (f.op === "neq") return actual !== f.value
    return false
  })
}

function pickColumns(row: Row, cols?: string) {
  if (!cols || cols === "*") return { ...row }
  const fields = cols.split(",").map((c) => c.trim())
  const out: Row = {}
  fields.forEach((f) => {
    if (f in row) out[f] = row[f]
  })
  return out
}

export function createClient() {
  // Minimal auth implementation: reads current user from localStorage 'user'
  const auth = {
    async getUser() {
      try {
        const raw = localStorage.getItem("user")
        if (!raw) return { data: { user: null } }
        const user = JSON.parse(raw)
        return { data: { user } }
      } catch (e) {
        console.error("auth.getUser error", e)
        return { data: { user: null } }
      }
    },
    async signOut() {
      try {
        localStorage.removeItem("user")
        localStorage.removeItem("authToken")
        return { error: null }
      } catch (e) {
        return { error: e }
      }
    },
  }

  function from(tableName: string) {
    const filters: { op: string; field: string; value: any }[] = []
    let cols: string | undefined = undefined
    let _limit: number | undefined = undefined

    return {
      select(selection = "*") {
        cols = selection
        return this
      },
      eq(field: string, value: any) {
        filters.push({ op: "eq", field, value })
        return this
      },
      neq(field: string, value: any) {
        filters.push({ op: "neq", field, value })
        return this
      },
      limit(n: number) {
        _limit = n
        return this
      },
      async single(): Promise<QueryResult> {
        const rows = readTable(tableName)
        const found = rows.find((r) => match(r, filters)) || null
        return { data: found ? pickColumns(found, cols) : null, error: null }
      },
      async insert(payload: any): Promise<QueryResult> {
        const rows = readTable(tableName)
        const item = Array.isArray(payload) ? payload : [payload]
        const inserted = item.map((it) => {
          const id = it.id ?? `${Date.now()}_${Math.floor(Math.random() * 10000)}`
          return { id, ...it }
        })
        const next = [...rows, ...inserted]
        writeTable(tableName, next)
        return { data: inserted.length === 1 ? inserted[0] : inserted, error: null }
      },
      async update(payload: any): Promise<QueryResult> {
        const rows = readTable(tableName)
        let changed = 0
        const next = rows.map((r) => {
          if (match(r, filters)) {
            changed++
            return { ...r, ...payload }
          }
          return r
        })
        writeTable(tableName, next)
        return { data: null, error: changed === 0 ? { message: 'No rows updated' } : null }
      },
      async order() {
        // noop for stub
        return this
      },
      async range() {
        // noop
        return this
      },
      async then(cb: any) {
        // support promise-like chains
        const rows = readTable(tableName)
        let result = rows.filter((r) => match(r, filters))
        if (_limit !== undefined) result = result.slice(0, _limit)
        result = result.map((r) => pickColumns(r, cols))
        return cb({ data: result, error: null })
      },
    }
  }

  function channel(_name: string) {
    // no-op channel/stub: provide chainable interface
    return {
      on() {
        return this
      },
      subscribe() {
        return this
      },
    }
  }

  function removeChannel(_ch: any) {
    // noop
  }

  return { auth, from, channel, removeChannel }
}
