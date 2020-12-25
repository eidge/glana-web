import FlightGroup from "glana/src/analysis/flight_group";
import SavedFlight from "glana/src/saved_flight";
import { Colors } from "../colors";
import { defaultSettings, flightComputer, Settings } from "../settings";
import { ActionType, Action } from "./actions";

export type DrawerView = "settings" | "stats" | null;

export type FlightDatum = {
  flight: SavedFlight;
  color: string;
};

export type FlightsById = { [key: string]: FlightDatum };

export interface State {
  isLoading: boolean;
  sideDrawer: {
    view: DrawerView;
  };
  flightGroup: FlightGroup | null;
  flightsById: FlightsById;
  followFlightId: string | null;
  settings: Settings;
  activeTimestamp: Date | null;
}

export function initialState(): State {
  return {
    isLoading: true,
    sideDrawer: {
      view: null
    },
    flightGroup: null,
    flightsById: {},
    followFlightId: null,
    settings: defaultSettings(),
    activeTimestamp: null
  };
}

export function reducer(state: State, action: Action): State {
  const { sideDrawer } = state;
  const { view } = sideDrawer;
  let newView: DrawerView;

  switch (action.type) {
    case ActionType.SetFlightGroup:
      const colors = new Colors();
      const flightGroup = action.payload;
      const flightsById = flightGroup.flights.reduce(
        (byId: FlightsById, flight) => {
          byId[flight.id] = { flight: flight, color: colors.nextColor() };
          return byId;
        },
        {}
      );
      // FIXME: All of the flightGroup related data should be in a `flight*` key
      // to prevent having to make null checks for all related data items.
      // FIXME: There shouldn't be any side-effects here. Will need to use
      // something like a thunk!
      flightGroup.flights.forEach(f => f.analise(flightComputer));
      flightGroup.synchronize(state.settings.synchronizationMethod);
      return {
        ...state,
        isLoading: false,
        flightGroup,
        flightsById,
        followFlightId: flightGroup.flights[0].id
      };
    case ActionType.SetActiveTimestamp:
      return { ...state, activeTimestamp: action.payload };
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
