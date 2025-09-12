import * as Yup from 'yup'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

export const useFormChartOfAccountValidation = (isEditMode: boolean, existingCodes: string[]) => {
  const { t } = useTranslations()

  let customerCodeSchema = Yup.string().required(t({ id: 'numberIsRequired' }))

  if (!isEditMode) {
    customerCodeSchema = customerCodeSchema.notOneOf(existingCodes, t({ id: 'customerCodeAlreadyExists' }))
  }

  return Yup.object({
    customerCode: customerCodeSchema,
    description: Yup.string().required(t({ id: 'descriptionIsRequired' })),
    counterParty: Yup.string().optional(),
    currency: Yup.string().optional(),
    type: Yup.string().required(t({ id: 'typeIsRequired' })),
    subType: Yup.string().required(t({ id: 'subtypeIsRequired' })),
    eventRefCode: Yup.string().required(t({ id: 'referenceCodeIsRequired' })),
    parentCustomerCode: Yup.string().when('hasParent', {
      is: true,
      then: (schema) => schema.required(t({ id: 'parentCodeIsRequired' })),
      otherwise: (schema) => schema.notRequired().nullable()
    }),
    date: Yup.string().test('date', t({ id: 'dateIsRequired' }), function (value) {
      const { hasBalance } = this.parent

      return !hasBalance || !!value
    }),
    balanceFCY: Yup.string().test('amountFCY', t({ id: 'amountFCYIsRequired' }), function (value) {
      const { hasBalance } = this.parent

      return !hasBalance || !!value
    }),
    balanceLCY: Yup.string().test('amountLCY', t({ id: 'amountLCYIsRequired' }), function (value) {
      const { hasBalance } = this.parent

      return !hasBalance || !!value
    }),
    hasBalance: Yup.boolean().optional(),
    hasParent: Yup.boolean().optional(),
    active: Yup.boolean().optional()
  })
}
