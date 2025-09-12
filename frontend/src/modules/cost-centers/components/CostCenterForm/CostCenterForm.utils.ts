import { CostCenterResponse } from 'libs/api-connectors/backend-connector-lob/api/cost-centers/costCentersApi.types.ts'
import { SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component.tsx'

export const getParentCodeOptions = (costCenters: CostCenterResponse[], currentCode: string | null) => {
  const uniqueCodes = Array.from(new Set(costCenters.map(({ customerCode }) => customerCode))).map((customerCode) => ({ name: customerCode }))

  return uniqueCodes
    ? uniqueCodes
        .map<SelectOption>(({ name: parentCode }) => ({
          name: `${parentCode} - ${costCenters.find((code) => code.customerCode === parentCode)?.name}`,
          value: parentCode
        }))
        .filter((parentCode) => parentCode.value !== currentCode)
        .sort((a, b) => a.name.localeCompare(b.name))
    : []
}
