import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CurriculumSection from '../../app/components/CurriculumSection';

vi.mock('motion/react', async () => (await import('../helpers/motion-mock')).motionMock);

describe('CurriculumSection', () => {
  it('returns null when slug has no matching curriculum', () => {
    const { container } = render(<CurriculumSection slug="nonexistent-slug" />);

    expect(container.innerHTML).toBe('');
  });

  it('renders section heading with total hours for a valid slug', () => {
    render(<CurriculumSection slug="auxiliar-primera-infancia" />);

    expect(screen.getByText('Plan de Estudios')).toBeInTheDocument();
    expect(screen.getByText(/1,200 horas/)).toBeInTheDocument();
  });

  it('renders basic and technical module columns', () => {
    render(<CurriculumSection slug="auxiliar-primera-infancia" />);

    expect(screen.getByText('Competencias Básicas')).toBeInTheDocument();
    expect(screen.getByText('Competencias Técnicas')).toBeInTheDocument();
  });

  it('renders individual basic module names with hours', () => {
    render(<CurriculumSection slug="auxiliar-primera-infancia" />);

    expect(screen.getByText('Etica y Valores')).toBeInTheDocument();
    const hourLabels = screen.getAllByText('50h');
    expect(hourLabels.length).toBeGreaterThanOrEqual(1);
  });

  it('renders individual technical module names', () => {
    render(<CurriculumSection slug="auxiliar-primera-infancia" />);

    expect(screen.getByText(/Orientar Acciones de Salud/)).toBeInTheDocument();
  });

  it('renders summary cards including practice hours when greater than zero', () => {
    render(<CurriculumSection slug="auxiliar-primera-infancia" />);

    expect(screen.getByText('Comp. Básicas')).toBeInTheDocument();
    expect(screen.getByText('Comp. Técnicas')).toBeInTheDocument();
    expect(screen.getByText('Práctica Laboral')).toBeInTheDocument();
    expect(screen.getByText('Total Programa')).toBeInTheDocument();
    const practiceLabels = screen.getAllByText('450h');
    expect(practiceLabels.length).toBeGreaterThanOrEqual(1);
  });

  it('renders practice highlight section when practiceHours is greater than zero', () => {
    render(<CurriculumSection slug="auxiliar-primera-infancia" />);

    expect(screen.getByText('Práctica Laboral Externa')).toBeInTheDocument();
    expect(screen.getByText('Experiencia real en empresas del sector')).toBeInTheDocument();
  });

  it('shows Integrada label when practiceHours is zero', () => {
    render(<CurriculumSection slug="operaciones-portuarias" />);

    expect(screen.getByText('Integrada')).toBeInTheDocument();
    expect(screen.queryByText('Práctica Laboral Externa')).not.toBeInTheDocument();
  });
});
