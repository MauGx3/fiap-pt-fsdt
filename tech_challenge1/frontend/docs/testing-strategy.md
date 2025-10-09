# Frontend Testing Strategy

## Stack Overview

- **Test runner:** [Vitest](https://vitest.dev/) powered by Vite for fast, ESM-native test execution.
- **DOM testing:** [Testing Library](https://testing-library.com/docs/react-testing-library/intro/) to write user-focused unit and integration tests.
- **Network mocking:** [`axios-mock-adapter`](https://github.com/ctimmerm/axios-mock-adapter) to isolate logic built on Axios API clients without replacing the underlying implementation.
- **Styling support:** CSS Modules are loaded natively through Vite; the shared `renderWithProviders` helper wires up the `ThemeProvider` and `MemoryRouter` so UI components behave exactly as the app.
- **Toast notifications:** `react-hot-toast` is mocked in `src/tests/setup.ts` to keep tests deterministic while still allowing assertions on success/error feedback.

All tests live under `src/tests`, mirroring the directory layout of `src` for quick discoverability.

## Running the Suite

```fish
cd tech_challenge1/frontend
npm install
npm run test              # single pass
npm run test:watch        # watch mode
npm run test:coverage     # v8 coverage reports in coverage/
```

The coverage report opens at `coverage/index.html` and must remain above agreed-upon thresholds (set in `vite.config.ts`).

## Authoring Tests Today

1. **Prefer behaviour over implementation:** query by accessible roles/text (`getByRole`, `findByText`) instead of class names.
2. **Use `renderWithProviders`:** wrap new UI in the shared helper to inherit theming, routing, and future global context.
3. **Mock only the boundary:** components that call Axios should import their real API modules; in tests, mock the API layer, not the HTTP client, unless the goal is to validate interceptors (covered in `src/tests/api`).
4. **Assert side effects:** check localStorage writes, toast messages, and router navigation when those are part of the feature contract.
5. **Keep fixtures close:** reuse the `fixtures` object pattern shown in `Main` and `UserProfile` tests to document real-world payloads.

## Roadmap for Future Pages & Modules

As the application grows with dashboards, settings, or admin views, expand the suite following this plan:

### 1. Page-Level Scenarios

- Build *happy path* integration tests for each new route using `<App />` or dedicated layout components to verify routing, guards, and 404 fallbacks.
- When a page orchestrates multiple API modules, write contract tests that mock Axios responses once and assert all widgets update together.
- Capture regression scenarios (loading spinners, permission errors, empty states) so UI contracts stay stable even when the backend evolves.

### 2. API Clients & Axios Interceptors

- Add companion specs under `src/tests/api/<module>.test.ts` for any new API namespace. Leverage `axios-mock-adapter` to prove headers, retry logic, caching, and optimistic updates remain intact.
- Document each endpoint’s expected payload in the test to serve as living examples for other teams.

### 3. Shared Hooks & Utilities

- Place hook tests under `src/tests/hooks`. Combine `renderHook` with the `ThemeProvider`/future providers to keep behaviour realistic.
- For utilities manipulating time or storage, prefer deterministic `vi.useFakeTimers()`/`vi.spyOn` patterns.

### 4. Visual & Accessibility Guards

- Introduce [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) matchers (already configured) to assert contrast helpers, aria attributes, and focus management.
- Consider snapshot tests only for design-system primitives with strict review.

### 5. End-to-End Bridge (Future)

- Once Vite pages are deployed, layer Playwright/Cypress smoke tests that reuse the same Axios mocks for offline mode while still exercising the bundled app.
- Maintain a contract list in this document tracking which flows are covered by unit/integration/e2e to avoid duplication.

## Contribution Checklist

- [ ] Co-locate the test file next to the feature domain (`src/tests/components/MyFeature.test.tsx`).
- [ ] Mock Axios at the API boundary, reset mocks in `beforeEach`, and clear toast/router spies.
- [ ] Cover at least: success path, one failure path, and any significant conditional branches (empty state, permissions, feature flags).
- [ ] Update this document when introducing a new provider, layout wrapper, or global mock so future contributors stay aligned.

Keeping this checklist in pull requests will ensure the suite evolves alongside new pages and modules without losing the guarantees we have today.
