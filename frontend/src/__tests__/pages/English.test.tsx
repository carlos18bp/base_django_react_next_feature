import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

vi.mock('motion/react', async () => (await import('../helpers/motion-mock')).motionMock);

vi.mock('../../app/services/api', () => ({
  submitContactForm: vi.fn(),
}));

import English from '../../app/pages/English';

function renderEnglish() {
  return render(
    <MemoryRouter>
      <English />
    </MemoryRouter>
  );
}

describe('English', () => {
  it('renders the hero heading', () => {
    renderEnglish();

    expect(screen.getByText(/Domina el Inglés/)).toBeInTheDocument();
    expect(screen.getByText(/Abre las Puertas al Mundo/)).toBeInTheDocument();
  });

  it('renders hero CTA buttons', () => {
    renderEnglish();

    expect(screen.getAllByText(/Inscríbete Ahora/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Ver Niveles')).toBeInTheDocument();
  });

  it('renders hero feature badges', () => {
    renderEnglish();

    expect(screen.getByText('4-10 hrs/semana')).toBeInTheDocument();
    expect(screen.getAllByText('Certificación MCER').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Grupos Reducidos').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the four skills section', () => {
    renderEnglish();

    expect(screen.getByText('Speaking')).toBeInTheDocument();
    expect(screen.getByText('Listening')).toBeInTheDocument();
    expect(screen.getByText('Reading')).toBeInTheDocument();
    expect(screen.getByText('Writing')).toBeInTheDocument();
  });

  it('renders all six MCER levels', () => {
    renderEnglish();

    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.getByText('A2')).toBeInTheDocument();
    expect(screen.getByText('B1')).toBeInTheDocument();
    expect(screen.getByText('B2')).toBeInTheDocument();
    expect(screen.getByText('C1')).toBeInTheDocument();
    expect(screen.getByText('C2')).toBeInTheDocument();
  });

  it('renders level names and descriptions', () => {
    renderEnglish();

    expect(screen.getByText('Principiante')).toBeInTheDocument();
    expect(screen.getByText('Maestría')).toBeInTheDocument();
  });

  it('renders FAQ section with questions', () => {
    renderEnglish();

    expect(screen.getByText('¿Quién puede inscribirse en el programa de inglés?')).toBeInTheDocument();
    expect(screen.getByText('¿Recibo certificación oficial?')).toBeInTheDocument();
  });

  it('toggles FAQ answer visibility on click', async () => {
    const user = userEvent.setup();
    renderEnglish();

    const faqButton = screen.getByText('¿Quién puede inscribirse en el programa de inglés?');
    const answer = screen.getByText(/Cualquier persona desde los 6 años/);

    expect(answer.closest('div[class*="overflow-hidden"]')).toBeTruthy();

    await user.click(faqButton);

    expect(screen.getByText(/Cualquier persona desde los 6 años/)).toBeInTheDocument();
  });

  it('renders contact form section', () => {
    renderEnglish();

    expect(screen.getByPlaceholderText('Nombre Completo')).toBeInTheDocument();
  });

  it('renders audience section for professionals, students, and companies', () => {
    renderEnglish();

    expect(screen.getByText('Profesionales')).toBeInTheDocument();
    expect(screen.getByText('Estudiantes')).toBeInTheDocument();
    expect(screen.getByText('Empresas (B2B)')).toBeInTheDocument();
  });
});
