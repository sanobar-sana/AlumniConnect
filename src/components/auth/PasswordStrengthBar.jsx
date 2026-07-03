import React, { useMemo } from 'react';

/**
 * PasswordStrengthBar
 *
 * Displays a colour-coded strength indicator beneath a password field.
 *
 * Props:
 *   password  {string}  – the current password value
 *
 * Strength tiers:
 *   0 – empty
 *   1 – weak   (< 8 chars or only one character class)
 *   2 – fair   (8+ chars, 2 character classes)
 *   3 – good   (8+ chars, 3 character classes)
 *   4 – strong (12+ chars, all 4 character classes)
 */

const classifyStrength = (password) => {
  if (!password) return 0;

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Normalise to 1–4
  if (score <= 1) return 1;
  if (score === 2) return 2;
  if (score === 3) return 3;
  return 4;
};

const LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const SEGMENT_COLORS = [
  '',                                    // 0 – empty
  'bg-rose-500',                         // 1 – weak
  'bg-amber-400',                        // 2 – fair
  'bg-yellow-400',                       // 3 – good
  'bg-emerald-500',                      // 4 – strong
];
const TEXT_COLORS = [
  '',
  'text-rose-500',
  'text-amber-500',
  'text-yellow-600 dark:text-yellow-400',
  'text-emerald-600 dark:text-emerald-400',
];

export const PasswordStrengthBar = ({ password }) => {
  const strength = useMemo(() => classifyStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-1.5 space-y-1.5">
      {/* Segment bars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((tier) => (
          <div
            key={tier}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              strength >= tier
                ? SEGMENT_COLORS[strength]
                : 'bg-zinc-200 dark:bg-zinc-800'
            }`}
          />
        ))}
      </div>

      {/* Label */}
      <p className={`text-xs font-semibold ${TEXT_COLORS[strength]}`}>
        {LABELS[strength]}
        {strength < 3 && (
          <span className="font-normal text-zinc-400 dark:text-zinc-500">
            {' '}— try adding numbers, symbols or uppercase letters
          </span>
        )}
      </p>
    </div>
  );
};

export default PasswordStrengthBar;
