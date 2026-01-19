'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={cn(
              'h-4 w-4 rounded border-gray-300 text-blue-600',
              'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className
            )}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3">
            {label && (
              <label
                htmlFor={checkboxId}
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
