# Analytics Module

Reserved for owner and admin analytics UI.

Expected structure:

- `routes.js`
- `pages/`
- `components/`
- `api/`
- `services/`

Route ownership:

- Owner analytics should live under `/owner/analytics`.
- Admin analytics should live under `/admin/analytics`.
- Keep shared chart/card components reusable across owner and admin analytics pages.
- API endpoint wrappers should live in the module `api/` folder and use the shared HTTP client.
