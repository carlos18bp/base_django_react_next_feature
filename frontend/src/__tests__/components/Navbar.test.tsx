import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router';

vi.mock('motion/react', () => ({
  motion: {
    nav: ({ children, ...props }: any) => <nav {...filterMotionProps(props)}>{children}</nav>,
    div: ({ children, ...props }: any) => <div {...filterMotionProps(props)}>{children}</div>,
    a: ({ children, ...props }: any) => <a {...filterMotionProps(props)}>{children}</a>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('@/assets/logo-navbar.webp', () => ({ default: 'logo-navbar.webp' }));

function filterMotionProps(props: Record<string, any>) {
  const filtered: Record<string, any> = {};
  for (const [key, value] of Object.entries(props)) {
    if (!['initial', 'animate', 'exit', 'whileHover', 'whileTap', 'transition', 'variants'].includes(key)) {
      filtered[key] = value;
    }
  }
  return filtered;
}

import Navbar from '../../app/components/Navbar';

function renderNavbar(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Navbar />
    </MemoryRouter>
  );
}

describe('Navbar', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.stubGlobal('scrollY', 0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders logo image with correct alt text', () => {
    renderNavbar();

    expect(screen.getByAltText('Corporación Fernando de Aragón')).toBeInTheDocument();
  });

  it('renders desktop navigation links', () => {
    renderNavbar();

    expect(screen.getAllByText('Inicio').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/inglés/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Programas').length).toBeGreaterThanOrEqual(1);
  });

  it('renders CTA button with correct text', () => {
    renderNavbar();

    expect(screen.getAllByText('Inscríbete Ahora').length).toBeGreaterThanOrEqual(1);
  });

  it('renders top bar with phone numbers and address', () => {
    renderNavbar();

    expect(screen.getByText('(605) 656 0903')).toBeInTheDocument();
    expect(screen.getByText('315 776 6662')).toBeInTheDocument();
    expect(screen.getByText(/Pie de la Popa/)).toBeInTheDocument();
  });

  it('toggles mobile menu when hamburger button is clicked', async () => {
    renderNavbar();

    const mobileToggle = screen.getByRole('button', { name: '' });
    await user.click(mobileToggle);

    expect(screen.getByText('Programa de Inglés')).toBeInTheDocument();
    expect(screen.getByText('Programas Técnicos')).toBeInTheDocument();
  });

  it('toggles desktop programs dropdown when Programas is clicked', async () => {
    renderNavbar();

    const programasButtons = screen.getAllByText('Programas');
    const desktopButton = programasButtons.find(el => el.tagName === 'BUTTON')!;
    await user.click(desktopButton);

    const shortNames = screen.getAllByText(/Primera Infancia|Tribunales|Administrativo/);
    expect(shortNames.length).toBeGreaterThan(0);
  });

  it('closes desktop dropdown when clicking outside', async () => {
    renderNavbar();

    const programasButtons = screen.getAllByText('Programas');
    const desktopButton = programasButtons.find(el => el.tagName === 'BUTTON')!;
    await user.click(desktopButton);

    expect(screen.getAllByText(/Primera Infancia/).length).toBeGreaterThan(0);

    fireEvent.mouseDown(document.body);

    const dropdownItems = screen.queryAllByText(/Primera Infancia/);
    expect(dropdownItems.length).toBe(0);
  });

  it('toggles mobile programs accordion when clicked', async () => {
    renderNavbar();

    const mobileToggle = screen.getByRole('button', { name: '' });
    await user.click(mobileToggle);

    const mobileProgramsButton = screen.getByText('Programas Técnicos');
    await user.click(mobileProgramsButton);

    const programLinks = screen.getAllByText(/Primera Infancia|Tribunales/);
    expect(programLinks.length).toBeGreaterThan(0);
  });

  it('sets scrolled state when window scrolls past threshold', () => {
    renderNavbar();

    const nav = document.querySelector('nav');
    expect(nav?.className).toContain('bg-white');

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 50, writable: true });
      fireEvent.scroll(window);
    });

    expect(nav?.className).toContain('backdrop-blur');
  });

  it('renders contact link pointing to WhatsApp', () => {
    renderNavbar();

    const contactLinks = screen.getAllByText('Contacto');
    const whatsappLink = contactLinks.find(el => el.closest('a')?.href?.includes('wa.me'));
    expect(whatsappLink).toBeTruthy();
  });
});
