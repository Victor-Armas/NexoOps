import type {
  PlantCheckValues,
  PlantOperationalCondition,
  PlantRiskLevel,
} from "../types/plant-check.types";

export type PlantCheckField = {
  key: string;
  label: string;
  group: "full" | "empty";
};

export type PlantRiskThresholds = {
  mediumFullCountThreshold: number;
  mediumEmptyCountThreshold: number;
};

const P4_FIELDS: PlantCheckField[] = [
  {
    key: "full_p5",
    label: "Llenos para P5",
    group: "full",
  },
  {
    key: "full_p6",
    label: "Llenos para P6",
    group: "full",
  },
  {
    key: "full_cdt",
    label: "Llenos para CDT",
    group: "full",
  },
  {
    key: "empty",
    label: "Carros vacíos",
    group: "empty",
  },
];

const DEFAULT_FIELDS: PlantCheckField[] = [
  {
    key: "full",
    label: "Carros llenos",
    group: "full",
  },
  {
    key: "empty",
    label: "Carros vacíos",
    group: "empty",
  },
];

export function getPlantCheckFields(plantName: string | undefined) {
  if (plantName?.trim().toUpperCase() === "P4") {
    return P4_FIELDS;
  }

  return DEFAULT_FIELDS;
}

export function getDefaultPlantCheckValues(fields: PlantCheckField[]) {
  return fields.reduce<PlantCheckValues>((values, field) => {
    values[field.key] = 0;
    return values;
  }, {});
}

export function getTotalByFieldGroup(
  values: PlantCheckValues,
  fields: PlantCheckField[],
  group: PlantCheckField["group"],
) {
  return fields
    .filter((field) => field.group === group)
    .reduce((total, field) => total + (values[field.key] ?? 0), 0);
}

export function getSuggestedRiskLevel(params: {
  values: PlantCheckValues;
  fields: PlantCheckField[];
  operationalCondition: PlantOperationalCondition;
  riskThresholds: PlantRiskThresholds;
}): PlantRiskLevel {
  const fullCount = getTotalByFieldGroup(params.values, params.fields, "full");
  const emptyCount = getTotalByFieldGroup(
    params.values,
    params.fields,
    "empty",
  );

  if (
    params.operationalCondition === "no_unload_space" ||
    params.operationalCondition === "no_dock_available"
  ) {
    return "high";
  }

  if (params.operationalCondition === "material_priority") {
    return "medium";
  }

  if (
    fullCount >= params.riskThresholds.mediumFullCountThreshold ||
    emptyCount >= params.riskThresholds.mediumEmptyCountThreshold
  ) {
    return "medium";
  }

  return "low";
}
