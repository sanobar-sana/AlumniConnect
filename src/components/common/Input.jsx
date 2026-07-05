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
        <label htmlFor={id} className="text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          type={type}
          id={id}
          className={cn(
            'block w-full rounded-xl border text-sm font-medium transition-all duration-200',
            'focus:outline-none focus:ring-2',
            'bg-white dark:bg-slate-900',
            'text-slate-900 dark:text-slate-50',
            'placeholder-slate-400 dark:placeholder-slate-500',
            Icon ? 'pl-10' : 'pl-4',
            'pr-4 py-2.5',
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500/15 dark:focus:border-violet-400'
          )}
          placeholder={placeholder}
          required={required}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
    </div>
  );
};

export default Input;
