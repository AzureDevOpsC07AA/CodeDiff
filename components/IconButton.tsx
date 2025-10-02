import React from 'react';

interface IconButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
  isActive?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({ 
  onClick, 
  children, 
  ariaLabel, 
  disabled = false, 
  className = '',
  isActive = false
}) => {
  const activeClasses = isActive 
    ? 'bg-[var(--color-accent-bg)] text-white hover:bg-[var(--color-accent-bg-hover)]' 
    : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary-hover)] hover:text-[var(--color-text-primary)]';

  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`p-2 rounded-md transition-colors disabled:cursor-not-allowed disabled:bg-[var(--color-bg-tertiary)] disabled:text-[var(--color-text-disabled)] ${activeClasses} ${className}`}
    >
      {children}
    </button>
  );
};
