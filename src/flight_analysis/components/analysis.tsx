import FullScreenWithDrawer from "../../ui/components/layout/full_screen_with_drawer";
import { useFlightAnalysisDispatch, useFlightAnalysisState } from "../store";
import { actions } from "../store/actions";
import LoadingScreen from "./loading_screen";
import MainScreen from "./main_screen";
import FlightsScreen from "./flights_screen";
import SettingsScreen from "./settings_screen";

export default function Analysis() {
  const { sideDrawer, isLoading } = useFlightAnalysisState();
  const dispatch = useFlightAnalysisDispatch();
  const closeDrawer = () => dispatch(actions.closeDrawer());

  return (
    <FullScreenWithDrawer
      main={isLoading ? <LoadingScreen /> : <MainScreen />}
      drawer={<Drawer />}
      drawerHeader={<DrawerHeader />}
      isDrawerOpen={!!sideDrawer.view}
      onClose={closeDrawer}
    />
  );
}

function DrawerHeader(): JSX.Element {
  const { sideDrawer } = useFlightAnalysisState();
  switch (sideDrawer.view) {
    case "flights":
      return <span className="font-medium text-2xl">Flights</span>;
    case "settings":
      return <span className="font-medium text-2xl">Settings</span>;
    case null:
      return <></>;
  }
}

function Drawer(): JSX.Element {
  const { sideDrawer } = useFlightAnalysisState();
  switch (sideDrawer.view) {
    case "flights":
      return <FlightsScreen />;
    case "settings":
      return <SettingsScreen />;
    case null:
      return <></>;
  }
}
