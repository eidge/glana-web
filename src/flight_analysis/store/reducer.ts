import FlightGroup from "glana/src/analysis/flight_group";
import { defaultSettings, flightComputer, Settings } from "../settings";
import { ActionType, Action } from "./actions";

export type DrawerView = "settings" | "stats" | null;

export interface State {
  isLoading: boolean;
  sideDrawer: {
    view: DrawerView;
  };
  flightGroup?: FlightGroup;
  settings: Settings;
}

export function initialState(): State {
  return {
    isLoading: true,
    sideDrawer: {
      view: null
    },
    settings: defaultSettings()
  };
}

export function reducer(state: State, action: Action): State {
  const { sideDrawer } = state;
  const { view } = sideDrawer;
  let newView: DrawerView;

  switch (action.type) {
    case ActionType.SetFlightGroup:
      const flightGroup = action.payload;
      // FIXME: There shouldn't be any side-effects here. Will need to use
      // something like a thunk!
      flightGroup.flights.forEach(f => f.analise(flightComputer));
      flightGroup.synchronize(state.settings.synchronizationMethod);
      return { ...state, isLoading: false, flightGroup: flightGroup };
    case ActionType.SetActiveTimestamp:
      return state;
    case ActionType.ToggleStats:
      if (view === "stats") {
        newView = null;
      } else {
        newView = "stats";
      }
      return {
        ...state,
        sideDrawer: { ...sideDrawer, view: newView }
      };
    case ActionType.ToggleSettings:
      if (view === "settings") {
        newView = null;
      } else {
        newView = "settings";
      }

      return {
        ...state,
        sideDrawer: { ...sideDrawer, view: newView }
      };
    case ActionType.CloseDrawer:
      return {
        ...state,
        sideDrawer: { ...sideDrawer, view: null }
      };
  }
}
