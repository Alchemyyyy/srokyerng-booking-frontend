# Frontend Rules

These rules keep the Vue codebase consistent while multiple teammates work in parallel.

## Structure

- Put route-level screens in `src/modules/<module>/pages`.
- Put feature-specific UI in `src/modules/<module>/components`.
- Put reusable UI in `src/shared/components`.
- Put backend endpoint wrappers in `src/modules/<module>/api`.
- Put module orchestration helpers in `src/modules/<module>/services` only when needed.
- Put app-wide low-level API/http clients in shared/app service folders.
- Put module route definitions in `src/modules/<module>/routes.js`.
- Keep `src/app/router/index.js` focused on combining module routes.

## Routing

- Module routes belong beside their module code in `src/modules/<module>/routes.js`.
- App-level guards belong in `src/app/router/guards.js`.
- The main router imports and combines module route arrays.
- Layout parents live in `src/app/router/index.js`.
- Scaffold route files may export empty arrays until pages are ready.
- Do not wire unfinished route arrays into `src/app/router/index.js` unless they point to safe placeholder pages.
- Route names are prefixed by layout area, for example `public.login` and `admin.dashboard`.
- Protected routes must use `meta.requiresAuth`.
- Role-protected routes must use role constants from `src/shared/constants/roles.js`.

## API Calls

- Use the shared HTTP/API client for backend requests.
- Do not create raw Axios instances inside modules.
- Module API files should export a named API object, for example `propertyApi` or `wishlistApi`.
- Keep endpoint paths aligned with backend route names.
- Let the API client attach the auth token.

## State

- Use Pinia stores only when state is shared across multiple components or pages.
- Keep temporary form state inside the component.
- Auth session state belongs in `src/modules/auth/store/authStore.js`.

## Language

- Use `vue-i18n` for route pages and reusable components.
- Put global/common keys in `src/app/i18n/locales/en.json` and `src/app/i18n/locales/km.json`.
- Avoid hardcoded UI labels in real pages; use `t("module.key")` instead.
- User-created database content is not translated automatically; display it as entered unless the feature supports bilingual fields.
- Hardcoded text is acceptable in temporary design samples and throwaway demos.

## Styling

- Use Tailwind utilities for layout, spacing, responsive design, and simple visual states.
- Use global tokens from `src/assets/styles/variables.css` for brand colors, surfaces, borders, shadows, radius, and dark mode.
- Prefer token-based Tailwind arbitrary values for project colors, for example `bg-(--color-surface)` and `text-(--color-text)`.
- Avoid random Tailwind color classes like `bg-blue-500`, `text-gray-700`, or `border-slate-200` unless the team lead approves them.
- Keep shared component styles reusable and module styles local.
- Avoid hardcoded role strings, route paths, or colors when constants/tokens exist.

## Empty Files

- Empty files are intentional placeholders only during early scaffold work.
- Replace placeholders with real implementation when a module becomes active.
- Do not delete scaffold files without checking module ownership.
- Keep module README files updated when a module has special route ownership or integration rules.
