export interface ApiError {
  detail: string
  instance?: string
  parameters?: Record<string, Record<string, string | number | boolean>>
  status?: number
  title: string
  type?: string
}
