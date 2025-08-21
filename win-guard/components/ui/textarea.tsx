import * as React from "react";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = "", ...props }, ref) => (
    <textarea
      ref={ref}
      className={`w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-700 ${className}`}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";


