import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';

vi.mock('motion/react', async () => (await import('../helpers/motion-mock')).motionMock);

vi.mock('../../app/services/api', () => ({
  submitContactForm: vi.fn(),
}));

import ProgramPage from '../../app/pages/ProgramPage';

function renderWithSlug(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/${slug}`]}>
      <Routes>
        <Route path="/:slug" element={<ProgramPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProgramPage', () => {
  it('renders program name and description for a valid slug', () => {
    renderWithSlug('auxiliar-primera-infancia');

    expect(screen.getAllByText('Auxiliar en Educación para la Primera Infancia').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Desarrolla conocimientos esenciales/)).toBeInTheDocument();
  });

  it('renders not-found message for an invalid slug', () => {
    renderWithSlug('programa-inexistente');

    expect(screen.getByText('Programa no encontrado')).toBeInTheDocument();
    expect(screen.getByText(/El programa que buscas no existe/)).toBeInTheDocument();
    expect(screen.getByText('Volver al Inicio')).toBeInTheDocument();
  });

  it('renders hero section with duration, location, and schedule', () => {
    renderWithSlug('auxiliar-primera-infancia');

    expect(screen.getByText('Presencial - Cartagena')).toBeInTheDocument();
    expect(screen.getByText('Máx. 25 estudiantes')).toBeInTheDocument();
  });

  it('renders objective section', () => {
    renderWithSlug('auxiliar-primera-infancia');

    expect(screen.getByText('Objetivo del Programa')).toBeInTheDocument();
    expect(screen.getByText('Sobre el Programa')).toBeInTheDocument();
  });

  it('renders profile and functions section', () => {
    renderWithSlug('auxiliar-primera-infancia');

    expect(screen.getByText('Perfil del Egresado')).toBeInTheDocument();
    expect(screen.getByText('¿Qué podrás hacer al graduarte?')).toBeInTheDocument();
  });

  it('renders job titles section', () => {
    renderWithSlug('auxiliar-primera-infancia');

    expect(screen.getByText('Oportunidades de Empleo')).toBeInTheDocument();
    expect(screen.getByText('Salidas Laborales')).toBeInTheDocument();
  });

  it('renders certification info', () => {
    renderWithSlug('auxiliar-primera-infancia');

    expect(screen.getByText('Título a obtener')).toBeInTheDocument();
    expect(screen.getByText(/Avalado por el Ministerio/)).toBeInTheDocument();
  });

  it('renders why-study section with reasons', () => {
    renderWithSlug('auxiliar-primera-infancia');

    expect(screen.getByText('Ventajas')).toBeInTheDocument();
  });

  it('renders related programs section', () => {
    renderWithSlug('auxiliar-primera-infancia');

    expect(screen.getByText('Otros Programas que te Pueden Interesar')).toBeInTheDocument();
  });

  it('renders CTA form section with dark variant lead form', () => {
    renderWithSlug('auxiliar-primera-infancia');

    expect(screen.getByText('Solicita Información')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nombre Completo')).toBeInTheDocument();
  });

  it('renders "Horas de Formación" label when duration includes horas', () => {
    renderWithSlug('auxiliar-primera-infancia');

    expect(screen.getByText(/Horas de/)).toBeInTheDocument();
  });

  it('renders "Programa Completo" label when duration does not include horas', () => {
    renderWithSlug('ingles');

    expect(screen.getByText((_content, element) => {
      const text = element?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      return text === 'Programa Completo';
    })).toBeInTheDocument();
  });

  it('renders CurriculumSection for valid slug', () => {
    renderWithSlug('auxiliar-primera-infancia');

    expect(screen.getByText('Plan de Estudios')).toBeInTheDocument();
  });
});
