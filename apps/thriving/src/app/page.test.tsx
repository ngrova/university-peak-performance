import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
  }),
}));

vi.mock('@upp/db', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { email: 'test@example.com' } } }),
    },
  })),
}));

import DashboardPage from './(app)/dashboard/page';

describe('DashboardPage', () => {
  it('renders the Welcome heading', async () => {
    const element = await DashboardPage();
    render(element);
    expect(screen.getByRole('heading', { name: /welcome to thriving/i })).toBeInTheDocument();
  });
});
