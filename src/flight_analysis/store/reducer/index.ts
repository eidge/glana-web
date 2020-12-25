import FlightGroup from "glana/src/analysis/flight_group";
import SavedFlight from "glana/src/saved_flight";
import { Colors } from "../../colors";
import { defaultSettings, flightComputer, Settings } from "../../settings";
import { ActionType, Action } from "../actions";

export type DrawerView = "settings" | "stats" | null;

export type FlightDatum = {
  flight: SavedFlight;
  color: string;
};

export type FlightDataById = { [key: string]: FlightDatum };

export interface State {
  // analysis: {
  //   flightGroup: FlightGroup;
  //   flightDataById: FlightDataById;
  //   followFlightId: string;
  //   activeTimestamp: Date;
  // } | null;
  isLoading: boolean;
  isPlaying: boolean;
  sideDrawer: {
    view: DrawerView;
  };
  flightGroup: FlightGroup | null;
  flightsById: FlightDataById;
  followFlightId: string | null;
  settings: Settings;
  activeTimestamp: Date | null;
}

export function initialState(): State {
  return {
    // analysis: null,
    isLoading: true,
    isPlaying: false,
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
        (byId: FlightDataById, flight) => {
          byId[flight.id] = { flight: flight, color: colors.nextColor() };
          return byId;
        },
        {}
      );
      // FIXME: All of the flightGroup related data should be in a `analysis` key
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
    case ActionType.AdvanceActiveTimestamp:
      if (!state.followFlightId) return state;
      let { activeTimestamp } = state;
      if (!activeTimestamp) {
        activeTimestamp = state.flightsById[
          state.followFlightId
        ].flight.getRecordingStartedAt();
      } else if (activeTimestamp > state.flightGroup!.latestDatumAt) {
        return {
          ...state,
          activeTimestamp: state.flightGroup!.latestDatumAt,
          isPlaying: false
        };
      } else {
        activeTimestamp = new Date(activeTimestamp.getTime() + action.payload);
      }

      return { ...state, activeTimestamp };
    case ActionType.TogglePlay:
      if (
        (!state.activeTimestamp ||
          state.activeTimestamp >= state.flightGroup!.latestDatumAt) &&
        !state.isPlaying
      ) {
        return {
          ...state,
          isPlaying: !state.isPlaying,
          activeTimestamp: state.flightGroup!.earliestDatumAt
        };
      }
      return { ...state, isPlaying: !state.isPlaying };
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
