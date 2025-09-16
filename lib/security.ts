export class SecurityManager {
  // Input sanitization
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== "string") return ""

    // Remove potentially dangerous characters and limit length
    return input
      .replace(/[<>"'&]/g, "") // Remove HTML/script injection chars
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .replace(/on\w+=/gi, "") // Remove event handlers
      .trim()
      .slice(0, 100) // Limit to 100 characters
  }

  // Rate limiting for user interactions
  private static interactionCounts = new Map<string, { count: number; lastReset: number }>()

  static checkRateLimit(action: string, maxAttempts = 10, windowMs = 60000): boolean {
    const now = Date.now()
    const key = `${action}_${this.getClientId()}`
    const record = this.interactionCounts.get(key)

    if (!record || now - record.lastReset > windowMs) {
      this.interactionCounts.set(key, { count: 1, lastReset: now })
      return true
    }

    if (record.count >= maxAttempts) {
      return false
    }

    record.count++
    return true
  }

  // Generate client ID for rate limiting
  private static getClientId(): string {
    if (typeof window === "undefined") return "server"

    let clientId = sessionStorage.getItem("client_id")
    if (!clientId) {
      clientId = Math.random().toString(36).substring(2, 15)
      sessionStorage.setItem("client_id", clientId)
    }
    return clientId
  }

  // Validate audio sources
  static validateAudioSource(src: string): boolean {
    if (!src || typeof src !== "string") return false

    // Only allow specific audio formats and trusted domains
    const allowedExtensions = [".mp3", ".wav", ".ogg"]
    const allowedDomains = ["blob.v0.dev", "localhost", window.location.hostname]

    try {
      const url = new URL(src, window.location.origin)
      const domain = url.hostname
      const hasValidExtension = allowedExtensions.some((ext) => src.toLowerCase().includes(ext))
      const hasValidDomain = allowedDomains.includes(domain)

      return hasValidExtension && hasValidDomain
    } catch {
      return false
    }
  }

  // Content Security Policy headers (for server-side implementation)
  static getCSPHeaders(): Record<string, string> {
    return {
      "Content-Security-Policy": [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "media-src 'self' blob: https://blob.v0.dev",
        "connect-src 'self' blob:",
        "font-src 'self' data:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; "),
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    }
  }

  // Validate user session
  static validateSession(): boolean {
    if (typeof window === "undefined") return true

    const sessionStart = sessionStorage.getItem("session_start")
    if (!sessionStart) {
      sessionStorage.setItem("session_start", Date.now().toString())
      return true
    }

    // Session expires after 24 hours
    const sessionAge = Date.now() - Number.parseInt(sessionStart)
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    if (sessionAge > maxAge) {
      sessionStorage.clear()
      return false
    }

    return true
  }
}
