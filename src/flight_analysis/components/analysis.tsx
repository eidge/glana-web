import FullScreenWithDrawer from "../../ui/components/layout/full_screen_with_drawer";
import { useFlightAnalysisDispatch, useFlightAnalysisState } from "../store";
import { actions } from "../store/actions";
import LoadingScreen from "./loading_screen";
import MainScreen from "./main_screen";
import FlightsScreen from "./flights_screen";
import SettingsScreen from "./settings_screen";
import UploadScreen from "./upload_screen";
import { DrawerState } from "../store/reducer";

export default function Analysis() {
  const { sideDrawer, isLoading } = useFlightAnalysisState();
  const dispatch = useFlightAnalysisDispatch();
  const closeDrawer = () => dispatch(actions.closeDrawer());

  return (
    <FullScreenWithDrawer
      main={isLoading ? <LoadingScreen /> : <MainScreen />}
      drawer={sideDrawer && <Drawer sideDrawer={sideDrawer} />}
      drawerHeader={sideDrawer && <DrawerHeader sideDrawer={sideDrawer} />}
      isDrawerOpen={!!sideDrawer}
      onClose={sideDrawer && sideDrawer.canClose && closeDrawer}
    />
  );
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
