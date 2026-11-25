import { useMediaQuery, useTheme } from '@mui/material'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ArrowDown2 } from 'iconsax-react'
import { forwardRef } from 'react'

import { useMediaQueries } from 'hooks'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

import { FaqAccordionStyled } from './LandingFaq.styles'

export const LandingFaq = forwardRef<HTMLHeadingElement>((_, ref) => {
  const { t } = useTranslations()
  const theme = useTheme()
  const { isMobile } = useMediaQueries()
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  const questions = [
    { question: t({ id: 'landingFaqWhatQuestion' }), answer: t({ id: 'landingFaqWhatAnswer' }) },
    { question: t({ id: 'landingFaqResponsibleQuestion' }), answer: t({ id: 'landingFaqResponsibleAnswer' }) }
  ]

  return (
    <Box component="section" aria-labelledby="landing-faq-title" display="flex" flexDirection="column" gap={2} mt={{ xs: 4, sm: 2 }}>
      <Typography ref={ref} id="landing-faq-title" component="h2" variant="h2" tabIndex={-1} sx={{ outline: 'none' }}>
        {t({ id: 'landingFaqTitle' })}
      </Typography>
      {isMobile ? (
        <Box display="flex" flexDirection="column" gap={1}>
          {questions.map(({ question, answer }) => (
            <FaqAccordionStyled key={question} disableGutters elevation={0} square slotProps={{ transition: { timeout: prefersReducedMotion ? 0 : undefined } }}>
              <AccordionSummary expandIcon={<ArrowDown2 size={24} color={theme.palette.text.secondary} />}>
                <Typography component="span" variant="subtitle2">
                  {question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary" variant="body2">
                  {answer}
                </Typography>
              </AccordionDetails>
            </FaqAccordionStyled>
          ))}
        </Box>
      ) : (
        <Box display="grid" gridTemplateColumns="repeat(2, minmax(0, 1fr))" gap={5}>
          {questions.map(({ question, answer }) => (
            <Box key={question} display="flex" flexDirection="column" gap={1}>
              <Typography component="h3" variant="h3">
                {question}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {answer}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
})

LandingFaq.displayName = 'LandingFaq'
