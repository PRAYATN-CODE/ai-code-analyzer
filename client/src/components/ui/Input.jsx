import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Input = forwardRef(({ className, type, label, error, icon: Icon, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-foreground/80">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Icon size={16} />
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm",
            "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all duration-200",
            "input-inset",
            Icon && "pl-9",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
});
Input.displayName = "Input";

export { Input };
