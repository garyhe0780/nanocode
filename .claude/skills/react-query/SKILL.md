React Query Best Practices Skill. Query Key Management

* Always Use Arrays: Even for simple keys, use the array format ['todos'] to stay consistent with modern versions.
* Include All Dependencies: Any variable used in your queryFn (IDs, filters, page numbers) must be in the query key to ensure automatic refetching when they change.
* Use Query Key Factories: Centralize keys in a single object or function to avoid hardcoded strings and prevent "magic string" bugs.

const todoKeys = {
  all: ['todos'],
  lists: () => [...todoKeys.all, 'list'],
  detail: (id) => [...todoKeys.all, 'detail', id],
};

[1, 2, 3, 4, 5] 

2. Caching Strategy

* Set Global Defaults: Configure sensible staleTime and gcTime (formerly cacheTime) at the QueryClient level based on your app's volatility.
* StaleTime vs. gcTime:
* staleTime: How long data remains "fresh." Set it higher for data that rarely changes to reduce network calls.
   * gcTime: How long inactive data stays in memory before being garbage collected.
* Disable Unnecessary Refetching: Turn off refetchOnWindowFocus for data that doesn't change frequently to save resources. [2, 3, 6, 7, 8] 

3. Mutations & State Updates

* Always Invalidate After Mutations: Use queryClient.invalidateQueries in the onSuccess callback to mark related data as stale and trigger a refresh.
* Implement Optimistic Updates: For a "snappier" feel, update the UI immediately and use onMutate to provide a rollback context in case the server request fails.
* Prefer mutate over mutateAsync: Use mutate for most cases as it doesn't require manual error handling (the library handles it via onError). Only use mutateAsync if you need to chain multiple promises. [1, 2, 7, 9, 10] 

4. Performance & UX

* Leverage Prefetching: Use queryClient.prefetchQuery when a user hovers over a link or button to eliminate perceived loading time.
* Use select for Transformations: Use the select option to transform or filter data from a query; this prevents unnecessary re-renders if the transformed data hasn't changed.
* Abstractions with Custom Hooks: Wrap every query and mutation in its own custom hook (e.g., useUserQuery) to keep component logic clean and reusable. [1, 11, 12, 13, 14] 

5. Architecture & Tooling

* Install DevTools: Always include the React Query DevTools in development to visualize cache status and troubleshoot state.
* Type Safety: Use TypeScript to define the expected shape of your API responses, ensuring better IntelliSense and fewer runtime errors.
* Resource-Based Organization: Group your services and hooks by resource (e.g., users.hooks.ts, posts.hooks.ts) to mirror your API structure. [7, 11, 15, 16, 17] 


[1] [https://lobehub.com](https://lobehub.com/skills/aidanaden-sg-food-guide-react-query-data-patterns)
[2] [https://agentskills.so](https://agentskills.so/skills/deckardger-tanstack-agent-skills-tanstack-query-best-practices)
[3] [https://lobehub.com](https://lobehub.com/skills/yoriichi-dang-portfolio-tanstack-query-best-practices)
[4] [https://medium.com](https://medium.com/@skmanjuralli9/mastering-react-query-a-comprehensive-guide-383f01b6325c)
[5] [https://dev.to](https://dev.to/myogeshchavan97/react-query-complete-beginners-guide-tanstack-query-v5-react-vite-4h60)
[6] [https://lobehub.com](https://lobehub.com/zh/skills/inselfcontroll-ai-agent-skills-react-best-practices)
[7] [https://medium.com](https://medium.com/@nuwanpsubasinghe85/top-10-react-query-features-every-developer-should-know-in-2024-ac5de09827dd)
[8] [https://tkdodo.eu](https://tkdodo.eu/blog/practical-react-query#:~:text=The%20Defaults%20explained%20staleTime%20:%20The%20duration,the%20cache.%20This%20defaults%20to%205%20minutes.)
[9] [https://dev.to](https://dev.to/imzihad21/master-react-api-management-with-tanstack-react-query-best-practices-examples-1139)
[10] [https://www.dhiwise.com](https://www.dhiwise.com/blog/design-converter/react-query-update-cache-strategies-for-better-data-handling)
[11] [https://github.com](https://github.com/reboottime/React-Development/issues/96)
[12] [https://www.linkedin.com](https://www.linkedin.com/posts/manishyadav0_tanstack-query-react-query-patterns-for-activity-7394017151856295936-Ftkd)
[13] [https://dev.to](https://dev.to/zopdev/react-query-from-beginner-to-advanced-a-practical-guide-to-mastering-crud-53an)
[14] [https://medium.com](https://medium.com/enlear-academy/react-query-in-next-js-a-beginners-guide-to-efficient-data-fetching-3667e30a795d#:~:text=Avoid%20Over%2DFetching:%20Use%20the%20select%20option%20in,filter%20data%20before%20it%20reaches%20your%20components.)
[15] [https://github.com](https://github.com/reboottime/React-Development/issues/96)
[16] [https://tanstack.com](https://tanstack.com/query/v4/docs/react/devtools)
[17] [https://www.youtube.com](https://www.youtube.com/watch?v=FwBqaLHytbY)
