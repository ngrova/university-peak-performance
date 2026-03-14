import React from 'react';

type Variant = 'primary' | 'secondary';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-upp-primary text-white hover:bg-upp-primary-dark',
  secondary: 'bg-white text-upp-primary border border-upp-primary hover:bg-upp-surface',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps): React.JSX.Element {
  const classes = [
    'inline-flex items-center justify-center rounded-md font-medium',
    'transition-colors duration-150 focus:outline-none focus:ring-2',
    'focus:ring-upp-primary focus:ring-offset-2 disabled:opacity-50',
    'disabled:cursor-not-allowed',
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
