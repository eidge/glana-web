import FlightGroup from "glana/src/analysis/flight_group";

export enum ActionType {
  SetFlightGroup = "SET_FLIGHT_GROUP",
  SetActiveTimestamp = "SET_ACTIVE_TIMESTAMP",
  ToggleStats = "TOGGLE_STATS",
  ToggleSettings = "TOGGLE_SETTINGS",
  CloseDrawer = "CLOSE_DRAWER"
}

export const actions = {
  setFlightGroup,
  setActiveTimestamp,
  toggleStats,
  toggleSettings,
  closeDrawer
};

function setFlightGroup(flightGroup: FlightGroup) {
  return {
    type: ActionType.SetFlightGroup as ActionType.SetFlightGroup,
    payload: flightGroup
  };
}

function setActiveTimestamp(timestamp: Date) {
  return {
    type: ActionType.SetActiveTimestamp as ActionType.SetActiveTimestamp,
    payload: timestamp
  };
}

function toggleStats() {
  return {
    type: ActionType.ToggleStats as ActionType.ToggleStats
  };
}

function toggleSettings() {
  return {
    type: ActionType.ToggleSettings as ActionType.ToggleSettings
  };
}

function closeDrawer() {
  return {
    type: ActionType.CloseDrawer as ActionType.CloseDrawer
  };
}

const actionFns = Object.values(actions);
type ElementType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<
  infer ElementType
>
  ? ElementType
  : never;

export type Action = ReturnType<ElementType<typeof actionFns>>;
