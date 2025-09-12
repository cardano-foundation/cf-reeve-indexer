import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ExtractionForm } from 'modules/extraction/components/ExtractionForm/ExtractionForm.form.tsx'
import { useExtraction } from 'modules/extraction/hooks/useExtraction.ts'

export const ViewExtraction = () => {
  const { t } = useTranslations()

  const theme = useTheme()

  const {
    dateFromMaxDate,
    dateFromMinDate,
    dateToMaxDate,
    dateToMinDate,
    initialValues,
    organisationChartTypes,
    organisationCostCenters,
    organisationProjects,
    organisations,
    validationSchema,
    handleFormReset,
    handleFormSubmit,
    hasInitialValues,
    isFetching
  } = useExtraction()

  return (
    <>
      <LayoutAuth.Header>
        <LayoutAuth.Header.Details description={t({ id: 'extractionViewDescription' })} title={t({ id: 'extractionViewTitle' })} />
      </LayoutAuth.Header>
      <LayoutAuth.Main flexDirection="column" mx="auto" maxWidth="46.25rem" pt={1}>
        <Box mb={3}>
          <Typography variant="body2" color={theme.palette.text.secondary}>
            {t({ id: 'extractionFormDescription' })}
          </Typography>
        </Box>
        <ExtractionForm
          dateFromMaxDate={dateFromMaxDate}
          dateFromMinDate={dateFromMinDate}
          dateToMaxDate={dateToMaxDate}
          dateToMinDate={dateToMinDate}
          initialValues={initialValues}
          organisationChartTypes={organisationChartTypes}
          organisationCostCenters={organisationCostCenters}
          organisationProjects={organisationProjects}
          organisations={organisations}
          validationSchema={validationSchema}
          onReset={handleFormReset}
          onSubmit={handleFormSubmit}
          hasInitialValues={hasInitialValues}
          isFetching={isFetching}
        />
      </LayoutAuth.Main>
    </>
  )
}
