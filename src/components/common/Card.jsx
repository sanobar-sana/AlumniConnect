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
        'rounded-xl border transition-all duration-350',
        isGlass
          ? 'glass-card border-zinc-200/40 dark:border-zinc-800/40'
          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800',
        isHoverable && 'hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-zinc-950/50 hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={cn('px-6 py-4 border-b border-zinc-150 dark:border-zinc-800/60', className)} {...props}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '', ...props }) => (
  <div className={cn('p-6', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={cn('px-6 py-4 border-t border-zinc-150 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-b-xl', className)} {...props}>
    {children}
  </div>
);

export default Card;
