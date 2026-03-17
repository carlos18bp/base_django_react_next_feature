import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WhatsAppButton from '../../app/components/WhatsAppButton';

vi.mock('motion/react', async () => (await import('../helpers/motion-mock')).motionMock);

describe('WhatsAppButton', () => {
  it('renders a link with WhatsApp URL', () => {
    render(<WhatsAppButton />);

    const link = screen.getByLabelText('Contáctanos por WhatsApp');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', expect.stringContaining('wa.me/573157766662'));
  });

  it('opens link in a new tab', () => {
    render(<WhatsAppButton />);

    const link = screen.getByLabelText('Contáctanos por WhatsApp');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders WhatsApp SVG icon', () => {
    render(<WhatsAppButton />);

    const svg = screen.getByTitle('WhatsApp');
    expect(svg).toBeInTheDocument();
    expect(svg.closest('svg')).toHaveAttribute('viewBox', '0 0 448 512');
  });
});
