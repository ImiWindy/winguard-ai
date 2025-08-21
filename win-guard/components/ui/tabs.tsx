"use client";

import * as React from "react";

type TabsProps = {
  tabs: { value: string; label: string }[];
  initial?: string;
  onChange?: (value: string) => void;
  className?: string;
};

export function Tabs({ tabs, initial, onChange, className = "" }: TabsProps) {
  const [value, setValue] = React.useState(initial || tabs[0]?.value || "");
  React.useEffect(() => {
    onChange?.(value);
  }, [value, onChange]);
  return (
    <div className={`w-full ${className}`}>
      <div className="flex border-b dark:border-gray-800 mb-4">
        {tabs.map((t) => (
          <button
            key={t.value}
            className={`px-4 py-2 -mb-px border-b-2 ${value === t.value ? "border-black dark:border-white" : "border-transparent text-gray-500"}`}
            onClick={() => setValue(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <input type="hidden" value={value} readOnly />
    </div>
  );
}


