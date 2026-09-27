export type Decision = 'accept' | 'duplicate' | 'reject'

export function shouldAccept(seen: Map<string, string>, key: string): Decision {
  const [eventId] = key.split(':')
  const diffHash = [...seen.keys()].some((k) => k.split(':')[0] === eventId && k !== key)
  if (diffHash) return 'reject'
  if (seen.has(key)) return 'duplicate'
  return 'accept'
}
