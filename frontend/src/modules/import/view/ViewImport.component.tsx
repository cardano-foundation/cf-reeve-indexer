import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { DialogErrorsSummary } from 'libs/ui-kit/components/DialogErrorsSummary/DialogErrorsSummary.component.tsx'
import { Snackbar } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { ImportForm } from 'modules/import/components/ImportForm/ImportForm.form.tsx'
import { useImport } from 'modules/import/hooks/useImport.ts'

export const ViewImport = () => {
  const { t } = useTranslations()

  const {
    apiErrors,
    dateFromMaxDate,
    dateFromMinDate,
    dateToMaxDate,
    dateToMinDate,
    initialValues,
    organisations,
    snackbar,
    transactionTypes,
    validationSchema,
    handleDialogErrorsSummaryCancel,
    handleDialogErrorsSummaryOpen,
    handleFormSubmit,
    handleSnackbarClose,
    isDialogErrorsSummaryOpen,
    isFetching,
    isSnackbarVisible
  } = useImport()

  return (
    <>
      <LayoutAuth.Header>
        <LayoutAuth.Header.Details description={t({ id: 'importDescription' })} title={t({ id: 'importViewTitle' })} />
      </LayoutAuth.Header>
      <LayoutAuth.Main flexDirection="column" mx="auto" maxWidth="46.25rem" pt={1}>
        <Box mb={6}>
          <Typography variant="body2">{t({ id: 'importFormSubTitle' })}</Typography>
        </Box>
        <ImportForm
          apiErrors={apiErrors}
          dateFromMaxDate={dateFromMaxDate}
          dateFromMinDate={dateFromMinDate}
          dateToMaxDate={dateToMaxDate}
          dateToMinDate={dateToMinDate}
          initialValues={initialValues}
          organisations={organisations}
          transactionTypes={transactionTypes}
          validationSchema={validationSchema}
          onDialogErrorsSummaryOpen={handleDialogErrorsSummaryOpen}
          onSubmit={handleFormSubmit}
          isFetching={isFetching}
        />
      </LayoutAuth.Main>
      <DialogErrorsSummary errors={apiErrors} onCancel={handleDialogErrorsSummaryCancel} isOpen={isDialogErrorsSummaryOpen} />
      {/* TODO: Snackbar should be a part of root layout and modified with context methods */}
      <Snackbar hint={snackbar.hint} message={snackbar.message} type={snackbar.type} onClose={handleSnackbarClose} open={isSnackbarVisible} />
    </>
  )
}
