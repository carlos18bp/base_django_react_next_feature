import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import HomePage from '../page';

jest.mock('../../components/blog/BlogCarousel', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../components/product/ProductCarousel', () => ({
  __esModule: true,
  default: () => null,
}));

describe('HomePage', () => {
  it('renders template heading', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: 'Everything you need, in one place' })).toBeInTheDocument();
  });
});
