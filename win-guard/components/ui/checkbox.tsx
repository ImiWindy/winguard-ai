import * as React from "react";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={`h-4 w-4 rounded border-gray-300 text-black dark:text-white focus:ring-1 focus:ring-gray-500 ${className}`}
      {...props}
    />
  )
);
Checkbox.displayName = "Checkbox";



