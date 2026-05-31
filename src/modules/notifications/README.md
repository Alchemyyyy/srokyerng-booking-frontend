# Notifications Module

Reserved for customer, owner, and admin notifications.

Expected structure:

- `routes.js`
- `pages/`
- `components/`
- `api/`
- `services/`

Route ownership:

- Notification pages may live under `/customer/notifications`, `/owner/notifications`, and `/admin/notifications`.
- Shared notification components should remain reusable across layouts.
- API endpoint wrappers should live in the module `api/` folder and use the shared HTTP client.
