import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import Footer from '../../app/components/Footer';

vi.mock('@/assets/logo-footer.webp', () => ({ default: 'logo-footer.webp' }));

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );
}

describe('Footer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the institution logo', () => {
    renderFooter();

    expect(screen.getByAltText('Corporación Fernando de Aragón')).toBeInTheDocument();
  });

  it('renders institution description text', () => {
    renderFooter();

    expect(screen.getByText(/Formación para el Trabajo/)).toBeInTheDocument();
  });

  it('renders NIT number', () => {
    renderFooter();

    expect(screen.getByText(/NIT: 900325626/)).toBeInTheDocument();
  });

  it('renders quick links section with expected links', () => {
    renderFooter();

    expect(screen.getByText('Enlaces Rápidos')).toBeInTheDocument();
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Programa de Inglés')).toBeInTheDocument();
    expect(screen.getByText('Todos los Programas')).toBeInTheDocument();
  });

  it('renders first 8 program short names', () => {
    renderFooter();

    expect(screen.getByText('Programas')).toBeInTheDocument();
    const programSection = screen.getByText('Programas').closest('div');
    const links = programSection?.querySelectorAll('a');
    expect(links?.length).toBe(8);
  });

  it('renders contact information', () => {
    renderFooter();

    expect(screen.getByText('Contáctenos')).toBeInTheDocument();
    expect(screen.getByText(/Pie de la Popa/)).toBeInTheDocument();
    expect(screen.getByText('(605) 656 0903')).toBeInTheDocument();
    expect(screen.getByText('info@fernandoaragon.edu.co')).toBeInTheDocument();
    expect(screen.getByText(/7:00 AM - 9:30 PM/)).toBeInTheDocument();
  });

  it('renders copyright with current year', () => {
    renderFooter();

    expect(screen.getByText(/© 2026/)).toBeInTheDocument();
  });

  it('renders privacy policy and terms links', () => {
    renderFooter();

    expect(screen.getByText('Política de Privacidad')).toBeInTheDocument();
    expect(screen.getByText('Términos de Servicio')).toBeInTheDocument();
  });
});
