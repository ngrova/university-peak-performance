import React from 'react';

interface InputFieldProps {
  label: string;
  id: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
}

/** Reusable styled input field for auth forms */
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
