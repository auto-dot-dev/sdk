export type AutoDevErrorCode = 'UNAUTHORIZED' | 'PLAN_REQUIRED' | 'RATE_LIMITED' | 'NOT_FOUND' | 'INVALID_REQUEST' | 'SERVER_ERROR'

export class AutoDevError extends Error {
  readonly status: number
  readonly code: AutoDevErrorCode
  readonly suggestion?: string

  constructor(status: number, code: AutoDevErrorCode, message: string, suggestion?: string) {
    super(message)
    this.name = 'AutoDevError'
    this.status = status
    this.code = code
    this.suggestion = suggestion
  }

  toJSON() {
    return {
      name: this.name,
      status: this.status,
      code: this.code,
      message: this.message,
      suggestion: this.suggestion,
    }
  }
}
