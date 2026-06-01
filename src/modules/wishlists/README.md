# Wishlists Module

Reserved for customer saved properties.

Expected structure:

- `routes.js`
- `pages/`
- `components/`
- `api/`
- `services/`

Route ownership:

- Customer wishlist page should live under `/customer/wishlist`.
- Wishlist buttons can be reused from property cards and property detail pages.
- API endpoint wrappers should live in the module `api/` folder and use the shared HTTP client.
- Do not wire unfinished pages into the main router unless they point to a safe placeholder.
