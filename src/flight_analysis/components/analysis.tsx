import FullScreenWithDrawer from "../../ui/components/layout/full_screen_with_drawer";
import { useFlightAnalysisDispatch, useFlightAnalysisState } from "../store";
import { actions } from "../store/actions";
import SettingsScreen from "./settings_screen";
import LoadingScreen from "./loading_screen";
import MainScreen from "./main_screen";

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
    case "stats":
      return <span className="font-medium text-2xl">Stats</span>;
    case "settings":
      return <span className="font-medium text-2xl">Settings</span>;
    case null:
      return <></>;
  }
}

function Drawer(): JSX.Element {
  const { sideDrawer } = useFlightAnalysisState();
  switch (sideDrawer.view) {
    case "stats":
      const x = [];
      for (let i = 0; i < 40; ++i) x.push(i);
      return (
        <>
          {x.map(i => (
            <div key={i}>Drawer</div>
          ))}
        </>
      );
    case "settings":
      return <SettingsScreen />;
    case null:
      return <></>;
  }
}
