# Reflection

This project focuses on practical CRM workflows for a small sales team: fast lead entry, pipeline visibility, and lightweight notes.

Key implementation choices:
- Chose `Next.js` for a fast single-page dashboard and form-heavy UI with minimal setup.
- Chose `Express` + `MongoDB` for straightforward REST APIs and flexible document modeling.
- Used JWT authentication with a seeded test account for simple but real auth flow.
- Added integration tests for backend flows and a frontend rendering test as a quality baseline.

If I had more time:
- Add role-based permissions and multiple users.
- Add pagination and optimistic UI updates for better scalability.
- Add richer analytics (conversion rate by source, stage aging, salesperson performance).
