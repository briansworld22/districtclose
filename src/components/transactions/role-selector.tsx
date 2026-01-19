'use client';

import { User, Home } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { UserRole } from '@/types/database';

interface RoleSelectorProps {
  selectedRole: UserRole | null;
  onSelect: (role: UserRole) => void;
}

export function RoleSelector({ selectedRole, onSelect }: RoleSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Are you the Buyer or the Seller?
      </h2>
      <p className="text-sm text-gray-500">
        Select your role in this transaction to get started.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <RoleCard
          role="buyer"
          title="Buyer"
          description="I'm purchasing a property"
          icon={<User className="h-8 w-8" />}
          isSelected={selectedRole === 'buyer'}
          onSelect={() => onSelect('buyer')}
        />
        <RoleCard
          role="seller"
          title="Seller"
          description="I'm selling my property"
          icon={<Home className="h-8 w-8" />}
          isSelected={selectedRole === 'seller'}
          onSelect={() => onSelect('seller')}
        />
      </div>
    </div>
  );
}

interface RoleCardProps {
  role: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
}

function RoleCard({
  title,
  description,
  icon,
  isSelected,
  onSelect,
}: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative flex flex-col items-center p-6 rounded-xl border-2 transition-all',
        'hover:border-blue-300 hover:bg-blue-50/50',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        isSelected
          ? 'border-blue-600 bg-blue-50'
          : 'border-gray-200 bg-white'
      )}
    >
      <div
        className={cn(
          'p-3 rounded-full mb-3',
          isSelected ? 'text-blue-600 bg-blue-100' : 'text-gray-400 bg-gray-100'
        )}
      >
        {icon}
      </div>
      <h3
        className={cn(
          'font-medium',
          isSelected ? 'text-blue-900' : 'text-gray-900'
        )}
      >
        {title}
      </h3>
      <p className="text-sm text-gray-500 text-center mt-1">{description}</p>

      {isSelected && (
        <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
          <svg
            className="h-3 w-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
    </button>
  );
}
