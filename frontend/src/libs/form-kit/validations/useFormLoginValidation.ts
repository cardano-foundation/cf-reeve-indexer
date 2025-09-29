import * as Yup from 'yup'

import { useFieldUsernameOrEmailValidation } from 'libs/form-kit/validations/useFieldUsernameOrEmailValidation.ts'

export const useFormLoginValidation = () => {
  const fieldUsernameOrEmailValidation = useFieldUsernameOrEmailValidation()

  return Yup.object({
    usernameOrEmail: fieldUsernameOrEmailValidation
  })
}
