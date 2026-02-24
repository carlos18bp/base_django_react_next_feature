import { describe, it, expect, beforeEach } from '@jest/globals';
import { act, render, screen, waitFor, within } from '@testing-library/react';

import BackofficePage from '../page';
import { useRequireAuth } from '../../../lib/hooks/useRequireAuth';
import { api } from '../../../lib/services/http';

jest.mock('../../../lib/hooks/useRequireAuth', () => ({
  useRequireAuth: jest.fn(),
}));

jest.mock('../../../lib/services/http', () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockUseRequireAuth = useRequireAuth as unknown as jest.Mock;
const mockApi = api as jest.Mocked<typeof api>;

describe('BackofficePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when unauthenticated', () => {
    mockUseRequireAuth.mockReturnValue({ isAuthenticated: false });

    const { container } = render(<BackofficePage />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders loading state and data', async () => {
    mockUseRequireAuth.mockReturnValue({ isAuthenticated: true });

    const users = [
      { id: 1, email: 'staff@example.com', role: 'admin', is_staff: true, is_active: true },
    ];
    const sales = [
      { id: 10, email: 'buyer@example.com', city: 'Madrid', state: 'MD', postal_code: '28001' },
    ];

    let resolveUsers: (value: any) => void = () => {};
    let resolveSales: (value: any) => void = () => {};

    const usersPromise = new Promise((resolve) => {
      resolveUsers = resolve;
    });
    const salesPromise = new Promise((resolve) => {
      resolveSales = resolve;
    });

    mockApi.get.mockImplementationOnce(() => usersPromise as any);
    mockApi.get.mockImplementationOnce(() => salesPromise as any);

    render(<BackofficePage />);

    expect(await screen.findByText('Loading...')).toBeInTheDocument();

    await act(async () => {
      resolveUsers({ data: users });
      resolveSales({ data: sales });
    });

    await waitFor(() => {
      expect(screen.getByText('staff@example.com')).toBeInTheDocument();
    });

    expect(screen.getByText('buyer@example.com')).toBeInTheDocument();
    expect(screen.queryByText('No data')).not.toBeInTheDocument();
  });

  it('renders fallback values when role or status fields are missing', async () => {
    mockUseRequireAuth.mockReturnValue({ isAuthenticated: true });

    const users = [
      { id: 2, email: 'viewer@example.com', role: '', is_staff: false, is_active: false },
    ];
    const sales = [
      { id: 11, email: 'buyer@example.com', city: 'Madrid', state: 'MD', postal_code: '28001' },
    ];

    mockApi.get.mockResolvedValueOnce({ data: users });
    mockApi.get.mockResolvedValueOnce({ data: sales });

    render(<BackofficePage />);

    const row = (await screen.findByText('viewer@example.com')).closest('tr');
    expect(row).not.toBeNull();

    const rowScope = within(row as HTMLElement);
    expect(rowScope.getByText('-')).toBeInTheDocument();
    expect(rowScope.getAllByText('no')).toHaveLength(2);
  });

  it('shows an error when loading fails', async () => {
    mockUseRequireAuth.mockReturnValue({ isAuthenticated: true });

    mockApi.get.mockRejectedValueOnce(new Error('Fail'));
    mockApi.get.mockResolvedValueOnce({ data: [] });

    render(<BackofficePage />);

    expect(
      await screen.findByText('Could not load backoffice data. Make sure you are signed in with a staff user.')
    ).toBeInTheDocument();
  });

  it('shows empty tables when no data exists', async () => {
    mockUseRequireAuth.mockReturnValue({ isAuthenticated: true });

    mockApi.get.mockResolvedValueOnce({ data: [] });
    mockApi.get.mockResolvedValueOnce({ data: [] });

    render(<BackofficePage />);

    await waitFor(() => {
      expect(screen.getAllByText('No data')).toHaveLength(2);
    });
  });

  it('handles non-array API responses', async () => {
    mockUseRequireAuth.mockReturnValue({ isAuthenticated: true });

    mockApi.get.mockResolvedValueOnce({ data: { items: [] } });
    mockApi.get.mockResolvedValueOnce({ data: { items: [] } });

    render(<BackofficePage />);

    await waitFor(() => {
      expect(screen.getAllByText('No data')).toHaveLength(2);
    });
  });
});
