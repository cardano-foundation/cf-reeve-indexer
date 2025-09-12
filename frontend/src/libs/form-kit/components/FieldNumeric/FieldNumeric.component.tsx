import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import { useField } from 'formik'
import { Danger, TickCircle } from 'iconsax-react'
import { FocusEvent } from 'react'

import { InputNumeric } from 'libs/form-kit/components/InputNumeric/InputNumeric.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { formatNumber } from 'libs/utils/format.ts'
import { ReportBalanceSheetFormValues, ReportIncomeStatementFormValues } from 'modules/report-type/components/ReportTypeForm/ReportTypeForm.types.ts'
import { formatToFloatReadyFormat } from 'modules/report-type/utils/format.ts'

type FieldName = keyof ReportBalanceSheetFormValues | keyof ReportIncomeStatementFormValues

interface FieldNumericProps {
  label: string
  name: FieldName
  isReadOnly?: boolean
  isValid?: boolean
}

export const FieldNumeric = ({ label, name, isReadOnly, isValid }: FieldNumericProps) => {
  const [field, meta, helpers] = useField<string>(name)

  const { t } = useTranslations()

  const theme = useTheme()

  const hasAdornment = !isReadOnly && isValid !== undefined

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const value = formatToFloatReadyFormat(event.target.value)

    field.onBlur(name)
    helpers.setValue(formatNumber(parseFloat(value)))
  }

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    const value = formatToFloatReadyFormat(event.target.value)

    helpers.setValue(parseFloat(value).toFixed(2).toString())
  }

  return (
    <InputNumeric
      {...field}
      error={Boolean(meta.error)}
      label={label}
      onBlur={!isReadOnly ? handleBlur : undefined}
      onFocus={!isReadOnly ? handleFocus : undefined}
      InputProps={{
        startAdornment: hasAdornment ? (
          <Tooltip title={t({ id: isValid ? 'validationSuccessTooltip' : 'validationWarningTooltip' })}>
            <Box display="flex" flex="1 0 0">
              {isValid ? <TickCircle color={theme.palette.success.dark} size={20} variant="Outline" /> : <Danger color={theme.palette.warning.dark} size={20} variant="Outline" />}
            </Box>
          </Tooltip>
        ) : null,
        readOnly: isReadOnly
      }}
    />
  )
}
