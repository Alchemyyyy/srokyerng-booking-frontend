# Reports Module

Reserved for report and dispute UI.

Expected structure:

- `routes.js`
- `pages/`
- `components/`
- `api/`
- `services/`

Route ownership:

- Customer report routes should live under `/customer/reports`.
- Owner report routes should live under `/owner/reports`.
- Admin report management routes should live under `/admin/reports`.
- API endpoint wrappers should live in the module `api/` folder and use the shared HTTP client.
