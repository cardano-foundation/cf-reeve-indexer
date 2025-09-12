import { setupServer } from 'msw/node'

import { handlers } from 'libs/mock-service-worker/handlers.ts'

export const server = setupServer(...handlers)
