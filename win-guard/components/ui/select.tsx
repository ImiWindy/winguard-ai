import * as React from "react";

type Option = { label: string; value: string };

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: Option[];
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", options, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-700 ${className}`}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }
);
Select.displayName = "Select";



