import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

vi.mock('motion/react', async () => (await import('../helpers/motion-mock')).motionMock);

vi.mock('../../app/services/api', () => ({
  submitContactForm: vi.fn(),
}));

import Home from '../../app/pages/Home';

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
}

describe('Home', () => {
  it('renders the hero section with main heading', () => {
    renderHome();

    expect(screen.getByText(/Construye tu Futuro/)).toBeInTheDocument();
    expect(screen.getByText(/con Educación/)).toBeInTheDocument();
  });

  it('renders hero CTA buttons', () => {
    renderHome();

    expect(screen.getAllByText(/Programa de Inglés/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Ver Programas')).toBeInTheDocument();
  });

  it('renders stats section with stat labels', () => {
    renderHome();

    expect(screen.getByText('Programas Ofertados')).toBeInTheDocument();
    expect(screen.getByText('Egresados')).toBeInTheDocument();
    expect(screen.getByText('Tasa de Empleabilidad')).toBeInTheDocument();
    expect(screen.getByText('Años de Experiencia')).toBeInTheDocument();
  });

  it('renders about section', () => {
    renderHome();

    expect(screen.getByText('Sobre Nosotros')).toBeInTheDocument();
    expect(screen.getByText(/Corporación Fernando de Aragón es una institución/)).toBeInTheDocument();
  });

  it('renders featured English program section', () => {
    renderHome();

    expect(screen.getByText('Programa Destacado')).toBeInTheDocument();
    expect(screen.getByText(/Domina el inglés desde principiante/)).toBeInTheDocument();
  });

  it('renders MCER level badges A1 through C2', () => {
    renderHome();

    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.getByText('C2')).toBeInTheDocument();
  });

  it('renders programs grid section', () => {
    renderHome();

    expect(screen.getByText('Programas Profesionales')).toBeInTheDocument();
    expect(screen.getByText('Nuestra Oferta')).toBeInTheDocument();
  });

  it('renders featured program card with Destacado badge', () => {
    renderHome();

    expect(screen.getByText('Destacado')).toBeInTheDocument();
  });

  it('renders advantages section', () => {
    renderHome();

    expect(screen.getByText('Nuestras Ventajas')).toBeInTheDocument();
    expect(screen.getByText('Certificación Oficial')).toBeInTheDocument();
    expect(screen.getByText('Enfoque en Empleabilidad')).toBeInTheDocument();
    expect(screen.getAllByText('Horarios Flexibles').length).toBeGreaterThanOrEqual(1);
  });

  it('renders testimonials section', () => {
    renderHome();

    expect(screen.getByText('Historias de Éxito')).toBeInTheDocument();
    expect(screen.getByText('María López')).toBeInTheDocument();
    expect(screen.getByText('Carlos Mendoza')).toBeInTheDocument();
    expect(screen.getByText('Andrea Gutiérrez')).toBeInTheDocument();
  });

  it('renders contact form section with LeadForm', () => {
    renderHome();

    expect(screen.getByText('Comienza Hoy')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nombre Completo')).toBeInTheDocument();
  });

  it('renders CTA benefit items', () => {
    renderHome();

    expect(screen.getByText('Prueba de clasificación gratuita para inglés')).toBeInTheDocument();
    expect(screen.getByText('Planes de pago flexibles')).toBeInTheDocument();
  });
});
