type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

const levels: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 }

function getLevel(): LogLevel {
  // Prefer public env var on client
  const env = typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_LOG_LEVEL || process.env.LOG_LEVEL)
  if (env && (env in levels)) return env as LogLevel
  return (process.env.NODE_ENV === 'production' ? 'warn' : 'debug')
}

const CURRENT = getLevel()

function format(args: any[]) {
  return args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')
}

export function debug(...args: any[]) {
  if (CURRENT === 'debug') console.debug('[DEBUG]', format(args))
}

export function info(...args: any[]) {
  if (['debug', 'info'].includes(CURRENT)) console.log('[INFO]', format(args))
}

export function warn(...args: any[]) {
  if (['debug', 'info', 'warn'].includes(CURRENT)) console.warn('[WARN]', format(args))
}

export function error(...args: any[]) {
  if (CURRENT !== 'silent') console.error('[ERROR]', format(args))
}

const logger = { debug, info, warn, error }
export default logger
