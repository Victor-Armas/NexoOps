export type MovementTypeSetting = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MovementTypeSettingRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SaveMovementTypeSettingPayload = {
  id?: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
};
