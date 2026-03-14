import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock @upp/db
vi.mock('@upp/db', () => ({
  createBrowserClient: () => ({
    auth: { signUp: vi.fn().mockResolvedValue({ error: null }) },
  }),
}));

import SignupPage from './page';

describe('SignupPage', () => {
  it('renders email, password, and confirm password fields and submit button', () => {
    render(<SignupPage />);

    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/^password$/i)).toBeDefined();
    expect(screen.getByLabelText(/confirm password/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /create account/i })).toBeDefined();
  });
});
