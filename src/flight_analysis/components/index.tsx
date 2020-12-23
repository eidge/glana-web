import MainScreen from "./main_screen";
import React from "react";
import { StoreProvider } from "../store";

export default function FlightAnalysis() {
  return (
    <StoreProvider>
      <MainScreen />
    </StoreProvider>
  );
}
