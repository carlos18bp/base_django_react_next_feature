import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';

vi.mock('motion/react', async () => (await import('../helpers/motion-mock')).motionMock);

vi.mock('@/assets/logo-navbar.webp', () => ({ default: 'logo-navbar.webp' }));
vi.mock('@/assets/logo-footer.webp', () => ({ default: 'logo-footer.webp' }));

import Layout from '../../app/components/Layout';

describe('Layout', () => {
  let scrollToSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollToSpy = vi.fn();
    vi.stubGlobal('scrollTo', scrollToSpy);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders Navbar, Footer, and WhatsAppButton', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<div data-testid="child-page">Home Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const logos = screen.getAllByAltText('Corporación Fernando de Aragón');
    expect(logos.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/Todos los derechos reservados/)).toBeInTheDocument();
    expect(screen.getByLabelText('Contáctanos por WhatsApp')).toBeInTheDocument();
  });

  it('renders child route content via Outlet', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<div data-testid="child-page">Home Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('child-page')).toBeInTheDocument();
    expect(screen.getByText('Home Content')).toBeInTheDocument();
  });

  it('calls window.scrollTo on mount', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<div>Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
  });
});
