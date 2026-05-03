import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "outline";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT: Record<Variant, string> = {
  primary:
    "gradient-button text-white font-display font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] active:scale-[0.98]",
  ghost: "text-on-surface hover:bg-white/5",
  outline:
    "border border-white/15 text-on-surface hover:bg-white/5 backdrop-blur",
};

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "rounded-xl px-6 py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANT[variant],
        className,
      )}
      {...rest}
    />
  );
});

export default Button;
