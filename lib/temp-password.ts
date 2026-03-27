import { randomBytes } from "crypto"

export function generateTempPassword(): string {
  // Excludes ambiguous characters: 0, O, 1, I
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const segment = () => Array.from(
    { length: 4 },
    () => chars[randomBytes(1)[0] % chars.length]
  ).join('')
  return `${segment()}-${segment()}-${segment()}`
}
