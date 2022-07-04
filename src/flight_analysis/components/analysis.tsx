import FullScreenWithDrawer from "../../ui/components/layout/full_screen_with_drawer";
import { useFlightAnalysisDispatch, useFlightAnalysisState } from "../store";
import { actions } from "../store/actions";
import LoadingScreen from "./loading_screen";
import MainScreen from "./main_screen";
import FlightsScreen from "./flights_screen";
import SettingsScreen from "./settings_screen";
import UploadScreen from "./upload_screen";
import { DrawerState } from "../store/reducer";
import { useCallback, useMemo } from "react";
import IGCBlob from "../igc_blob";
import analytics from "../../analytics";
import React from "react";
import errorTracker from "../../error_tracker";

export default function Analysis() {
  const { sideDrawer, isLoading } = useFlightAnalysisState();
  const dispatch = useFlightAnalysisDispatch();
  const closeDrawer = useCallback(() => dispatch(actions.closeDrawer()), [
    dispatch
  ]);
  const uploadFlight = useCallback(
    async (event: any) => {
      event.preventDefault();
      let files = Array.from(event.dataTransfer.files) as Blob[];
      if (files.length < 1) return;

      analytics.trackEvent("dropped_file");

      try {
        const igcBlob = new IGCBlob(files);
        const flightData = await igcBlob.toFlightData();
        dispatch(actions.setFlightData(flightData));
      } catch (e) {
        await errorTracker.report(e);
      }
    },
    [dispatch]
  );
  const extraAttributes = useMemo(() => {
    return {
      onDragEnter: preventDefault,
      onDragOver: preventDefault,
      onDrop: uploadFlight
    };
  }, [uploadFlight]);

  return (
    <FullScreenWithDrawer
      main={<Main isLoading={isLoading} />}
      drawer={sideDrawer && <Drawer sideDrawer={sideDrawer} />}
      drawerHeader={sideDrawer && <DrawerHeader sideDrawer={sideDrawer} />}
      isDrawerOpen={!!sideDrawer}
      onClose={sideDrawer && sideDrawer.canClose && closeDrawer}
      extraAttributes={extraAttributes}
    />
  );
}

const Main = React.memo((props: { isLoading: boolean }) => {
  if (props.isLoading) return <LoadingScreen />;
  return <MainScreen />;
});

function preventDefault(e: Event) {
  e.preventDefault();
}

function DrawerHeader(props: { sideDrawer: DrawerState }): JSX.Element {
  const { sideDrawer } = props;
  switch (sideDrawer.view) {
    case "flights":
      return <span className="font-medium text-2xl">Flights</span>;
    case "settings":
      return <span className="font-medium text-2xl">Settings</span>;
    case "upload_flight":
      return <span className="font-medium text-2xl">Welcome to Glana</span>;
  }
}

function Drawer(props: { sideDrawer: DrawerState }): JSX.Element {
  const { sideDrawer } = props;
  switch (sideDrawer.view) {
    case "flights":
      return <FlightsScreen />;
    case "settings":
      return <SettingsScreen />;
    case "upload_flight":
      return <UploadScreen />;
  }
}
