import { Box, Typography, Divider } from '@mui/material'
import parse from 'html-react-parser'
import React from 'react'

import { useTranslations } from 'libs/translations/hooks/useTranslations'

import { glossaryData, GlossaryItem } from '../utils/GlossaryData'

const groupByFirstLetter = (data: GlossaryItem[]) => {
  return data.reduce(
    (acc, item) => {
      const letter = item.term[0].toUpperCase()
      if (!acc[letter]) acc[letter] = []
      acc[letter].push(item)
      return acc
    },
    {} as Record<string, GlossaryItem[]>
  )
}

const formatDefinition = (definition: string) => {
  return definition.split('\n').map((line, idx) => {
    const isBullet = line.trim().startsWith('-')
    return (
      <Typography
        key={idx}
        sx={{
          ml: isBullet ? 2 : 0,
          fontWeight: isBullet ? 500 : 400,
          display: 'block'
        }}
      >
        {parse(line)}
      </Typography>
    )
  })
}

const PublicResourcesGlossaryContent: React.FC = () => {
  const groupedData = groupByFirstLetter(glossaryData)
  const sortedKeys = Object.keys(groupedData).sort()
  const { t } = useTranslations()

  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto', p: 4 }}>
      <Typography variant="body1" paragraph>
        {t({ id: 'publicGlossarySummary' })}
      </Typography>

      {sortedKeys.map((letter) => (
        <Box key={letter} sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mt: 4 }}>
            {letter}
          </Typography>
          <Divider sx={{ my: 1 }} />

          {groupedData[letter].map(({ term, category, definition }) => (
            <Box key={term} sx={{ mt: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                {term}{' '}
                {category && (
                  <Typography variant="caption" component="span" sx={{ fontWeight: 400 }}>
                    [{category}]
                  </Typography>
                )}
              </Typography>
              <Box mt={1}>{formatDefinition(definition)}</Box>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  )
}

export default PublicResourcesGlossaryContent
