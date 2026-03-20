// ═══════════════════════════════════════════════════════════
// FILE: InputField.tsx
// PURPOSE: A reusable styled text input with a label, used on
//   the login and signup forms. Keeps the auth pages consistent
//   without duplicating input styling.
// CALLED BY: app/(auth)/login/page.tsx, app/(auth)/signup/page.tsx
// DATA FLOW: Parent passes label, value, and onChange → user types
//   → onChange sends the new value back to the parent's state
// ═══════════════════════════════════════════════════════════
import React from 'react';

interface InputFieldProps {
  label: string;
  id: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
}

/**
 * Triggered by: login and signup pages render this for each form field.
 * Steps: renders a label and a styled text input. When the user types,
 *   calls the onChange prop with the new value.
 * Returns: a labeled input element.
 */
export default function InputField({
  label, id, type, value, onChange,
}: InputFieldProps): React.JSX.Element {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium mb-1"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-lg px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        style={{
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          height: '48px',
        }}
      />
    </div>
  );
}
