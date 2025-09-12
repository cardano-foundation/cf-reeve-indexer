import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { PublicTransactionsForm } from 'modules/public-transactions/components/PublicTransactionsForm/PublicTransactionsForm.form.tsx'
import { usePublicTransactions } from 'modules/public-transactions/hooks/usePublicTransactions.ts'

export const ViewPublicTransactions = () => {
  const { t } = useTranslations()

  const theme = useTheme()

  const {
    currencies,
    dateFromMaxDate,
    dateFromMinDate,
    dateToMaxDate,
    dateToMinDate,
    initialValues,
    organisations,
    validationSchema,
    handleFormReset,
    handleFormSubmit,
    hasInitialValues,
    isFetching
  } = usePublicTransactions()

  return (
    <>
      <LayoutPublic.Header isPublic>
        <LayoutPublic.Header.Details description={t({ id: 'publicTransactionsViewDescription' })} title={t({ id: 'publicTransactionsViewTitle' })} />
      </LayoutPublic.Header>
      <LayoutPublic.Main flexDirection="column" mx="auto" maxWidth="46.5rem" pt={2}>
        <Box mb={{ xs: 4, sm: 8 }}>
          <Typography variant="body2" color={theme.palette.text.secondary}>
            {t({ id: 'extractionFormDescription' })}
          </Typography>
        </Box>
        <PublicTransactionsForm
          currencies={currencies}
          dateFromMaxDate={dateFromMaxDate}
          dateFromMinDate={dateFromMinDate}
          dateToMaxDate={dateToMaxDate}
          dateToMinDate={dateToMinDate}
          initialValues={initialValues}
          organisations={organisations}
          validationSchema={validationSchema}
          onReset={handleFormReset}
          onSubmit={handleFormSubmit}
          hasInitialValues={hasInitialValues}
          isFetching={isFetching}
        />
      </LayoutPublic.Main>
    </>
  )
}
