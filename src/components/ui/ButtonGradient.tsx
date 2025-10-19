'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonGradientProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const ButtonGradient = forwardRef<HTMLButtonElement, ButtonGradientProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'font-semibold rounded-xl transition-all duration-300 inline-flex items-center justify-center gap-2';

    const variants = {
      primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:scale-105',
      secondary: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-xl hover:scale-105',
      outline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50 hover:shadow-lg',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    const { onAnimationStart, onAnimationEnd, onDragStart, onDragEnd, onDrag, ...buttonProps } = props;

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...buttonProps}
      >
        {children}
      </motion.button>
    );
  }
);

ButtonGradient.displayName = 'ButtonGradient';

export default ButtonGradient;
