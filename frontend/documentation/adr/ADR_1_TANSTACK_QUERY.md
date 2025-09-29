# ADR 1: Incorporating [TanStack Query](https://tanstack.com/query/latest) in Our React Project

## The Situation

When it comes to developing modern web applications, we often find ourselves dealing with data fetching, caching, synchronization, and updates. These tasks can be quite complex and repetitive. To simplify these tasks, we need a robust solution that can handle these operations efficiently and effectively. In the context of a React application, we've decided to go with TanStack Query.

## The Decision

We've made the call to use TanStack Query in our React project.

## The Reasoning

1. **Server State vs Client State**: TanStack Query makes a clear distinction between the server state (the state stored on the server) and the client state (UI state). This distinction allows for efficient data fetching, caching, and state updates.
2. **Automatic Caching and Background Updates**: TanStack Query automatically caches data and updates it in the background when there are changes. This feature reduces the number of requests to the server, improving performance.
3. **Devtools**: TanStack Query provides a set of devtools that help in debugging and provide insights into the state of your queries.
4. **Pagination and Infinite Queries**: TanStack Query supports pagination and infinite queries out of the box. This feature is beneficial for applications that need to handle large amounts of data.
5. **Retries and Refetching**: TanStack Query has built-in support for retries and refetching. This feature is useful when dealing with unstable network connections.
6. **Mutations**: TanStack Query provides a useMutation hook for performing create, update, and delete operations. This hook returns mutation status info that can be used to update the UI based on the mutation's state.
7. **Suspense Ready**: TanStack Query is Suspense ready, which allows for fetching data in the background while displaying a fallback UI.
8. **Integration with React**: As TanStack Query is built for React, it integrates well with the React ecosystem, including support for hooks.

You can read more in the [TanStack Query documentation](https://tanstack.com/query/latest).

## The Impact

By using TanStack Query, we expect to see improved performance due to reduced network requests, thanks to caching. We also expect to see a cleaner codebase as TanStack Query abstracts away much of the complexity involved in data fetching, caching, and state management. However, there may be a learning curve for developers unfamiliar with TanStack Query.
