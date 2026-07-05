import React from 'react';
import { cn } from '../../utils/helpers';

export const Card = ({
  children,
  className = '',
  isHoverable = false,
  isGlass = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl border transition-all duration-300',
        isGlass
          ? 'glass-card border-white/30 dark:border-slate-700/40'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm',
        isHoverable &&
          'hover:-translate-y-1 hover:shadow-md dark:hover:shadow-slate-950/50 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div
    className={cn(
      'px-6 py-4 border-b border-slate-100 dark:border-slate-800/60',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardBody = ({ children, className = '', ...props }) => (
  <div className={cn('p-6', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div
    className={cn(
      'px-6 py-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/50 rounded-b-2xl',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export default Card;
