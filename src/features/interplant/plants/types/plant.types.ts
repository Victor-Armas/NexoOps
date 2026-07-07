export type Plant = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
};

export type PlantRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sort_order: number;
};

export type ProjectPlantRow = {
  plant_id: string;
  sort_order: number;
};
