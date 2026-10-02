import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import './button.css';

type ButtonVariant = 'default' | 'outline' | 'ghost';
type ButtonSize = 'default' | 'sm';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variants: Record<ButtonVariant, string> = {
  default: 'button-variant-default',
  outline: 'button-variant-outline',
  ghost: 'button-variant-ghost',
};

const sizes: Record<ButtonSize, string> = {
  default: 'button-size-default',
  sm: 'button-size-sm',
};

export function Button({
  className,
  variant = 'default',
  size = 'default',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'button',
        variants[variant],
        sizes[size],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
