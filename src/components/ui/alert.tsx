import { type HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
}

export function Alert({
  className,
  variant = 'info',
  title,
  children,
  ...props
}: AlertProps) {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="h-5 w-5 text-blue-500" />,
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    },
  };

  const { container, icon } = variants[variant];

  return (
    <div
      className={cn('rounded-lg border p-4', container, className)}
      role="alert"
      {...props}
    >
      <div className="flex">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-3">
          {title && (
            <h3 className="text-sm font-medium">{title}</h3>
          )}
          <div className={cn('text-sm', title && 'mt-1')}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
