import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Snackbar } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { useSnackbar } from 'libs/ui-kit/components/Snackbar/useSnackbar.tsx'
import { ReportingCardsMenu } from 'modules/reporting/sections/ReportingCardsMenu/ReportingCardsMenu.component.tsx'

export const ViewReporting = () => {
  const { state } = useLocation()

  const { t } = useTranslations()

  const { isSnackbarVisible, showSnackbar, handleClose } = useSnackbar()

  const { hasReportCreated } = state ?? {}

  useEffect(() => {
    if (hasReportCreated) {
      showSnackbar()
    }
  }, [hasReportCreated])

  return (
    <>
      <LayoutAuth.Header>
        <LayoutAuth.Header.Details description={t({ id: 'reportingViewDescription' })} title={t({ id: 'reportingViewTitle' })} />
      </LayoutAuth.Header>
      <LayoutAuth.Main flexDirection="column" gap={6}>
        <ReportingCardsMenu />
      </LayoutAuth.Main>
      <Snackbar open={isSnackbarVisible} onClose={handleClose} message={t({ id: 'reportCreated' })} />
    </>
  )
}
