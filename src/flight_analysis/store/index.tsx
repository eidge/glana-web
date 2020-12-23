import React, { ReactNode, useContext, useReducer } from "react";
import { initialState, reducer } from "./reducer";
import { Action } from "./actions";

const StateContext = React.createContext(initialState());
const DispatchContent = React.createContext<React.Dispatch<Action>>(() => {});

interface ProviderProps {
  children: ReactNode;
}

export function StoreProvider(props: ProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState());
  return (
    <DispatchContent.Provider value={dispatch}>
      <StateContext.Provider value={state}>
        {props.children}
      </StateContext.Provider>
    </DispatchContent.Provider>
  );
}

export function useFlightAnalysisState() {
  return useContext(StateContext);
}

export function useFlightAnalysisDispatch() {
  return useContext(DispatchContent);
}
