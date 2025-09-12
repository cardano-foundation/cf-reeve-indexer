import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Snackbar } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { Controls } from 'modules/organizationDetails/components/Controls/Controls.component.tsx'
import { OrganizationForm } from 'modules/organizationDetails/components/organization-form/OrganizationForm.component.tsx'
import { useOrganization } from 'modules/organizationDetails/hooks/useOrganization'

export const ViewOrganizationDetails = () => {
  const { t } = useTranslations()

  const { formikRef, isFetching, handleFormSubmit, initialValues, organisation, mode, snackbar, controls } = useOrganization()

  return (
    <>
      <LayoutAuth.Header>
        <LayoutAuth.Header.Details title={t({ id: 'organizationDetails' })} />
        <Controls
          isEditMode={mode.isEditMode}
          isFetching={isFetching}
          onActivateEditMode={controls.handleActivateEditMode}
          onSave={controls.handleSave}
          onCancel={controls.handleCancel}
        />
      </LayoutAuth.Header>
      <LayoutAuth.Main flexDirection="column" gap={6}>
        <OrganizationForm
          isEditMode={mode.isEditMode}
          formikRef={formikRef}
          initialValues={initialValues}
          organisation={organisation}
          onSubmit={handleFormSubmit}
          isFetching={isFetching}
        />
      </LayoutAuth.Main>
      <Snackbar key={snackbar.message} message={snackbar.message} type={snackbar.type} onClose={snackbar.handleClose} open={snackbar.isSnackbarVisible} />
    </>
  )
}
