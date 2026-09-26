import { forwardRef } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className = "", ...props }, ref) => (
  <input ref={ref} className={"min-h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 " + className} {...props} />
));
Input.displayName = "Input";
