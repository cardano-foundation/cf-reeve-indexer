import Box from '@mui/material/Box'
import { alpha, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { Clock, CloseCircle, ShieldTick, Warning2 } from 'iconsax-react'
import type { ComponentType } from 'react'

import type { DocumentVerdict } from 'libs/api-connectors/backend-connector-reeve/api/documents/documentsApi.types'
import { VERDICT_SUMMARY, type VerdictSeverity } from 'modules/public-document-detail/constants/detail.consts.ts'

type IconComponent = ComponentType<{ color?: string; size?: number; variant?: 'Bold' | 'Outline' }>

const SEVERITY_ICON: Record<VerdictSeverity, IconComponent> = {
  success: ShieldTick,
  warning: Warning2,
  error: CloseCircle,
  info: Clock
}

/**
 * The at-a-glance verdict banner for one anchor: a coloured callout with an icon, headline, and a
 * one-line plain-language meaning (VERDICT_SUMMARY), shown above the detailed check list so the
 * outcome reads first. Colour and icon derive from the verdict's severity, never hand-picked here.
 */
export const VerdictSummary = ({ verdict }: { verdict: DocumentVerdict }) => {
  const theme = useTheme()
  const { severity, headline, sentence } = VERDICT_SUMMARY[verdict]
  const color = theme.palette[severity].main
  const Icon = SEVERITY_ICON[severity]

  return (
    <Box
      alignItems="flex-start"
      display="flex"
      gap={1.5}
      sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${alpha(color, 0.4)}`, backgroundColor: alpha(color, 0.08) }}>
      <Box sx={{ pt: 0.25, flexShrink: 0 }}>
        <Icon color={color} size={28} variant="Bold" />
      </Box>
      <Box display="flex" flexDirection="column" gap={0.25}>
        <Typography sx={{ color, fontWeight: 600 }} variant="subtitle1">
          {headline}
        </Typography>
        <Typography color={theme.palette.text.secondary} variant="body2">
          {sentence}
        </Typography>
      </Box>
    </Box>
  )
}
