import { supabase } from "../../../../lib/supabase/client";
import type {
  ProjectUnitSetting,
  ProjectUnitSettingRow,
  SaveProjectUnitSettingPayload,
  UnitSettingRow,
} from "../types/project-unit-settings-admin.types";

function mapProjectUnitSetting(params: {
  projectUnit: ProjectUnitSettingRow;
  unit: UnitSettingRow;
}): ProjectUnitSetting {
  return {
    projectId: params.projectUnit.project_id,
    unitId: params.projectUnit.unit_id,
    code: params.unit.code,
    name: params.unit.name,
    description: params.unit.description,
    sortOrder: params.projectUnit.sort_order,
    isActive: params.projectUnit.is_active,
    unitIsActive: params.unit.is_active,
  };
}

async function assertUnitCanBeDisabled(unitId: string) {
  const { count, error } = await supabase
    .from("unit_movements")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("unit_id", unitId)
    .eq("status", "open");

  if (error) {
    throw error;
  }

  if ((count ?? 0) > 0) {
    throw new Error(
      "No puedes desactivar esta unidad porque tiene un movimiento abierto.",
    );
  }
}

export async function getProjectUnitSettings(
  projectId: string,
): Promise<ProjectUnitSetting[]> {
  const { data: projectUnits, error: projectUnitsError } = await supabase
    .from("project_units")
    .select("project_id, unit_id, sort_order, is_active")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })
    .returns<ProjectUnitSettingRow[]>();

  if (projectUnitsError) {
    throw projectUnitsError;
  }

  if (projectUnits.length === 0) {
    return [];
  }

  const unitIds = projectUnits.map((projectUnit) => projectUnit.unit_id);

  const { data: units, error: unitsError } = await supabase
    .from("units")
    .select("id, code, name, description, is_active")
    .in("id", unitIds)
    .returns<UnitSettingRow[]>();

  if (unitsError) {
    throw unitsError;
  }

  return projectUnits
    .map((projectUnit) => {
      const unit = units.find((item) => item.id === projectUnit.unit_id);

      if (!unit) {
        return null;
      }

      return mapProjectUnitSetting({
        projectUnit,
        unit,
      });
    })
    .filter(
      (projectUnit): projectUnit is ProjectUnitSetting => projectUnit !== null,
    );
}

export async function saveProjectUnitSetting(
  payload: SaveProjectUnitSettingPayload,
): Promise<ProjectUnitSetting> {
  if (!payload.isActive) {
    await assertUnitCanBeDisabled(payload.unitId);
  }

  const { error } = await supabase
    .from("project_units")
    .update({
      sort_order: payload.sortOrder,
      is_active: payload.isActive,
    })
    .eq("project_id", payload.projectId)
    .eq("unit_id", payload.unitId);

  if (error) {
    throw error;
  }

  const projectUnitSettings = await getProjectUnitSettings(payload.projectId);
  const updatedProjectUnit = projectUnitSettings.find(
    (projectUnit) => projectUnit.unitId === payload.unitId,
  );

  if (!updatedProjectUnit) {
    throw new Error("No se pudo obtener la unidad actualizada.");
  }

  return updatedProjectUnit;
}
