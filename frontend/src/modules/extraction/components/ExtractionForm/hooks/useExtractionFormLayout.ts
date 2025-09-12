import { FormikErrors } from 'formik'
import { SyntheticEvent, useEffect, useState } from 'react'

import {
  OrganisationChartTypesApiResponse200,
  OrganisationCostCentersApiResponse200,
  OrganisationProjectsApiResponse200
} from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.types.ts'
import { AutocompleteMultipleOption } from 'libs/ui-kit/components/InputAutocompleteMultiple/InputAutocompleteMultiple.component.tsx'
import { ExtractionFormValues } from 'modules/extraction/components/ExtractionForm/ExtractionForm.types.ts'
import {
  findAccountSubtypesAndTypesforAccountCodes,
  findAccountTypesForAccountSubtypes,
  getAccountCodesForAccountTypes,
  getAccountCodesForAccountTypesAndSubtypes,
  getAccountSubtypesForAccountTypes,
  getAllAccountCodeOptions,
  getAllAccountSubtypeOptions,
  getAllAccountTypeOptions,
  getAllCostCenterOptions,
  getAllProjectOptions
} from 'modules/extraction/components/ExtractionForm/ExtractionForm.utils.ts'

type SetFieldValue = (field: string, value: string[], shouldValidate?: boolean) => Promise<void | FormikErrors<ExtractionFormValues>>

export const useExtractionFormLayout = (
  organisationChartTypes: OrganisationChartTypesApiResponse200 | null,
  organisationCostCenters: OrganisationCostCentersApiResponse200 | null,
  organisationProjects: OrganisationProjectsApiResponse200 | null,
  setFieldValue: SetFieldValue
) => {
  const [accountTypeOptions, setAccountTypeOptions] = useState<AutocompleteMultipleOption[]>([])
  const [accountSubtypeOptions, setAccountSubtypeOptions] = useState<AutocompleteMultipleOption[]>([])
  const [accountCodeOptions, setAccountCodeOptions] = useState<AutocompleteMultipleOption[]>([])
  const [costCenterOptions, setCostCenterOptions] = useState<AutocompleteMultipleOption[]>([])
  const [projectOptions, setProjectOptions] = useState<AutocompleteMultipleOption[]>([])

  const handleAccountTypeChange = (_event: SyntheticEvent, newSelectedOptions: AutocompleteMultipleOption[]) => {
    const values = newSelectedOptions.map((option) => option.value)

    const subtypeOptions = values.length > 0 ? getAccountSubtypesForAccountTypes(organisationChartTypes, values) : getAllAccountSubtypeOptions(organisationChartTypes)
    const codeOptions = values.length > 0 ? getAccountCodesForAccountTypes(organisationChartTypes, values) : getAllAccountCodeOptions(organisationChartTypes)

    setAccountSubtypeOptions(subtypeOptions)
    setAccountCodeOptions(codeOptions)

    setFieldValue('accountType', values)
    setFieldValue('accountSubtype', [])
    setFieldValue('accountCode', [])
  }

  const handleAccountSubtypeChange = (_event: SyntheticEvent, newSelectedOptions: AutocompleteMultipleOption[]) => {
    const values = newSelectedOptions.map((option) => option.value)

    const types = findAccountTypesForAccountSubtypes(organisationChartTypes, values)

    const codeOptions = values.length > 0 ? getAccountCodesForAccountTypesAndSubtypes(organisationChartTypes, types, values) : getAllAccountCodeOptions(organisationChartTypes)

    setAccountCodeOptions(codeOptions)

    setFieldValue('accountSubtype', values)
    setFieldValue('accountType', types)
    setFieldValue('accountCode', [])
  }

  const handleAccountCodeChange = (_event: SyntheticEvent, newSelectedOptions: AutocompleteMultipleOption[]) => {
    const values = newSelectedOptions.map((option) => option.value)

    const { accountSubtypes, accountTypes } = findAccountSubtypesAndTypesforAccountCodes(organisationChartTypes, values)

    if (values.length === 0) {
      setAccountSubtypeOptions(getAllAccountSubtypeOptions(organisationChartTypes))
      setAccountCodeOptions(getAllAccountCodeOptions(organisationChartTypes))
    }

    setFieldValue('accountCode', values)
    setFieldValue('accountType', accountTypes)
    setFieldValue('accountSubtype', accountSubtypes)
  }

  useEffect(() => {
    setAccountCodeOptions(getAllAccountCodeOptions(organisationChartTypes))
    setAccountSubtypeOptions(getAllAccountSubtypeOptions(organisationChartTypes))
    setAccountTypeOptions(getAllAccountTypeOptions(organisationChartTypes))
    setCostCenterOptions(getAllCostCenterOptions(organisationCostCenters))
    setProjectOptions(getAllProjectOptions(organisationProjects))
  }, [organisationChartTypes, organisationCostCenters, organisationProjects, setAccountCodeOptions, setAccountSubtypeOptions, setAccountTypeOptions])

  return {
    accountCodeOptions,
    accountSubtypeOptions,
    accountTypeOptions,
    costCenterOptions,
    projectOptions,
    handleAccountCodeChange,
    handleAccountSubtypeChange,
    handleAccountTypeChange
  }
}
