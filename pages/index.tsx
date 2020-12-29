import FlightAnalysis from "../src/flight_analysis/components";
import { useEffect, useState } from "react";
import LoadingScreen from "../src/flight_analysis/components/loading_screen";
import FullScreenWithDrawer from "../src/ui/components/layout/full_screen_with_drawer";
import BGALoader from "../src/flight_analysis/url_flight_loaders/bga_loader";
import IGCLoader from "../src/flight_analysis/url_flight_loaders/igc_loader";
import FlightGroup from "glana/src/analysis/flight_group";

const LOADER_CLASSES = [BGALoader, IGCLoader];

interface State {
  isLoading: boolean;
  flightGroup?: FlightGroup;
}

export default function Index() {
  const [state, setState] = useState<State>({
    isLoading: true
  });
  useEffect(() => {
    maybeLoadFlightsFromURL(setState);
  }, [setState]);

  return state.isLoading ? (
    <Loading />
  ) : (
    <FlightAnalysis flightGroup={state.flightGroup} />
  );
}

async function maybeLoadFlightsFromURL(setState: any) {
  const queryParams = new URLSearchParams(window.location.search);
  const loaders = LOADER_CLASSES.map(
    LoaderClass => new LoaderClass(queryParams)
  );
  const loader = loaders.find(l => l.willHandle());

  if (loader) {
    const flightGroup = await loader.loadFlightGroup();
    if (flightGroup.flights.length < 1) {
      window.location.href = "/failed_to_load_flight";
    }
    setState((s: State) => ({
      ...s,
      isLoading: false,
      flightGroup: flightGroup
    }));
  } else {
    setState((s: State) => ({ ...s, isLoading: false }));
  }
}

function Loading() {
  return (
    <FullScreenWithDrawer
      main={<LoadingScreen />}
      drawer={<></>}
      isDrawerOpen={false}
      onClose={noOp}
    />
  );
}

function noOp() {}
