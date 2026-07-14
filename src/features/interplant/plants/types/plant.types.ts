export type Plant = {
  id: string;
  code: string;
  name: string;
  description: string | null;
};

export type PlantRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
};

export type ProjectPlantRow = {
  plant_id: string;
};
