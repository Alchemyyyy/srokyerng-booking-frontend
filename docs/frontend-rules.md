# Frontend Rules

These rules keep the Vue codebase consistent while multiple teammates work in parallel.

## Structure

- Put route-level screens in `src/modules/<module>/pages`.
- Put feature-specific UI in `src/modules/<module>/components`.
- Put reusable UI in `src/shared/components`.
- Put API calls in module `services` files.
- Put app-wide low-level services in `src/shared/services`.
- Put module route definitions in `src/modules/<module>/routes.js`.
- Keep `src/app/router/index.js` focused on combining module routes.

## Routing

- Module routes belong beside their module code in `src/modules/<module>/routes.js`.
- App-level guards belong in `src/app/router/guards.js`.
- The main router imports and combines module route arrays.
- Layout parents live in `src/app/router/index.js`.
- Route names are prefixed by layout area, for example `public.login` and `admin.dashboard`.
- Protected routes must use `meta.requiresAuth`.
- Role-protected routes must use role constants from `src/shared/constants/roles.js`.

## API Calls

- Use `src/shared/services/api.js` for backend requests.
- Do not create raw Axios instances inside modules.
- Keep endpoint paths aligned with backend route names.
- Let the API client attach the auth token.

## State

- Use Pinia stores only when state is shared across multiple components or pages.
- Keep temporary form state inside the component.
- Auth session state belongs in `src/modules/auth/store/authStore.js`.

## Styling

- Use global tokens from `src/assets/styles/variables.css`.
- Keep shared component styles reusable and module styles local.
- Avoid hardcoded role strings, route paths, or colors when constants/tokens exist.

## Empty Files

- Empty files are intentional placeholders only during early scaffold work.
- Replace placeholders with real implementation when a module becomes active.
- Do not delete scaffold files without checking module ownership.
