# Frontend Module Ownership

This frontend uses intentional module scaffolding. Empty files mean the module path is reserved and ready for the assigned owner.

## Ownership

* **Sambath(M):** app shell, router guards, auth integration, shared API patterns, structure review, final merge review
* **Sambath(F):** `properties`, `rooms`, public pages (home, search, property detail, room detail), customer booking pages
* **Thanun:** owner dashboard pages, admin dashboard pages, payment verification UI, property approval UI
* **Leakhena:**: `reviews`, `amenities`, admin support pages, shared feature integration
* **Phase 2 Owners:** `wishlists`, `notifications`, `analytics`, `chats`, `reports` should be assigned before implementation starts
- Backend-aligned Reservation/Payment Support: booking flow integration, payment upload/status integration, reservation history integration
- Shared UI Owner (collaborative): reusable components, layout consistency, form patterns, table patterns, UI polish

## Reserved Phase 2 Modules

- `src/modules/wishlists` for customer saved properties
- `src/modules/notifications` for in-app notification UI
- `src/modules/analytics` for owner/admin analytics UI
- `src/modules/chats` for customer-owner messaging UI
- `src/modules/reports` for report and dispute UI

## Module Rules

- Put feature-specific pages, components, api, and services inside `src/modules/<module>`.
- Put reusable UI only in `src/shared/components`.
- Put module endpoint wrappers in `src/modules/<module>/api`.
- Put low-level API/token helpers in shared/app service folders.
- Use `src/shared/constants/roles.js` for role checks.
- Add routes in the matching module route file, for example `src/modules/auth/routes.js`.
- Scaffold route files may export empty arrays until pages are ready.
- Keep API response handling consistent with `src/shared/services/api.js`.

## Empty File Policy

- Empty files are placeholders for planned work.
- Before implementing a placeholder, confirm module ownership with the team lead.
- Delete a placeholder only if the module is no longer part of the product.
- When a module becomes active, replace empty files with real implementation in the existing structure.
