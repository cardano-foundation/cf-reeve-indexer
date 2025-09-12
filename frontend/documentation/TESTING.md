# Testing

## E2E tests - Playwright

### Tools used

In our project to run e2e tests we have decided to use Playwright automation tool with Cucumber a behavior-driven development (BDD) framework. This approach can improve collaboration between developers, testers, and non-technical stakeholders. All tests can be found in playwright directory.

### How to use Cucumber with Playwright

When writing tests, define your feature files in the features directory using Gherkin syntax. Implement the corresponding step definitions in the steps directory. Each step definition should use Playwright to interact with the browser and perform assertions. We also use pages directory where we define page objects.

#### How to run cucumber and playwright e2e tests

You can run tests on different environments when developing.
To run tests on localhost use: `npm run test:localhost`
To run tests on staging use: `npm run test:staging`

## Unit and integration tests - Vitest + React Testing Library + Mock Service Worker

### TestWrapper

There is a TestWrapper in `libs/vitest/componentsTestWrapper.compoent.tsx` which includes necessary providers. It can be used e.g. like this:

```tsx
const SidebarWithProviders = ({ isSidebarOpen, children }: { isSidebarOpen: boolean; children: ReactNode }) => {
  return (
    <TestWrapper>
      <Sidebar isSidebarOpen={isSidebarOpen}>{children}</Sidebar>
    </TestWrapper>
  )
}
```

and then rendered in each test:

```tsx
 it('renders the logo', () => {
  render(<SidebarWithProviders isSidebarOpen={true}>Test Content</SidebarWithProviders>)

  ...
})
```
