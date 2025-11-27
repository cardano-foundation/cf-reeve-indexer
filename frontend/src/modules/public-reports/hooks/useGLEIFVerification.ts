import { useQuery } from '@tanstack/react-query'

interface GLEIFLegalEntity {
  legalName: string | { name?: string; language?: string }
  legalAddress?: {
    addressLines?: string[]
    city?: string
    country?: string
  }
  registrationAuthority?: {
    registrationAuthorityEntityID?: string
  }
  entityStatus?: string
}

interface GLEIFResponse {
  data?: {
    attributes?: {
      entity?: {
        legalName?: string | { name?: string; language?: string }
        legalAddress?: {
          addressLines?: string[]
          city?: string
          country?: string
        }
        entityStatus?: string
      }
    }
  }
}

export const useGLEIFVerification = (lei?: string) => {
  return useQuery({
    queryKey: ['gleif-verification', lei],
    queryFn: async (): Promise<GLEIFLegalEntity | null> => {
      if (!lei) return null

      try {
        const response = await fetch(`https://api.gleif.org/api/v1/lei-records/${lei}`)

        if (!response.ok) {
          return null
        }

        const data: GLEIFResponse = await response.json()

        if (data.data?.attributes?.entity) {
          const entity = data.data.attributes.entity
          return {
            legalName: entity.legalName || '',
            legalAddress: entity.legalAddress,
            entityStatus: entity.entityStatus
          }
        }

        return null
      } catch (error) {
        console.error('GLEIF API error:', error)
        return null
      }
    },
    enabled: !!lei,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 1
  })
}
