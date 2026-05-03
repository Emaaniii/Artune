import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white outline-none transition-all",
        "focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-slate-600",
        className,
      )}
      {...rest}
    />
  );
});

export default Input;
