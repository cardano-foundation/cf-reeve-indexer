import Typography from '@mui/material/Typography'

import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { DialogErrorsSummary } from 'libs/ui-kit/components/DialogErrorsSummary/DialogErrorsSummary.component.tsx'
import { Snackbar } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { DialogOrganizationSetupConfirmation } from 'modules/organization-setup/components/DialogOrganizationSetupConfirmation/DialogOrganizationSetupConfirmation.component.tsx'
import { OrganizationSetupForm } from 'modules/organization-setup/components/OrganizationSetupForm/OrganizationSetupForm.component.tsx'
import { useOrganizationSetup } from 'modules/organization-setup/hooks/useOrganizationSetup.ts'

export const ViewOrganizationSetup = () => {
  const { t } = useTranslations()

  const {
    apiErrors,
    apiWarnings,
    initialValues,
    snackbar,
    validationSchema,
    handleDialogErrorsSummaryCancel,
    handleDialogErrorsSummaryOpen,
    handleDialogOrganizationSetupCancel,
    handleDialogOrganizationSetupOpen,
    handleFormSubmit,
    handleSnackbarClose,
    isDialogErrorsSummaryOpen,
    isDialogOrganizationSetupOpen,
    isSnackbarVisible
  } = useOrganizationSetup()

  return (
    <>
      <LayoutAuth.Header alignItems="center" justifyContent="space-between">
        <LayoutAuth.Header.Details description={t({ id: 'organizationSetupViewDescription' })} title={t({ id: 'organizationSetupViewTitle' })} />
      </LayoutAuth.Header>
      <LayoutAuth.Main flexDirection="column" mx="auto" maxWidth="30.375rem" py={6}>
        <Typography mb={2} variant="body2">
          {t({ id: 'organizationSetupSubtitle' })}
        </Typography>
        <OrganizationSetupForm
          apiErrors={apiErrors}
          apiWarnings={apiWarnings}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
          onDialogErrorsSummaryOpen={handleDialogErrorsSummaryOpen}
          onDialogOrganizationSetupOpen={handleDialogOrganizationSetupOpen}
        />
      </LayoutAuth.Main>
      <DialogOrganizationSetupConfirmation onCancel={handleDialogOrganizationSetupCancel} isOpen={isDialogOrganizationSetupOpen} />
      <DialogErrorsSummary errors={apiErrors || apiWarnings} onCancel={handleDialogErrorsSummaryCancel} isOpen={isDialogErrorsSummaryOpen} />
      {/* TODO: Snackbar should be a part of root layout and modified with context methods */}
      <Snackbar hint={snackbar.hint} message={snackbar.message} type={snackbar.type} onClose={handleSnackbarClose} open={isSnackbarVisible} />
    </>
  )
}
