import { ActionType, Action } from "./actions";

export interface State {
  stats: {
    isOpen: boolean;
  };
}

export function initialState(): State {
  return {
    stats: {
      isOpen: false
    }
  };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.SetFlightGroup:
      return state;
    case ActionType.SetActiveTimestamp:
      return state;
    case ActionType.ToggleStats:
      const { stats } = state;
      return {
        ...state,
        stats: { ...stats, isOpen: !stats.isOpen }
      };
  }
}
