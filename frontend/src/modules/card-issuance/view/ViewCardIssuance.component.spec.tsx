import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { theme } from 'libs/ui-kit/theme/theme'
import { CARD_ISSUANCE_DISABLED_MESSAGE, DISPLAY_NAME_LABEL, ISSUE_CARD_FORM_TITLE } from 'modules/card-issuance/constants/issuance.consts'

const { getStatusMock } = vi.hoisted(() => ({ getStatusMock: vi.fn() }))

vi.mock('libs/api-connectors/backend-connector-reeve/api/backendReeveApi', () => ({
  backendReeveApi: () => ({ cardsApi: { getStatus: getStatusMock } })
}))

// The public layout pulls in a router + an organisation context that have nothing to do with what
// these tests assert (whether the form survives a refetch). Stub it down to plain wrappers.
vi.mock('libs/layout-kit/layout-public/LayoutPublic.component.tsx', () => {
  function Header({ children }: { children: ReactNode }) {
    return <div>{children}</div>
  }
  function Details({ title }: { title: string; description: string }) {
    return <h1>{title}</h1>
  }
  function Main({ children }: { children: ReactNode }) {
    return <div>{children}</div>
  }
  Header.Details = Details

  return { LayoutPublic: { Header, Main } }
})

// Imported after the mocks above so the view picks them up.
const { ViewCardIssuance } = await import('modules/card-issuance/view/ViewCardIssuance.component')

const renderView = () => {
  const queryClient = new QueryClient()
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <MuiThemeProvider theme={theme}>
        <StyledComponentsThemeProvider theme={theme}>
          <ViewCardIssuance />
        </StyledComponentsThemeProvider>
      </MuiThemeProvider>
    </QueryClientProvider>
  )
  return { ...utils, queryClient }
}

describe('ViewCardIssuance', () => {
  beforeEach(() => {
    getStatusMock.mockReset()
    focusManager.setFocused(undefined)
  })

  it('keeps the card form — and everything typed into it — mounted while a background refetch is in flight', async () => {
    // The regression: the view used to gate IssueCardForm on isFetching, so any background
    // revalidation of the status flag unmounted the form and destroyed all card-creation state.
    // Returning to the browser tab triggers exactly such a refetch.
    //
    // The second call is left PENDING on purpose. An immediately-resolved refetch settles inside a
    // single React batch, so isFetching never survives to a render and even the buggy gate looks
    // fine — the bug only shows while the request is genuinely in flight.
    let releaseRefetch: () => void = () => undefined
    getStatusMock
      .mockResolvedValueOnce({ issuance_enabled: true })
      .mockReturnValueOnce(new Promise((resolve) => {
        releaseRefetch = () => resolve({ issuance_enabled: true })
      }))

    const user = userEvent.setup()
    const { queryClient } = renderView()

    const field = (await screen.findByLabelText(DISPLAY_NAME_LABEL)) as HTMLInputElement
    await user.type(field, 'Ada Lovelace')
    expect(field.value).toBe('Ada Lovelace')

    void queryClient.refetchQueries({ queryKey: ['CARD_STATUS'] })
    await waitFor(() => expect(getStatusMock).toHaveBeenCalledTimes(2))

    // Mid-flight: same DOM node, same value — the subtree was never torn down.
    expect(document.body.contains(field)).toBe(true)
    expect(field.value).toBe('Ada Lovelace')
    expect(screen.getByText(ISSUE_CARD_FORM_TITLE)).toBeInTheDocument()

    releaseRefetch()
    await waitFor(() => expect(screen.getByText(ISSUE_CARD_FORM_TITLE)).toBeInTheDocument())
    expect((screen.getByLabelText(DISPLAY_NAME_LABEL) as HTMLInputElement).value).toBe('Ada Lovelace')
  })

  it('does not refetch the deployment flag when the window regains focus', async () => {
    // issuance_enabled is a deployment-time flag; the staleTime keeps a tab switch from turning into
    // a request at all. The isPending gate above is what makes a refetch harmless either way.
    getStatusMock.mockResolvedValue({ issuance_enabled: true })
    renderView()

    await screen.findByLabelText(DISPLAY_NAME_LABEL)
    expect(getStatusMock).toHaveBeenCalledTimes(1)

    focusManager.setFocused(false)
    focusManager.setFocused(true)

    // A settle window, not a waitFor: waitFor would pass on its very first check (the count is
    // already 1) and so could never observe the refocus refetch this asserts the absence of.
    await new Promise((resolve) => {
      setTimeout(resolve, 50)
    })
    expect(getStatusMock).toHaveBeenCalledTimes(1)
  })

  it('renders neither the form nor the disabled message until the first load resolves', () => {
    getStatusMock.mockReturnValue(new Promise(() => undefined))
    renderView()

    expect(screen.queryByText(ISSUE_CARD_FORM_TITLE)).not.toBeInTheDocument()
    expect(screen.queryByText(CARD_ISSUANCE_DISABLED_MESSAGE)).not.toBeInTheDocument()
  })

  it('renders the disabled message and no form when issuance is switched off', async () => {
    getStatusMock.mockResolvedValue({ issuance_enabled: false })
    renderView()

    expect(await screen.findByText(CARD_ISSUANCE_DISABLED_MESSAGE)).toBeInTheDocument()
    expect(screen.queryByText(ISSUE_CARD_FORM_TITLE)).not.toBeInTheDocument()
  })
})
