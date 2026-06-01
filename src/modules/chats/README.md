# Chats Module

Reserved for customer-owner in-app chat.

Expected structure:

- `routes.js`
- `pages/`
- `components/`
- `api/`
- `services/`

Route ownership:

- Customer chat routes should live under `/customer/chats`.
- Owner chat routes should live under `/owner/chats`.
- Chat entry buttons may be used from property and reservation pages.
- API endpoint wrappers should live in the module `api/` folder and use the shared HTTP client.
