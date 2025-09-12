import { render, screen } from '@testing-library/react'
import { Formik, Form } from 'formik'
import { it } from 'vitest'

import { TranslationsProvider } from 'libs/translations/components/TranslationsProvider/TranslationsProvider.component.tsx'

import { FieldTransactionNumbers } from './FieldTransactionNumbers.component'

describe('FieldTransactionNumbers', () => {
  it('renders without crashing', () => {
    render(
      <TranslationsProvider>
        <Formik initialValues={{ transactionNumbers: '' }} onSubmit={() => {}}>
          <Form>
            <FieldTransactionNumbers />
          </Form>
        </Formik>
      </TranslationsProvider>
    )

    const textarea = screen.getByPlaceholderText('LOB123, CF456')
    expect(textarea).toBeVisible()
  })
})
