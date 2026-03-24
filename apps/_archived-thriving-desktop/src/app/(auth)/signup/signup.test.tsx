import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockSignUp = vi.fn().mockResolvedValue({ error: null });
const mockSingle = vi.fn().mockResolvedValue({ data: { email: 'nick@test.com' }, error: null });
const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

vi.mock('@upp/db', () => ({
  createBrowserClient: () => ({
    auth: { signUp: mockSignUp },
    from: mockFrom,
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

  it('shows invitation-only note', () => {
    render(<SignupPage />);
    expect(screen.getByText(/access is by invitation only/i)).toBeDefined();
  });

  it('shows error when passwords do not match', async () => {
    render(<SignupPage />);
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'abc123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'xyz999' } });
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form')!);
    await waitFor(() => expect(screen.getByText(/passwords do not match/i)).toBeDefined());
  });

  it('shows error when email is not on the allowlist', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'not found' } });
    render(<SignupPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'stranger@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'abc123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'abc123' } });
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form')!);
    await waitFor(() => expect(screen.getByText(/not authorized/i)).toBeDefined());
    expect(mockSignUp).not.toHaveBeenCalled();
  });
});
