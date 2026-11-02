import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { IconsaxIcon, ICONSAX_NAMES } from 'features/iconsax'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'

/** Placeholder for a report attestation slot with no credential yet. */
export const AttestationPendingBadge = () => {
  const theme = useTheme()
  const { t } = useTranslations()

  const tooltipContent = (
    <Box sx={{ p: 1.5, minWidth: 280 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: theme.palette.common.white }}>
        {t({ id: 'attestation' })}
      </Typography>
      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center' }}>
        {t({ id: 'attestationPending' })}
      </Typography>
    </Box>
  )

  return (
    <Tooltip title={tooltipContent} placement="top" arrow>
      <Box aria-label={t({ id: 'attestationPending' })} display="flex" alignItems="center" gap={1} sx={{ cursor: 'pointer' }}>
        <IconsaxIcon name={ICONSAX_NAMES.VERIFY} size={22} variant="Outline" color={theme.palette.grey[400]} />
      </Box>
    </Tooltip>
  )
}
