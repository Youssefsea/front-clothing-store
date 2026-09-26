import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

const styles: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "bg-secondary text-secondary-foreground hover:brightness-95",
  ghost: "bg-transparent text-foreground hover:bg-muted",
  danger: "bg-danger text-danger-foreground hover:opacity-90"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className = "", variant = "primary", ...props }, ref) => (
  <button ref={ref} className={"inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 " + styles[variant] + " " + className} {...props} />
));
Button.displayName = "Button";
