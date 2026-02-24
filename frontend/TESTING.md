# Frontend Testing Guide

This guide covers the **unit testing** strategy, tools, and commands for the frontend project.
For E2E tests, see [`e2e/README.md`](./e2e/README.md).

---

## Table of Contents

1. [Testing Tools](#testing-tools)
2. [Test Structure](#test-structure)
3. [Unit Tests](#unit-tests)
4. [E2E Tests](#e2e-tests)
5. [Code Coverage](#code-coverage)
6. [Available Commands](#available-commands)
7. [Best Practices](#best-practices)

---

## Testing Tools

### Jest + Testing Library
- **Purpose:** Unit and integration tests for components, stores, hooks, and services
- **Framework:** Jest with React Testing Library
- **Configuration:** `jest.config.cjs`, `jest.setup.ts`

### Playwright
- **Purpose:** End-to-End (E2E) tests — see [`e2e/README.md`](./e2e/README.md)
- **Configuration:** `playwright.config.ts`
- **Projects:** Desktop Chrome, Mobile Chrome (Pixel 5), Tablet (iPad Mini / Chromium)

---

## Test Structure

Unit tests live alongside source files inside `__tests__/` subdirectories:

```
frontend/
├── app/
│   ├── __tests__/                 # App-level tests
│   ├── sign-in/__tests__/
│   ├── sign-up/__tests__/
│   ├── forgot-password/__tests__/
│   ├── dashboard/__tests__/
│   ├── backoffice/__tests__/
│   ├── catalog/__tests__/
│   ├── checkout/__tests__/
│   ├── blogs/__tests__/
│   ├── blogs/[blogId]/__tests__/
│   └── products/[productId]/__tests__/
├── components/
│   ├── blog/__tests__/
│   ├── product/__tests__/
│   └── layout/__tests__/
├── lib/
│   ├── __tests__/                 # Fixtures/constants
│   ├── hooks/__tests__/
│   ├── i18n/__tests__/
│   ├── services/__tests__/
│   └── stores/__tests__/
└── e2e/                           # Playwright E2E tests → see e2e/README.md
```

---

## Unit Tests

### Stores (Zustand)

Store tests verify application state logic:

**Example: Cart Store**
```typescript
// lib/stores/__tests__/cartStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCartStore } from '../cartStore';

test('should add product to cart', () => {
  const { result } = renderHook(() => useCartStore());
  act(() => {
    result.current.addToCart(mockProduct, 1);
  });
  expect(result.current.items).toHaveLength(1);
});
```

**Store Coverage:**
- ✅ `authStore.test.ts` - Authentication state (sign-in, sign-out, token handling)
- ✅ `blogStore.test.ts` - Blog management (fetch, loading/error states)
- ✅ `cartStore.test.ts` - Shopping cart (add, remove, update quantity, subtotal)
- ✅ `localeStore.test.ts` - Locale selection and persistence
- ✅ `productStore.test.ts` - Product management (fetch, loading/error states)

### Components

Component tests verify rendering and interaction:

**Example: Product Card**
```typescript
// components/product/__tests__/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import ProductCard from '../ProductCard';

test('should render product title', () => {
  render(<ProductCard product={mockProduct} />);
  expect(screen.getByText(mockProduct.title)).toBeInTheDocument();
});
```

**Component Coverage:**
- ✅ `ProductCard.test.tsx` - Product card
- ✅ `ProductCarousel.test.tsx` - Product carousel
- ✅ `BlogCard.test.tsx` - Blog card
- ✅ `BlogCarousel.test.tsx` - Blog carousel
- ✅ `layout.test.tsx` - Header/footer layout

### Hooks, Services, and i18n

- ✅ `useRequireAuth.test.ts` - Auth guard hook
- ✅ `http.test.ts` / `tokens.test.ts` - API client and token helpers
- ✅ `config.test.ts` - i18n config
- ✅ `constants.test.ts` - Shared constants

### Fixtures

```typescript
// lib/__tests__/fixtures.ts
export const mockProducts: Product[] = [/* ... */];
export const mockBlogs: Blog[] = [/* ... */];
export const mockCartItems: CartItem[] = [/* ... */];
```

---

## E2E Tests

E2E tests are maintained in `e2e/` and documented separately.

**→ See [`e2e/README.md`](./e2e/README.md)** for structure, commands, Flow Coverage system, helpers, and flow definitions.

Quick commands:

```bash
npm run e2e               # Run all E2E tests
npm run test:e2e:ui       # Interactive Playwright UI
npm run test:e2e:debug    # Debug mode
```

---

## Code Coverage

### Coverage Configuration

```javascript
// jest.config.cjs
collectCoverageFrom: [
  'app/**/*.{ts,tsx}',
  'components/**/*.{ts,tsx}',
  'lib/**/*.{ts,tsx}',
  '!**/*.d.ts',
  '!**/node_modules/**',
  '!**/__tests__/**',
  '!**/e2e/**',
  '!app/layout.tsx',
  '!app/globals.css',
],
coverageThreshold: {
  global: {
    branches: 50,
    functions: 50,
    lines: 50,
    statements: 50,
  },
},
coverageReporters: ['text-summary', 'text', 'lcov', 'html', 'json-summary'],
```

### Coverage Reports

- **Terminal** - `text-summary` and `text` reporters
- **LCOV** - For CI/CD integration
- **HTML** - Visual report at `coverage/lcov-report/index.html`
- **JSON summary** - `coverage/coverage-summary.json`

---

## Available Commands

### Unit Tests

```bash
npm run test              # Run all unit tests
npm run test:watch        # Watch mode (development)
npm run test:ci           # CI mode (no interaction)
npm run test:coverage     # Generate coverage report
```

### All Tests

```bash
npm run test:all          # Unit coverage + E2E
```

### Global Test Runners (Backend + Frontend)

To run all suites (backend pytest + frontend unit + E2E) from the repo root:

```bash
# Sequential (default)
python3 scripts/run-tests-all-suites.py

# Parallel mode
python3 scripts/run-tests-all-suites.py --parallel
```

---

## Best Practices

1. **Use reusable fixtures**
   ```typescript
   import { mockProducts } from '@/lib/__tests__/fixtures';
   ```

2. **Mock external dependencies**
   ```typescript
   jest.mock('@/lib/services/http');
   ```

3. **Clean state between tests**
   ```typescript
   beforeEach(() => {
     const { result } = renderHook(() => useCartStore());
     act(() => result.current.clearCart());
   });
   ```

4. **Use `waitFor` for async operations**
   ```typescript
   await waitFor(() => {
     expect(result.current.loading).toBe(false);
   });
   ```

---

## Recommended Workflow

### During Development

```bash
npm run test:watch        # Watch mode
```

### Before Commit

```bash
npm run test              # All unit tests
npm run test:coverage     # Verify coverage
```

### Before Release

```bash
npm run test:all          # Unit + E2E
npm run test:ci           # CI mode verification
```

---

## Debugging

```bash
# With VSCode: add breakpoint, then run
node --inspect-brk node_modules/.bin/jest --runInBand

# Specific test file
npm run test -- ProductCard.test.tsx

# Verbose output
npm run test -- --verbose
```

---

## Quality Metrics

### Coverage Goals

- **Lines:** ≥ 50%
- **Functions:** ≥ 50%
- **Branches:** ≥ 50%
- **Statements:** ≥ 50%

---

## Maintenance

### Update Fixtures

When types or data structure change:

```typescript
// lib/__tests__/fixtures.ts
export const mockProducts: Product[] = [
  // Update according to new fields
];
```

### Add New Tests

1. Create file in corresponding `__tests__/` folder
2. Import necessary fixtures
3. Write test cases covering happy path, edge cases, and error conditions
4. Run and verify

---

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [E2E Tests Guide](./e2e/README.md)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Contributing

When adding new features:

1. ✅ Write unit tests for components and stores
2. ✅ Add E2E tests for user flows (see [`e2e/README.md`](./e2e/README.md))
3. ✅ Maintain coverage above threshold (50%)
4. ✅ Update this documentation if necessary
5. ✅ Verify all tests pass before PR

---

**Last updated:** February 2026
