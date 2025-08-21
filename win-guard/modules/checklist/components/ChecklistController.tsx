"use client";

import * as React from "react";
import { ChecklistModal } from "./ChecklistModal";
import { fetchActiveTemplate } from "../api";
import type { ChecklistTemplate, ChecklistResponsePayload } from "../types";

type Props = { formId: string; hiddenFieldId: string };

export default function ChecklistController({ formId, hiddenFieldId }: Props) {
  const [open, setOpen] = React.useState(false);
  const [template, setTemplate] = React.useState<ChecklistTemplate | null>(null);
  const pendingSubmitRef = React.useRef<Event | null>(null);

  React.useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;
    const onSubmit = async (e: Event) => {
      if (open) return; // avoid loop
      e.preventDefault();
      pendingSubmitRef.current = e;
      try {
        const t = await fetchActiveTemplate();
        setTemplate(t);
        setOpen(true);
      } catch (err) {
        // fallback: no template, allow submit
        form.submit();
      }
    };
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [formId, open]);

  const handleConfirm = (payload: ChecklistResponsePayload) => {
    const input = document.getElementById(hiddenFieldId) as HTMLInputElement | null;
    if (input) input.value = JSON.stringify(payload);
    setOpen(false);
    // resume submit
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (form) form.submit();
  };

  return (
    <>
      {template && (
        <ChecklistModal
          open={open}
          onClose={() => setOpen(false)}
          items={template.items}
          templateVersion={template.version}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}


