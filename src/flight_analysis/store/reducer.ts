import { ActionType, Action } from "./actions";

export type DrawerView = "settings" | "stats" | null;

export interface State {
  sideDrawer: {
    view: DrawerView;
  };
}

export function initialState(): State {
  return {
    sideDrawer: {
      view: null
    }
  };
}

export function reducer(state: State, action: Action): State {
  const { sideDrawer } = state;
  const { view } = sideDrawer;
  let newView: DrawerView;

  switch (action.type) {
    case ActionType.SetFlightGroup:
      return state;
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
