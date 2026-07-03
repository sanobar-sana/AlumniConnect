import React from 'react';
import { GraduationCap, Briefcase } from 'lucide-react';

/**
 * RoleBadge
 *
 * Displays a stylised badge indicating the user's role (student or alumni).
 *
 * Props:
 *   role    {string}  – 'student' | 'alumni'
 *   size    {string}  – 'sm' | 'md' (default 'md')
 */
export const RoleBadge = ({ role, size = 'md' }) => {
  const isAlumni = role === 'alumni';

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs gap-1'
    : 'px-3 py-1 text-sm gap-1.5';

  const styleClasses = isAlumni
    ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40'
    : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40';

  const Icon = isAlumni ? Briefcase : GraduationCap;
  const label = isAlumni ? 'Alumni' : 'Student';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full ${sizeClasses} ${styleClasses}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {label}
    </span>
  );
};

export default RoleBadge;
