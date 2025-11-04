import logger from '@/lib/logger'

const metrics = {
  me401: 0,
  tokenFailures: 0,
}

export function incrementMe401() {
  metrics.me401 += 1
  logger.warn(`Auth me 401 count=${metrics.me401}`)
}

export function incrementTokenFailure(reason?: string) {
  metrics.tokenFailures += 1
  logger.warn(`Token exchange failure count=${metrics.tokenFailures} reason=${reason ?? 'unknown'}`)
}

export function getMetrics() {
  return { ...metrics }
}
