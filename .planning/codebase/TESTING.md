# Testing

## Framework & Assertions
- No explicit testing frameworks (Jest, Vitest, Cypress) are present in the `package.json`.

## Coverage
- Zero unit or end-to-end tests present in the current setup.
- App relies entirely on manual testing and development server feedback.

## Next Steps for Testing
- Recommend introducing `Vitest` and `@testing-library/react` for component testing.
- The `lib/` utilities (especially Gemini integration and Audio recorders) require heavy mocking or dedicated integration tests.
