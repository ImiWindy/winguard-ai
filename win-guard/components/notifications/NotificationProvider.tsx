"use client";

import * as React from "react";

type Notification = { id: string; type: "success" | "error" | "info"; message: string };

type Ctx = {
  notify: (n: Omit<Notification, "id">) => void;
};

const Ctx = React.createContext<Ctx | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = React.useState<Notification[]>([]);

  const notify = React.useCallback((n: Omit<Notification, "id">) => {
    const id = crypto.randomUUID();
    const item = { id, ...n } as Notification;
    setList((l) => [...l, item]);
    setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 3500);
  }, []);

  const value = React.useMemo(() => ({ notify }), [notify]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {list.map((n) => (
          <div key={n.id} className={`px-4 py-2 rounded-md shadow text-sm ${n.type === "success" ? "bg-green-600 text-white" : n.type === "error" ? "bg-red-600 text-white" : "bg-gray-800 text-white"}`}>
            {n.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useNotify() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useNotify must be used within NotificationProvider");
  return ctx.notify;
}


