import * as React from "react";

export function Label({ className = "", ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={`block text-sm mb-1 text-gray-700 dark:text-gray-300 ${className}`} {...props} />;
}


