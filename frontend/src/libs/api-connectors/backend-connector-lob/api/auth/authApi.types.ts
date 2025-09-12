export interface TriggerPasswordResetApiRequest {
  organisationId: string
  email: string
}

export interface TriggerPasswordResetApiResponse {
  success: boolean
  error?: {
    title: string
    status: {
      reasonPhrase: string
      statusCode: number
    }
    detail: string
    instance: string
    type: string
    parameters: never
  }
}
