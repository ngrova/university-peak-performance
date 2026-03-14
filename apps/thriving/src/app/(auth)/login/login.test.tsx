import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

// Mock @upp/db
vi.mock('@upp/db', () => ({
  createBrowserClient: () => ({
    auth: { signInWithPassword: vi.fn().mockResolvedValue({ error: null }) },
  }),
}));

import LoginPage from './page';

describe('LoginPage', () => {
  it('renders email and password fields and submit button', () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/password/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDefined();
  });
});
