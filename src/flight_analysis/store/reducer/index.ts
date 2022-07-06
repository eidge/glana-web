import FlightGroup, {
  synchronizationMethods
} from "glana/src/analysis/flight_group";
import Task from "glana/src/flight_computer/tasks/task";
import { Colors } from "../../colors";
import { defaultSettings, flightComputer, Settings } from "../../settings";
import { ActionType, Action } from "../actions";
import { FlightDatum } from "../models/flight_datum";

export type DrawerView = "settings" | "flights" | "upload_flight";

export type DrawerState = {
  view: DrawerView;
  canClose: boolean;
};

export type FlightDataById = { [key: string]: FlightDatum };

export interface AnalysisState {
  isSummary: boolean;
  task: Task | null;
  flightGroup: FlightGroup;
  flightDataById: FlightDataById;
  flightData: FlightDatum[];
  followFlightId: string;
  activeTimestamp: Date;
}

export interface State {
  analysis: AnalysisState | null;
  sideDrawer: DrawerState | null;
  settings: Settings;
  isLoading: boolean;
  isPlaying: boolean;
  isDebug: boolean;
}

export function initialState(): State {
  return {
    analysis: null,
    isLoading: true,
    isPlaying: false,
    sideDrawer: null,
    settings: defaultSettings(),
    isDebug: false
  };
}

function handleSetActiveTimestamp(state: State, action: Action): State {
  if (action.type !== ActionType.SetActiveTimestamp) return state; // hack to get types to work
  if (!state.analysis) return state;

  return {
    ...state,
    analysis: {
      ...state.analysis,
      activeTimestamp: action.timestamp,
      isSummary: false
    }
  };
}

function handleAdvanceActiveTimestamp(state: State, action: Action): State {
  if (action.type !== ActionType.AdvanceActiveTimestamp) return state; // hack to get types to work
  if (!state.analysis) return state;

  let {
    analysis: { activeTimestamp }
  } = state;

  if (!activeTimestamp) {
    activeTimestamp = state.analysis.flightDataById[
      state.analysis.followFlightId
    ].flight.getRecordingStartedAt();
  } else if (activeTimestamp > state.analysis.flightGroup.latestDatumAt) {
    return {
      ...state,
      analysis: {
        ...state.analysis,
        activeTimestamp: state.analysis.flightGroup.latestDatumAt
      },
      isPlaying: false
    };
  } else {
    activeTimestamp = new Date(
      activeTimestamp.getTime() + action.deltaInMillis
    );
  }

  return {
    ...state,
    analysis: {
      ...state.analysis,
      activeTimestamp: activeTimestamp,
      isSummary: false
    }
  };
}

function handleTogglePlay(state: State, action: Action): State {
  if (action.type !== ActionType.TogglePlay) return state; // hack to get types to work
  if (!state.analysis) return state;

  if (
    state.analysis.activeTimestamp >=
      state.analysis.flightGroup!.latestDatumAt &&
    !state.isPlaying
  ) {
    return {
      ...state,
      isPlaying: !state.isPlaying,
      analysis: {
        ...state.analysis,
        activeTimestamp: state.analysis.flightGroup.earliestDatumAt
      }
    };
  }
  return { ...state, isPlaying: !state.isPlaying };
}

function handleToggleFlights(state: State, action: Action): State {
  if (action.type !== ActionType.ToggleFlights) return state; // hack to get types to work

  const { sideDrawer } = state;
  let newSideDrawer: DrawerState | null;

  if (!sideDrawer || sideDrawer.view !== "flights") {
    newSideDrawer = { view: "flights", canClose: true };
  } else {
    newSideDrawer = null;
  }
  return {
    ...state,
    sideDrawer: newSideDrawer
  };
}

function handleToggleSettings(state: State, action: Action): State {
  if (action.type !== ActionType.ToggleSettings) return state; // hack to get types to work

  const { sideDrawer } = state;
  let newSideDrawer: DrawerState | null;

  if (!sideDrawer || sideDrawer.view !== "settings") {
    newSideDrawer = { view: "settings", canClose: true };
  } else {
    newSideDrawer = null;
  }
  return {
    ...state,
    sideDrawer: newSideDrawer
  };
}

function handleShowFlightUploader(state: State, action: Action): State {
  if (action.type !== ActionType.ShowFlightUploader) return state; // hack to get types to work

  return {
    ...state,
    sideDrawer: { view: "upload_flight", canClose: !!state.analysis },
    isLoading: false
  };
}

function handleCloseDrawer(state: State, action: Action): State {
  if (action.type !== ActionType.CloseDrawer) return state; // hack to get types to work

  return {
    ...state,
    sideDrawer: null
  };
}

function handleChangeSettings(state: State, action: Action): State {
  if (action.type !== ActionType.ChangeSettings) return state; // hack to get types to work

  const { changes } = action;
  let newState = {
    ...state,
    settings: { ...state.settings, ...changes }
  };

  const shouldReanalise = Object.keys(changes).includes("qnh");

  if (
    state.analysis &&
    (Object.keys(changes).includes("synchronizationMethod") || shouldReanalise)
  ) {
    newState.analysis = buildAnalysisState(
      newState,
      state.analysis.flightGroup,
      state.analysis.task,
      {
        followFlightId: state.analysis.followFlightId,
        activeTimestamp: state.analysis.activeTimestamp,
        isSummary: state.analysis.isSummary
      },
      shouldReanalise
    );
  }

  return newState;
}

function handleSetFollowFlight(state: State, action: Action): State {
  if (action.type !== ActionType.SetFollowFlight) return state; // hack to get types to work

  if (!state.analysis) return state;

  return {
    ...state,
    analysis: { ...state.analysis, followFlightId: action.flightDatum.id }
  };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.SetFlightData:
      return handleSetFlightData(state, action);

    case ActionType.SetActiveTimestamp:
      return handleSetActiveTimestamp(state, action);

    case ActionType.AdvanceActiveTimestamp:
      return handleAdvanceActiveTimestamp(state, action);

    case ActionType.TogglePlay:
      return handleTogglePlay(state, action);

    case ActionType.ToggleFlights:
      return handleToggleFlights(state, action);

    case ActionType.ToggleSettings:
      return handleToggleSettings(state, action);

    case ActionType.ShowFlightUploader:
      return handleShowFlightUploader(state, action);

    case ActionType.CloseDrawer:
      return handleCloseDrawer(state, action);

    case ActionType.ChangeSettings:
      return handleChangeSettings(state, action);

    case ActionType.SetFollowFlight:
      return handleSetFollowFlight(state, action);
  }
}

function handleSetFlightData(state: State, action: Action): State {
  if (action.type !== ActionType.SetFlightData) return state; // hack to get types to work

  const { flightData } = action;
  const task = flightData.map(f => f.task).find(t => !!t) || null;

  if (task) {
    flightData.forEach(f => (f.flight.task = new Task(task!.turnpoints)));
  }

  const flightGroup = new FlightGroup(flightData.map(f => f.flight));

  let synchronizationMethod = state.settings.synchronizationMethod;
  if (
    !flightGroup.allFlightsInSameDay() &&
    synchronizationMethod === synchronizationMethods.realTime
  ) {
    synchronizationMethod = synchronizationMethods.takeOff;
  }

  const newState = {
    ...state,
    settings: { ...state.settings, synchronizationMethod },
    isLoading: false,
    sideDrawer: null
  };

  const analysis = buildAnalysisState(newState, flightGroup, task);
  newState.analysis = analysis;

  return newState;
}

function buildAnalysisState(
  state: State,
  flightGroup: FlightGroup,
  task: Task | null,
  overrides: Partial<AnalysisState> = {},
  reanalise = false
) {
  const colors = new Colors();

  const flightData = flightGroup.flights.map(flight => {
    const flightDatum = new FlightDatum(flight);
    flightDatum.color = colors.nextColor();
    return flightDatum;
  });

  const flightDataById = flightData.reduce((byId: FlightDataById, data) => {
    byId[data.id] = data;
    return byId;
  }, {});

  flightGroup.flights.forEach(f =>
    f.analise(flightComputer(state.settings), reanalise)
  );
  flightGroup.synchronize(state.settings.synchronizationMethod);
  flightGroup = Object.create(flightGroup);

  return {
    task,
    flightGroup,
    flightData,
    flightDataById,
    followFlightId: flightGroup.flights[0].id,
    activeTimestamp: flightGroup.earliestDatumAt,
    isSummary: true,
    ...overrides
  };
}
