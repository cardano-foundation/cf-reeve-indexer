# Development

## Table of Contents

- [Conventions and Patterns](#conventions-and-patterns)
- [Contributing](#contributing)

## Conventions and Patterns

- Please use specific prefixes for booleans values, e.g. `isPrimary`, `hasIcon`, `isActive`, `shouldReload`, `hasError`, `isLoading`. There are some exceptions:
  - native html elements' attributes e.g. `disabled` in components which eventually render a native html element
- Name functions in a way that they indicate what they do (use verb), and what they use to do it e.g.

  ```ts
  const addUser = userData => {...}
  ```

  ```ts
  const renderItems = items => {...}
  ```

  ```ts
  const getColor =  color => {...}
  ```

- If the name is composed of multiple words, it is good to place the main phrase at the beginning,
  even if grammatically it sounds awkward e.g. `LayoutOnboardingIndividual`. Although you might be tempted to call it `IndividualOnboardingLayout`,
  it is best to call it `LayoutOnboardingIndividual`, if the fact that the layout is the most important factor in the particular case
- Use `SNAKE_CASE_WITH_ALL_CAPS` for names of the consts storing strings which are frequently reused e.g. `const TRANSACTIONS = 'transactions'`. Please note that the name should be composed of the same words as the stored string.
- General advice: do not try to write as short names as possible, longer and more meaningful name is usually better.
- If there is a lot of mocked data and it doesn't fit inside for example test file, it should be moved to `ComponentName.mocks.ts`. Mocked data shouldn't be mixed with consts used in the application.
- If you add a 'TODO comment', try to include Issue number from github, for example: `// TODO: <ISSUE-47> todo content`.

## Contributing

While naming a branch please start with the task type indicator (feature, fix or hotfix) followed by `/` , and task description e.g. `feature/add-navbar`, `fix/change-button`.

We are using [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)

Available types:

| type       | description                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| `feat`     | new feature (bumps minor version - x.1.0)                                                              |
| `fix`      | bug fix (bumps fix version - x.x.1)                                                                    |
| `docs`     | documentation changes                                                                                  |
| `style`    | changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc) |
| `refactor` | self explained - not a feat/fix, just plain refactor                                                   |
| `test`     | commit with tests only                                                                                 |
| `chore`    | other changes - build process, tools, docs generation                                                  |

Most frequently used are: feat, fix and test, e.g. `feat: add navbar`, `fix: apply qa fixes`, `test: add more tests for navbar`. If you update README, the commit message would be `docs: update readme`. If you'd like to learn more, see the [Commitizen documentation](https://github.com/commitizen/cz-cli)
