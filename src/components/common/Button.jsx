import React from 'react';
import { cn } from '../../utils/helpers';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  className = '',
  onClick,
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
  
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10 focus:ring-indigo-500 dark:focus:ring-offset-zinc-950',
    secondary: 'bg-zinc-150 hover:bg-zinc-200 text-gray-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-gray-100 focus:ring-zinc-500 dark:focus:ring-offset-zinc-950',
    outline: 'border border-zinc-300 hover:bg-zinc-50 text-gray-700 dark:border-zinc-750 dark:hover:bg-zinc-900 dark:text-gray-300 focus:ring-indigo-500 dark:focus:ring-offset-zinc-950',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/10 focus:ring-rose-500 dark:focus:ring-offset-zinc-950',
    ghost: 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:ring-zinc-500 dark:focus:ring-offset-zinc-950',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2',
  };

  return (
    <button
      type={type}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading || isDisabled}
      onClick={onClick}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!isLoading && Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

export default Button;
