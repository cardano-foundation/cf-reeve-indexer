import { render, screen, fireEvent } from '@testing-library/react'
import { Formik, Form, Field } from 'formik'
import { it } from 'vitest'

import { InputTextareaField } from './InputTextareaField.component'

describe('InputTextareaField', () => {
  it('passes dataTestId prop to data-testid attribute', async () => {
    render(
      <Formik initialValues={{ test: '' }} onSubmit={() => {}}>
        <Form>
          <Field name="test" component={InputTextareaField} dataTestId="test-id" />
        </Form>
      </Formik>
    )
    const textarea = await screen.findByTestId('test-id')

    expect(textarea).toBeVisible()
  })

  it('integrates with Formik correctly', async () => {
    let handleChangeCalled = false
    let handleBlurCalled = false

    render(
      <Formik initialValues={{ test: '' }} onSubmit={() => {}}>
        <Form>
          <Field
            name="test"
            component={InputTextareaField}
            onChange={() => {
              handleChangeCalled = true
            }}
            onBlur={() => {
              handleBlurCalled = true
            }}
          />
        </Form>
      </Formik>
    )

    const textarea = await screen.findByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'new value' } })
    fireEvent.blur(textarea)

    expect(handleChangeCalled).toBe(true)
    expect(handleBlurCalled).toBe(true)
  })
})
