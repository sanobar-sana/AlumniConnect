import React from 'react';
import { cn } from '../../utils/helpers';

export const Input = ({
  label,
  id,
  type = 'text',
  placeholder = '',
  error = '',
  className = '',
  icon: Icon,
  required = false,
  ...props
}) => {
  return (
    <div className={cn('w-full flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          type={type}
          id={id}
          className={cn(
            'block w-full rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600',
            Icon ? 'pl-10' : 'pl-3',
            'pr-3 py-2.5',
            error
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500/20'
          )}
          placeholder={placeholder}
          required={required}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-rose-500">{error}</span>}
    </div>
  );
};

export default Input;
