const SECRET_KEY_PATTERNS = [
  /api[_-]?key/i,
  /^auth[_-]?(key|token|header|secret)$/i,
  /authorization/i,
  /bearer/i,
  /password/i,
  /refresh[_-]?token/i,
  /secret/i,
  /token/i,
  /^x-api-key$/i,
]

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function shouldRedactKey(key: string): boolean {
  return SECRET_KEY_PATTERNS.some((pattern) => pattern.test(key))
}

function redactValue(value: unknown, key = ''): unknown {
  if (shouldRedactKey(key)) {
    return typeof value === 'string' && value ? '***' : value
  }

  if (Array.isArray(value)) {
    return value.map((entry) => redactValue(entry))
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        redactValue(entryValue, entryKey),
      ]),
    )
  }

  return value
}

export function redactHermesConfigForClient(
  config: Record<string, unknown>,
): Record<string, unknown> {
  return redactValue(config) as Record<string, unknown>
}
