export type ChecklistItem = {
  id: string;
  text: string;
  critical?: boolean;
};

export type ChecklistTemplate = {
  id?: string;
  user_id?: string;
  version: number;
  title?: string;
  items: ChecklistItem[];
  is_active?: boolean;
  created_at?: string;
};

export type ChecklistResponseItem = {
  id: string;
  text: string;
  checked: boolean;
  critical?: boolean;
  note?: string;
};

export type ChecklistResponsePayload = {
  templateVersion: number;
  responses: ChecklistResponseItem[];
  score: number;
  missingCriticalItems: string[];
};


