# Frontend Rules — Next.js / React / TypeScript

## Next.js / React / TypeScript Development

You are an expert in TypeScript, Node.js, Next.js App Router, React, Shadcn UI, Radix UI, and Tailwind.

### Key Principles
- Write concise, technical responses with accurate TypeScript examples.
- Use functional, declarative programming. Avoid classes.
- Prefer iteration and modularization over duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading).
- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for components.
- Use the Receive an Object, Return an Object (RORO) pattern.

### JavaScript/TypeScript
- Use "function" keyword for pure functions. Omit semicolons.
- Use TypeScript for all code. Prefer interfaces over types. Avoid enums, use maps.
- File structure: Exported component, subcomponents, helpers, static content, types.
- Avoid unnecessary curly braces in conditional statements.
- Use concise, one-line syntax for simple conditional statements.

### Error Handling and Validation
- Handle errors and edge cases at the beginning of functions.
- Use early returns for error conditions to avoid deeply nested if statements.
- Place the happy path last in the function for improved readability.
- Use guard clauses to handle preconditions and invalid states early.
- Implement proper error logging and user-friendly error messages.
- Consider using custom error types or error factories for consistent error handling.

### React/Next.js
- Use functional components and TypeScript interfaces.
- Use declarative JSX.
- Use function, not const, for components.
- Use Shadcn UI, Radix, and Tailwind for components and styling.
- Implement responsive design with Tailwind CSS; mobile-first approach.
- Place static content and interfaces at file end.
- Minimize 'use client', 'useEffect', and 'setState'. Favor RSC (React Server Components).
- Use Zod for form validation.
- Wrap client components in Suspense with fallback.
- Use dynamic loading for non-critical components.
- Optimize images: WebP format, size data, lazy loading.
- Model expected errors as return values in Server Actions.
- Use error boundaries (error.tsx, global-error.tsx) for unexpected errors.

### Key Conventions
1. Rely on Next.js App Router for state changes.
2. Prioritize Web Vitals (LCP, CLS, FID).
3. Minimize 'use client' usage — prefer server components and Next.js SSR features.

---

## Tailwind CSS Rules

### Class Ordering
Follow consistent order: layout → position → spacing → sizing → typography → visual → interactive

```html
<!-- Correct order -->
<div class="flex items-center justify-between gap-4 px-6 py-4 w-full text-sm font-medium text-gray-900 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
```

### Responsive Design
Always mobile-first. Breakpoint order: `sm:` → `md:` → `lg:` → `xl:` → `2xl:`

### Dark Mode
Use `dark:` variant consistently. Define color pairs for every visible element.

### Conditional Classes (React)
```tsx
import { cn } from '@/lib/utils'

<button className={cn(
  "px-4 py-2 rounded-lg font-medium transition-colors",
  variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700",
  variant === "ghost" && "bg-transparent hover:bg-gray-100",
  disabled && "opacity-50 cursor-not-allowed"
)}>
```

### @apply Usage
Use `@apply` ONLY for base component styles that repeat 5+ times. Prefer utility classes inline.

### Avoid These Patterns
- Never use `style=""` when a Tailwind class exists
- Never mix Tailwind with separate CSS files for the same component
- Never hardcode pixel values (`w-[347px]`) — use design tokens
- Avoid `!important` via `!` prefix unless overriding third-party styles
- Keep arbitrary values to a minimum — define in config instead

---

## Jest & Testing Library Rules

### Test File Structure
Use `.test.ts(x)` extension for React/Next projects.

### Test Anatomy
Follow Arrange → Act → Assert pattern. One concept per test.

### Naming Conventions
```typescript
describe('LoginForm', () => {
  it('should show validation error when email is empty')
  it('should call onSubmit with form data when valid')
  it('should disable button while submitting')
})
```

### Testing Library: Query Priority
```typescript
screen.getByRole('button', { name: /submit/i })   // 1st: Role
screen.getByLabelText('Email')                      // 2nd: Label
screen.getByPlaceholderText('Enter email')          // 3rd: Placeholder
screen.getByText('Submit')                          // 4th: Text
screen.getByTestId('submit-btn')                    // Last resort
```

### React Testing
```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('SearchBar', () => {
  it('should call onSearch after user types and submits', async () => {
    const user = userEvent.setup()
    const onSearch = jest.fn()

    render(<SearchBar onSearch={onSearch} />)

    await user.type(screen.getByRole('searchbox'), 'django rest')
    await user.click(screen.getByRole('button', { name: /search/i }))

    expect(onSearch).toHaveBeenCalledWith('django rest')
  })
})
```

Always use `userEvent` over `fireEvent`.

### Mocking
- Mock modules: `jest.mock('@/services/api', () => ({ fetchUsers: jest.fn() }))`
- MSW preferred over manual mocks for integration tests
- Do NOT mock: implementation details, the component under test, standard library functions

### Async Testing
```typescript
const userName = await screen.findByText('Ana')
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
// Never use arbitrary timeouts
```

### Test Data — Use factories
```typescript
const createUser = (overrides = {}) => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  ...overrides,
})
```

### What to Test / What NOT to Test
**Test**: User-visible behavior, props → output, events → state changes, error states, loading states, form validation
**Do NOT test**: Implementation details, CSS class names, third-party internals, exact HTML structure

### Anti-Patterns to Avoid
- Testing implementation details instead of behavior
- Snapshot tests as primary strategy
- Tests that pass when the feature is broken
- `act()` warnings — usually means not awaiting async properly

---

## Playwright E2E Testing Rules

You are a Senior QA Automation Engineer expert in TypeScript, JavaScript, and Playwright.

- Use descriptive test names that clearly describe expected behavior.
- Utilize Playwright fixtures (`test`, `page`, `expect`) for test isolation.
- Use `test.beforeEach` and `test.afterEach` for setup and teardown.
- Keep tests DRY by extracting reusable logic into helper functions.
- Always use role-based locators (`page.getByRole`, `page.getByLabel`, `page.getByText`) over complex selectors.
- Use `page.getByTestId` whenever `data-testid` is defined.
- Use web-first assertions (`toBeVisible`, `toHaveText`, etc.).
- Avoid hardcoded timeouts — use `page.waitFor` with specific conditions.
- Ensure tests run reliably in parallel without shared state conflicts.

---

## i18n Rules — Next.js (with next-intl)

### Core Principle
NEVER hardcode user-facing strings. Every text must go through the translation system.

### Setup
```typescript
// messages/es.json
{
  "common": { "addToCart": "Agregar al carrito", "search": "Buscar" },
  "products": { "title": "Nuestros Productos", "empty": "No se encontraron productos" }
}
```

### Usage in Components
```typescript
import { useTranslations } from 'next-intl'

export default function ProductsPage() {
  const t = useTranslations('products')
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('price', { price: product.price })}</p>
    </div>
  )
}
```

### Routing
```
app/[locale]/layout.tsx    ← wraps with NextIntlClientProvider
app/[locale]/page.tsx      ← home per locale
app/[locale]/products/page.tsx
```

### Rules
- Every user-facing string must be translatable
- Translation keys use dot notation by feature
- Never concatenate translated strings — use variables
- Dates, numbers, currencies use Intl API
- Lazy load translation files to reduce bundle size

---

## SEO Rules — Next.js

### Meta Tags (App Router)
```typescript
import { Metadata } from 'next'

export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.id)
  return {
    title: `${product.name} | Mi Tienda`,
    description: product.description.slice(0, 155),
    alternates: { canonical: `https://example.com/products/${params.id}` },
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 155),
      images: [{ url: product.image, width: 1200, height: 630 }],
    },
  }
}
```

### Title Pattern
- Max 60 characters, primary keyword first, brand last
- Use `|` or `—` as separator, be consistent
- Every page has a UNIQUE title

### SSR vs SSG Decision
```typescript
export const dynamic = 'force-static'   // SSG
export const dynamic = 'force-dynamic'  // SSR
export const revalidate = 3600          // ISR
```

### Images
- Always include `alt` text
- Use Next.js `<Image>` for automatic optimization
- Use WebP/AVIF formats
- Set explicit `width` and `height` to prevent layout shift

### Sitemap
```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { ... }
```

### Structured Data (JSON-LD)
```typescript
const jsonLd = { '@context': 'https://schema.org', '@type': 'Product', ... }
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
```

---

## Testing Quality Standards

Full reference: `docs/TESTING_QUALITY_STANDARDS.md`

### Mandatory Rules
- Each test verifies **ONE specific behavior**
- **No conjunctions** in test names
- JS naming: `it('verb phrase describing behavior', ...)`
- Assert **observable outcomes** — never implementation details
- **No conditionals** in test body — use parameterization
- Follow **AAA pattern**: Arrange → Act → Assert

### Determinism
- Never use `Date.now()`, `new Date()`, `Math.random()` without control
- Use `jest.useFakeTimers()` + `jest.setSystemTime()`, always restore

### Frontend-Specific
- **Stable selectors**: `[data-testid="..."]` — never `.find('.class')`
- **One render per test** unless testing re-render
- Timer restoration mandatory

### E2E-Specific (Playwright)
- **Selector hierarchy**: `getByRole` > `getByTestId` > `locator`
- **No `waitForTimeout()`** — use `toBeVisible()`, `waitForResponse()`, `waitForURL()`
- **No hardcoded test data** — use fixtures or generated data
- Every E2E test must have `@flow:<flow-id>` tag

### Coverage Targets

| Layer | Minimum |
|-------|---------|
| Frontend Stores | 75% |
| Frontend Components | 60% |
| Utils | 90% |
| E2E | Critical paths |

---

## Coverage Report Standard

Full reference: `docs/BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md`

| Coverage % | Meaning |
|------------|---------|
| > 80% | Good |
| 50-80% | Needs improvement |
| < 50% | Critical |

---

## E2E Flow Coverage Standard

Full reference: `docs/E2E_FLOW_COVERAGE_REPORT_STANDARD.md`

### Key Files
```
frontend/e2e/flow-definitions.json           # Source of truth
e2e-results/flow-coverage.json               # Auto-generated
```

### Tagging
```javascript
test('user signs in with email', {
  tag: ['@flow:auth-login-email'],
}, async ({ page }) => { /* ... */ });
```

### Status: missing | failing | covered | partial
