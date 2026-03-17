import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ImageWithFallback } from '../../app/components/figma/ImageWithFallback';

describe('ImageWithFallback', () => {
  it('renders an img element with provided src and alt', () => {
    render(
      <ImageWithFallback
        src="https://example.com/photo.jpg"
        alt="Test photo"
        data-testid="test-img"
      />
    );

    const img = screen.getByTestId('test-img') as HTMLImageElement;
    expect(img.tagName).toBe('IMG');
    expect(img.src).toBe('https://example.com/photo.jpg');
    expect(img.alt).toBe('Test photo');
  });

  it('passes className and style props to the img element', () => {
    render(
      <ImageWithFallback
        src="https://example.com/photo.jpg"
        alt="Styled"
        className="custom-class"
        style={{ width: '100px' }}
        data-testid="styled-img"
      />
    );

    const img = screen.getByTestId('styled-img');
    expect(img.className).toContain('custom-class');
    expect(img.style.width).toBe('100px');
  });

  it('shows fallback container with error image when onError fires', () => {
    render(
      <ImageWithFallback
        src="https://example.com/broken.jpg"
        alt="Broken"
        className="original-class"
        data-testid="fallback-img"
      />
    );

    const img = screen.getByAltText('Broken');
    fireEvent.error(img);

    const fallbackImg = screen.getByAltText('Error loading image') as HTMLImageElement;
    expect(fallbackImg).toBeInTheDocument();
    expect(fallbackImg.dataset.originalUrl).toBe('https://example.com/broken.jpg');
  });

  it('applies className to fallback container div', () => {
    const { container } = render(
      <ImageWithFallback
        src="https://example.com/broken.jpg"
        alt="Broken"
        className="my-class"
      />
    );

    fireEvent.error(screen.getByAltText('Broken'));

    const fallbackDiv = container.querySelector('.my-class');
    expect(fallbackDiv).toBeInTheDocument();
    expect(fallbackDiv!.tagName).toBe('DIV');
  });

  it('renders without className when none is provided', () => {
    const { container } = render(
      <ImageWithFallback src="https://example.com/photo.jpg" alt="No class" />
    );

    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
  });
});
