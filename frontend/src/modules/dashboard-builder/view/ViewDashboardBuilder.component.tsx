import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { FormikProvider } from 'formik'
import { Link as RouterLink } from 'react-router-dom'

import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { intl } from 'libs/translations/utils/intl.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { ButtonText } from 'libs/ui-kit/components/ButtonText/ButtonText.component.tsx'
import { DialogAlertNavigationBlocker } from 'libs/ui-kit/components/DialogAlertNavigationBlocker/DialogAlertNavigationBlocker.component.tsx'
import { InputSelect } from 'libs/ui-kit/components/InputSelect/InputSelect.component.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { DialogAlertTemplateChange } from 'modules/dashboard-builder/components/DialogAlertTemplateChange/DialogAlertTemplateChange.component.tsx'
import { DialogAlertTemplateSave } from 'modules/dashboard-builder/components/DialogAlertTemplateSave/DialogAlertTemplateSave.component.tsx'
import { TemplateSelection } from 'modules/dashboard-builder/components/TemplateSelection/TemplateSelection.component.tsx'
import { useDashboardBuilder } from 'modules/dashboard-builder/hooks/useDashboardBuilder.ts'
import { Template } from 'modules/dashboard-builder/types'
import { PATHS } from 'routes'

const DASHBOARD_BUILDER_TEMPLATES = [
  { name: intl.formatMessage({ id: 'templateCounter' }, { counter: 1 }), value: Template.ONE },
  { name: intl.formatMessage({ id: 'templateCounter' }, { counter: 2 }), value: Template.TWO },
  { name: intl.formatMessage({ id: 'templateCounter' }, { counter: 3 }), value: Template.THREE }
]

export const ViewDashboardBuilder = () => {
  const { t } = useTranslations()

  const {
    data,
    formik,
    options,
    selection,
    template,
    isFetching,
    isNavigationBlocked,
    isSaveDisabled,
    isDialogTemplateChangeOpen,
    isDialogTemplateSaveOpen,
    handleDialogTemplateChangeCancel,
    handleDialogTemplateChangeConfirm,
    handleDialogTemplateSaveCancel,
    handleDialogTemplateSaveConfirm,
    handleDialogTemplateSaveOpen,
    handleClear,
    handleSelect,
    handleTemplateChange
  } = useDashboardBuilder()

  return (
    <>
      <LayoutAuth.Header>
        <LayoutAuth.Header.Details description={t({ id: 'dashboardBuilderDescription' })} title={t({ id: 'dashboardBuilderViewTitle' })} />
        <Box alignItems="center" display="flex" gap={3}>
          <Box width="13.75rem">
            <InputSelect
              id="template"
              name="template"
              items={DASHBOARD_BUILDER_TEMPLATES}
              label={t({ id: 'template' })}
              value={template}
              onChange={handleTemplateChange}
              disabled={isFetching}
            />
          </Box>
          <Divider flexItem orientation="vertical" />
          <Box display="flex" gap={1}>
            <ButtonText component={RouterLink} to={`${PATHS.DATA_EXPLORER_DASHBOARD}`}>
              {t({ id: 'cancel' })}
            </ButtonText>
            <Tooltip title={isSaveDisabled ? t({ id: 'saveDashboardDisabledHint' }) : null} arrow={false}>
              <Box>
                <ButtonPrimary onClick={handleDialogTemplateSaveOpen} disabled={isSaveDisabled}>
                  {t({ id: 'save' })}
                </ButtonPrimary>
              </Box>
            </Tooltip>
          </Box>
        </Box>
      </LayoutAuth.Header>
      <LayoutAuth.Main flexDirection="column" gap={6}>
        <FormikProvider value={formik}>
          <TemplateSelection data={data} options={options} selection={selection} template={template} isFetching={isFetching} onClear={handleClear} onSelect={handleSelect} />
        </FormikProvider>
      </LayoutAuth.Main>
      <DialogAlertTemplateChange isOpen={isDialogTemplateChangeOpen} onCancel={handleDialogTemplateChangeCancel} onConfirm={handleDialogTemplateChangeConfirm} />
      <DialogAlertTemplateSave isOpen={isDialogTemplateSaveOpen} onCancel={handleDialogTemplateSaveCancel} onConfirm={handleDialogTemplateSaveConfirm} />
      <DialogAlertNavigationBlocker message={t({ id: 'dialogAlertDashoardBuilderNavigationBlockerMessage' })} isBlocked={isNavigationBlocked} />
    </>
  )
}
