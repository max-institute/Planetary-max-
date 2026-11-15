import React from 'react';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cyan' | 'emerald' | 'amber' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  variant = 'cyan',
  size = 'md',
  className = '',
  ...props
}) => {
  const variantClasses: Record<NonNullable<NeonButtonProps['variant']>, string> = {
    cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/50 hover:bg-cyan-500/25 hover:shadow-[0_0_18px_rgba(34,211,238,0.45)]',
    emerald:
      'bg-emerald-500/15 text-emerald-300 border-emerald-400/50 hover:bg-emerald-500/25 hover:shadow-[0_0_18px_rgba(52,211,153,0.45)]',
    amber:
      'bg-amber-500/15 text-amber-300 border-amber-400/50 hover:bg-amber-500/25 hover:shadow-[0_0_18px_rgba(251,191,36,0.45)]',
    ghost:
      'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white',
  };

  const sizeClasses: Record<NonNullable<NeonButtonProps['size']>, string> = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
  };

  return (
    <button
      className={`font-mono tracking-wider uppercase border rounded-lg transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
