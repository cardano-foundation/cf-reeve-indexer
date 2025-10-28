import { useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { Coin, Chart } from 'iconsax-react'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { CardPortal } from 'libs/ui-kit/components/CardPortal/CardPortal.component.tsx'
import { PATHS } from 'routes'

export const DataExplorerCardsMenu = () => {
  const { t } = useTranslations()

  const theme = useTheme()

  return (
    <Grid component="section" container spacing={{ xs: 2, sm: 3 }}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CardPortal
          description={t({ id: 'cardFinancialOverviewDescription' })}
          background={theme.palette.success.main}
          icon={Chart}
          title={t({ id: 'cardFinancialOverviewTitle' })}
          to={PATHS.PUBLIC_DATA_EXPLORER_FINANCIAL_OVERVIEW}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CardPortal
          description={t({ id: 'cardAssetOverviewDescription' })}
          background={theme.palette.info.main}
          icon={Coin}
          title={t({ id: 'cardAssetOverviewTitle' })}
          to={PATHS.PUBLIC_DATA_EXPLORER_ASSET_OVERVIEW}
        />
      </Grid>
    </Grid>
  )
}
