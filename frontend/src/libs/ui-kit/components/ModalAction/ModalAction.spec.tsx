import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { it, vi } from 'vitest'

import { ButtonSecondary } from 'libs/ui-kit/components/ButtonSecondary/ButtonSecondary.component.tsx'
import { ModalAction, ModalActionProps } from 'libs/ui-kit/components/ModalAction/ModalAction.component.tsx'
import { TestWrapper } from 'libs/vitest/components/TestWrapper.component.tsx'

const ModalActionWithProviders = (props: ModalActionProps) => {
  return (
    <TestWrapper>
      <ModalAction {...props} />
    </TestWrapper>
  )
}

describe('ModalAction', () => {
  it('renders primary button and opens modal on click', () => {
    render(
      <ModalActionWithProviders
        message="Test message"
        primaryActionLabel="Confirm"
        secondaryActionLabel="Cancel"
        renderButton={({ handleClickOpen, isModalDisabled }: { handleClickOpen: () => void; isModalDisabled?: boolean }) => (
          <ButtonSecondary onClick={handleClickOpen} disabled={isModalDisabled}>
            Approve
          </ButtonSecondary>
        )}
      />
    )

    const primaryButton = screen.getByRole('button', { name: /approve/i })

    expect(primaryButton).toBeInTheDocument()
    fireEvent.click(primaryButton)

    const dialog = screen.getByRole('dialog')

    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('calls primaryActionOnClick and closes modal on primary button click', async () => {
    const primaryActionOnClick = vi.fn()

    render(
      <ModalActionWithProviders
        message="Test message"
        primaryActionLabel="Confirm"
        primaryActionOnClick={primaryActionOnClick}
        secondaryActionLabel="Cancel"
        renderButton={({ handleClickOpen, isModalDisabled }: { handleClickOpen: () => void; isModalDisabled?: boolean }) => (
          <ButtonSecondary onClick={handleClickOpen} disabled={isModalDisabled}>
            Approve
          </ButtonSecondary>
        )}
      />
    )

    const primaryButton = screen.getByRole('button', { name: /approve/i })
    fireEvent.click(primaryButton)

    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    fireEvent.click(confirmButton)

    expect(primaryActionOnClick).toHaveBeenCalled()

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('calls secondaryActionOnClick and closes modal on secondary button click', async () => {
    const secondaryActionOnClick = vi.fn()

    render(
      <ModalActionWithProviders
        message="Test message"
        primaryActionLabel="Confirm"
        secondaryActionLabel="Cancel"
        secondaryActionOnClick={secondaryActionOnClick}
        renderButton={({ handleClickOpen, isModalDisabled }: { handleClickOpen: () => void; isModalDisabled?: boolean }) => (
          <ButtonSecondary onClick={handleClickOpen} disabled={isModalDisabled}>
            Approve
          </ButtonSecondary>
        )}
      />
    )

    const primaryButton = screen.getByRole('button', { name: /approve/i })
    fireEvent.click(primaryButton)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(secondaryActionOnClick).toHaveBeenCalled()

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('disables the button when isModalDisabled is true', () => {
    render(
      <ModalActionWithProviders
        message="Test message"
        primaryActionLabel="Confirm"
        secondaryActionLabel="Cancel"
        isModalDisabled={true}
        renderButton={({ handleClickOpen, isModalDisabled }: { handleClickOpen: () => void; isModalDisabled?: boolean }) => (
          <ButtonSecondary onClick={handleClickOpen} disabled={isModalDisabled}>
            Approve
          </ButtonSecondary>
        )}
      />
    )

    const primaryButton = screen.getByRole('button', { name: /approve/i })

    expect(primaryButton).toBeDisabled()
  })

  it('disables the primary button when isPrimaryButtonDisabled is true', () => {
    render(
      <ModalActionWithProviders
        message="Test message"
        primaryActionLabel="Confirm"
        secondaryActionLabel="Cancel"
        isPrimaryButtonDisabled={true}
        renderButton={({ handleClickOpen, isModalDisabled }: { handleClickOpen: () => void; isModalDisabled?: boolean }) => (
          <ButtonSecondary onClick={handleClickOpen} disabled={isModalDisabled}>
            Approve
          </ButtonSecondary>
        )}
      />
    )

    const primaryButton = screen.getByRole('button', { name: /approve/i })
    fireEvent.click(primaryButton)

    const primaryActionButton = screen.getByRole('button', { name: /confirm/i })
    expect(primaryActionButton).toBeDisabled()
  })
})
