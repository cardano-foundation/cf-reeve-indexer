import Grid from '@mui/material/Grid'

import { hasPermission } from 'libs/permissions/has-permission.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { ButtonSecondary } from 'libs/ui-kit/components/ButtonSecondary/ButtonSecondary.component.tsx'

type ControlsProps = {
  isEditMode: boolean
  isFetching: boolean
  onActivateEditMode: () => void
  onSave: () => void
  onCancel: () => void
}

export const Controls = ({ isEditMode, isFetching, onActivateEditMode, onSave, onCancel }: ControlsProps) => {
  const { t } = useTranslations()

  return (
    <Grid container size="auto">
      {isEditMode ? (
        <Grid container spacing={2}>
          <ButtonSecondary type="button" disabled={isFetching} onClick={onCancel}>
            {t({ id: 'cancel' })}
          </ButtonSecondary>
          <ButtonPrimary type="button" disabled={isFetching} onClick={onSave}>
            {t({ id: 'saveChanges' })}
          </ButtonPrimary>
        </Grid>
      ) : (
        <ButtonPrimary type="button" disabled={isFetching || !hasPermission('organization_details', 'edit')} onClick={onActivateEditMode}>
          {t({ id: 'edit' })}
        </ButtonPrimary>
      )}
    </Grid>
  )
}
