import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'

import { Snackbar, SnackbarProps } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { SnackbarActionType, useSnackbar } from 'libs/ui-kit/components/Snackbar/useSnackbar.tsx'
import { TestWrapper } from 'libs/vitest/components/TestWrapper.component.tsx'

describe('Snackbar and useSnackbar', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSnackbar())

    expect(result.current.isSnackbarVisible).toBe(false)
    expect(result.current.snackbarActionType).toBeUndefined()
  })

  it('should show snackbar', () => {
    const { result } = renderHook(() => useSnackbar())

    act(() => {
      result.current.showSnackbar()
    })

    expect(result.current.isSnackbarVisible).toBe(true)
  })

  it('should close snackbar when reason is not clickaway', () => {
    const { result } = renderHook(() => useSnackbar())

    act(() => {
      result.current.showSnackbar()
    })

    act(() => {
      result.current.handleClose(new Event('close'), 'escapeKeyDown')
    })

    expect(result.current.isSnackbarVisible).toBe(false)
  })

  it('should not close snackbar when reason is clickaway', () => {
    const { result } = renderHook(() => useSnackbar())

    act(() => {
      result.current.showSnackbar()
    })

    act(() => {
      result.current.handleClose(new Event('close'), 'clickaway')
    })

    expect(result.current.isSnackbarVisible).toBe(true)
  })

  it('should set snackbar action type', () => {
    const { result } = renderHook(() => useSnackbar())

    act(() => {
      result.current.setSnackbarActionType(SnackbarActionType.APPROVE)
    })

    expect(result.current.snackbarActionType).toBe(SnackbarActionType.APPROVE)
  })
})

const SnackbarWithProviders = ({ ...props }: SnackbarProps) => {
  return (
    <TestWrapper>
      <Snackbar {...props} />
    </TestWrapper>
  )
}

describe('Snackbar', () => {
  const defaultProps: SnackbarProps = {
    open: true,
    message: 'Test message',
    hint: 'Test hint',
    onClose: vi.fn()
  }

  it('should render the Snackbar with message and hint', () => {
    render(<SnackbarWithProviders {...defaultProps} />)

    expect(screen.getByText('Test message')).toBeInTheDocument()
    expect(screen.getByText('Test hint')).toBeInTheDocument()
  })

  it('should call onClose when the close button is clicked', () => {
    render(<SnackbarWithProviders {...defaultProps} />)

    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should not render hint if not provided', () => {
    render(<SnackbarWithProviders {...defaultProps} hint={undefined} />)

    expect(screen.queryByText('Test hint')).not.toBeInTheDocument()
  })
})
