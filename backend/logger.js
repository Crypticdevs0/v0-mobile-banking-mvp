const levels = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 }

function getLevel() {
  const env = process.env.LOG_LEVEL || process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
  return levels[env] != null ? env : 'debug'
}

const CURRENT = getLevel()

function should(level) {
  return levels[level] >= levels[CURRENT]
}

function format(args) {
  return args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')
}

export function debug(...args) {
  if (CURRENT === 'debug') console.debug('[DEBUG]', format(args))
}

export function info(...args) {
  if (['debug', 'info'].includes(CURRENT)) console.log('[INFO]', format(args))
}

export function warn(...args) {
  if (['debug', 'info', 'warn'].includes(CURRENT)) console.warn('[WARN]', format(args))
}

export function error(...args) {
  if (CURRENT !== 'silent') console.error('[ERROR]', format(args))
}

export default { debug, info, warn, error }
