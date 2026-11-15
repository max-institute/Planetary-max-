import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'emerald' | 'amber' | 'violet' | 'none';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glowColor = 'none',
}) => {
  const glowStyles: Record<NonNullable<GlassCardProps['glowColor']>, string> = {
    cyan: 'border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.12)]',
    emerald: 'border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.12)]',
    amber: 'border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.12)]',
    violet: 'border-violet-500/30 shadow-[0_0_25px_rgba(139,92,246,0.12)]',
    none: 'border-white/10 shadow-xl',
  };

  return (
    <div
      className={`bg-slate-950/65 backdrop-blur-xl border rounded-xl transition-all duration-200 ${glowStyles[glowColor]} ${className}`}
    >
      {children}
    </div>
  );
};
