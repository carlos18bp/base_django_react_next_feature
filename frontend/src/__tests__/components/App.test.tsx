import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('react-router', () => ({
  RouterProvider: ({ router: _router }: any) => (
    <div data-testid="router-provider">Router Active</div>
  ),
}));

vi.mock('../../app/routes', () => ({
  router: { routes: [] },
}));

import App from '../../app/App';

describe('App', () => {
  it('renders RouterProvider with the configured router', () => {
    const { getByTestId } = render(<App />);

    expect(getByTestId('router-provider')).toBeInTheDocument();
  });
});
