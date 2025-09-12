import dayjs from 'dayjs'
import { FormikHelpers } from 'formik'

import { ChartOfAccount } from 'libs/api-connectors/backend-connector-lob/api/chart-of-accounts/chartOfAccountsApi.types'
import { OrganisationApiResponse } from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.types.ts'
import { formatNumber } from 'libs/utils/format.ts'
import { ChartOfAccountFormValues } from 'modules/chart-of-accounts/components/ChartOfAccountForm/ChartOfAccountForm.types.ts'

interface ChartOfAccountFormState {
  chartOfAccount?: ChartOfAccount
  organisation: OrganisationApiResponse | null
}

interface ChartOfAccountFormHandlers {
  onCancel: () => void
  onConfirm: (values: ChartOfAccountFormValues, formikHelpers: FormikHelpers<ChartOfAccountFormValues>, isEditMode: boolean) => Promise<void>
}

export const useChartOfAccountForm = (state: ChartOfAccountFormState, handlers: ChartOfAccountFormHandlers, isEditMode: boolean) => {
  const { chartOfAccount, organisation } = state
  const { onCancel, onConfirm } = handlers

  const initialValues: ChartOfAccountFormValues = {
    customerCode: chartOfAccount?.customerCode ?? '',
    description: chartOfAccount?.name ?? '',
    currency: chartOfAccount?.currency ?? '',
    eventRefCode: chartOfAccount?.eventRefCode ?? '',
    type: chartOfAccount?.type ?? '',
    subType: chartOfAccount?.subType ?? '',
    counterParty: chartOfAccount?.counterParty ?? '',

    hasParent: Boolean(chartOfAccount?.parentCustomerCode),
    parentCustomerCode: chartOfAccount?.parentCustomerCode ?? '',

    hasBalance: Boolean(chartOfAccount?.openingBalance),
    balanceFCY: formatNumber(chartOfAccount?.openingBalance?.balanceFCY ?? 0),
    balanceLCY: formatNumber(chartOfAccount?.openingBalance?.balanceLCY ?? 0),
    originalCurrencyIdFCY: chartOfAccount?.openingBalance?.originalCurrencyIdFCY || chartOfAccount?.currency || organisation?.currencyId?.slice(-3) || '',
    originalCurrencyIdLCY: chartOfAccount?.openingBalance?.originalCurrencyIdLCY || chartOfAccount?.currency || organisation?.currencyId?.slice(-3) || '',
    balanceType: chartOfAccount?.openingBalance?.balanceType ?? 'DEBIT',
    date: chartOfAccount?.openingBalance?.date ? dayjs(chartOfAccount?.openingBalance.date, 'YYYY-MM-DD').format('DD/MM/YYYY') : '',

    active: Boolean(chartOfAccount?.active)
  }

  const handleFormSubmit = async (values: ChartOfAccountFormValues, formikHelpers: FormikHelpers<ChartOfAccountFormValues>) => {
    await onConfirm(values, formikHelpers, isEditMode)
    onCancel()
  }

  return { initialValues, handleFormSubmit }
}
