# Modules

Each folder under `src/modules` owns one business area.

## Folder Pattern

- `pages`: route-level views
- `components`: feature-specific UI
- `services`: API calls for this module
- `store`: Pinia state for this module, only when the module needs shared state
- `routes.js`: routes owned by this module

## Current Scaffold

- `auth`: login, registration, session state
- `properties`: browsing and owner property management
- `rooms`: room setup, room detail, room inventory
- `reservations`: customer bookings and owner reservation tracking
- `payments`: payment upload, status display, verification support
- `reviews`: rating and review workflows
- `admin`: admin dashboard, approvals, monitoring
- `amenities`: amenity selection and management
- `static`: about, contact, privacy, terms, and other informational pages

Keep module-specific code inside its module. Promote code to `src/shared` only after at least two modules need it.
