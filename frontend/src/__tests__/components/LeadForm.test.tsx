import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LeadForm from '../../app/components/LeadForm';
import * as api from '../../app/services/api';

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...filterMotionProps(props)}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...filterMotionProps(props)}>{children}</button>,
  },
}));

function filterMotionProps(props: Record<string, any>) {
  const filtered: Record<string, any> = {};
  for (const [key, value] of Object.entries(props)) {
    if (!['initial', 'animate', 'exit', 'whileHover', 'whileTap', 'transition', 'variants'].includes(key)) {
      filtered[key] = value;
    }
  }
  return filtered;
}

vi.mock('../../app/services/api', () => ({
  submitContactForm: vi.fn(),
}));

describe('LeadForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields with light variant by default', () => {
    render(<LeadForm />);

    expect(screen.getByPlaceholderText('Nombre Completo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Correo Electrónico')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Número de Celular')).toBeInTheDocument();
    expect(screen.getByText('Selecciona un Programa')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /solicitar información/i })).toBeInTheDocument();
  });

  it('renders privacy notice text', () => {
    render(<LeadForm />);

    expect(screen.getByText(/política de privacidad/i)).toBeInTheDocument();
  });

  it('renders program options from programs data', () => {
    render(<LeadForm />);

    const select = screen.getByRole('combobox');
    const options = select.querySelectorAll('option');
    expect(options.length).toBeGreaterThan(1);
  });

  it('pre-selects program when preselectedProgram prop is provided', () => {
    render(<LeadForm preselectedProgram="Programa de Inglés" />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('Programa de Inglés');
  });

  it('updates form fields on user input', async () => {
    render(<LeadForm />);

    const nameInput = screen.getByPlaceholderText('Nombre Completo');
    const emailInput = screen.getByPlaceholderText('Correo Electrónico');
    const phoneInput = screen.getByPlaceholderText('Número de Celular');

    await user.type(nameInput, 'Juan Pérez');
    await user.type(emailInput, 'juan@example.com');
    await user.type(phoneInput, '3001234567');

    expect(nameInput).toHaveValue('Juan Pérez');
    expect(emailInput).toHaveValue('juan@example.com');
    expect(phoneInput).toHaveValue('3001234567');
  });

  it('shows success message after successful submission', async () => {
    vi.mocked(api.submitContactForm).mockResolvedValueOnce({ success: true });
    render(<LeadForm />);

    await user.type(screen.getByPlaceholderText('Nombre Completo'), 'Juan');
    await user.type(screen.getByPlaceholderText('Correo Electrónico'), 'j@e.com');
    await user.type(screen.getByPlaceholderText('Número de Celular'), '300');
    await user.selectOptions(screen.getByRole('combobox'), screen.getAllByRole('option')[1]);
    await user.click(screen.getByRole('button', { name: /solicitar información/i }));

    await waitFor(() => {
      expect(screen.getByText('¡Gracias por tu interés!')).toBeInTheDocument();
    });
  });

  it('shows API error message when result.success is false', async () => {
    vi.mocked(api.submitContactForm).mockResolvedValueOnce({
      success: false,
      detail: 'Correo inválido',
    });
    render(<LeadForm />);

    await user.type(screen.getByPlaceholderText('Nombre Completo'), 'Juan');
    await user.type(screen.getByPlaceholderText('Correo Electrónico'), 'j@e.com');
    await user.type(screen.getByPlaceholderText('Número de Celular'), '300');
    await user.selectOptions(screen.getByRole('combobox'), screen.getAllByRole('option')[1]);
    await user.click(screen.getByRole('button', { name: /solicitar información/i }));

    await waitFor(() => {
      expect(screen.getByText('Correo inválido')).toBeInTheDocument();
    });
  });

  it('shows default error when result.success is false with no detail', async () => {
    vi.mocked(api.submitContactForm).mockResolvedValueOnce({ success: false });
    render(<LeadForm />);

    await user.type(screen.getByPlaceholderText('Nombre Completo'), 'Juan');
    await user.type(screen.getByPlaceholderText('Correo Electrónico'), 'j@e.com');
    await user.type(screen.getByPlaceholderText('Número de Celular'), '300');
    await user.selectOptions(screen.getByRole('combobox'), screen.getAllByRole('option')[1]);
    await user.click(screen.getByRole('button', { name: /solicitar información/i }));

    await waitFor(() => {
      expect(screen.getByText('Error al enviar. Intenta de nuevo.')).toBeInTheDocument();
    });
  });

  it('shows connection error when fetch throws', async () => {
    vi.mocked(api.submitContactForm).mockRejectedValueOnce(new Error('Network error'));
    render(<LeadForm />);

    await user.type(screen.getByPlaceholderText('Nombre Completo'), 'Juan');
    await user.type(screen.getByPlaceholderText('Correo Electrónico'), 'j@e.com');
    await user.type(screen.getByPlaceholderText('Número de Celular'), '300');
    await user.selectOptions(screen.getByRole('combobox'), screen.getAllByRole('option')[1]);
    await user.click(screen.getByRole('button', { name: /solicitar información/i }));

    await waitFor(() => {
      expect(screen.getByText('Error de conexión. Intenta de nuevo.')).toBeInTheDocument();
    });
  });

  it('disables submit button while loading', async () => {
    let resolvePromise: (value: api.ApiResponse) => void;
    vi.mocked(api.submitContactForm).mockReturnValueOnce(
      new Promise((resolve) => { resolvePromise = resolve; })
    );
    render(<LeadForm />);

    await user.type(screen.getByPlaceholderText('Nombre Completo'), 'Juan');
    await user.type(screen.getByPlaceholderText('Correo Electrónico'), 'j@e.com');
    await user.type(screen.getByPlaceholderText('Número de Celular'), '300');
    await user.selectOptions(screen.getByRole('combobox'), screen.getAllByRole('option')[1]);
    await user.click(screen.getByRole('button', { name: /solicitar información/i }));

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('Enviando...')).toBeInTheDocument();

    resolvePromise!({ success: true });
    await waitFor(() => {
      expect(screen.getByText('¡Gracias por tu interés!')).toBeInTheDocument();
    });
  });

  it('applies dark variant styles to success message', async () => {
    vi.mocked(api.submitContactForm).mockResolvedValueOnce({ success: true });
    render(<LeadForm variant="dark" />);

    await user.type(screen.getByPlaceholderText('Nombre Completo'), 'Juan');
    await user.type(screen.getByPlaceholderText('Correo Electrónico'), 'j@e.com');
    await user.type(screen.getByPlaceholderText('Número de Celular'), '300');
    await user.selectOptions(screen.getByRole('combobox'), screen.getAllByRole('option')[1]);
    await user.click(screen.getByRole('button', { name: /solicitar información/i }));

    await waitFor(() => {
      const heading = screen.getByText('¡Gracias por tu interés!');
      expect(heading.className).toContain('text-white');
    });
  });
});
