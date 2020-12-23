import FlightGroup from "glana/src/analysis/flight_group";

export enum ActionType {
  SetFlightGroup = "SET_FLIGHT_GROUP",
  SetActiveTimestamp = "SET_ACTIVE_TIMESTAMP",
  ToggleStats = "TOGGLE_STATS"
}

export const actions = {
  toggleStats,
  setFlightGroup,
  setActiveTimestamp
};

function toggleStats() {
  return {
    type: ActionType.ToggleStats as ActionType.ToggleStats
  };
}

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

const actionFns = Object.values(actions);
type ElementType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<
  infer ElementType
>
  ? ElementType
  : never;

export type Action = ReturnType<ElementType<typeof actionFns>>;
