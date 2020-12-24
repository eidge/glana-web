import FullScreenWithDrawer from "../../ui/components/layout/full_screen_with_drawer";
import { useFlightAnalysisDispatch, useFlightAnalysisState } from "../store";
import { actions } from "../store/actions";
import Menu from "./menu";
import Timeline from "./timeline";
import Map from "./map";
import Settings from "./settings";
import Loading from "./loading";

export default function MainScreen() {
  const { sideDrawer, isLoading } = useFlightAnalysisState();
  const dispatch = useFlightAnalysisDispatch();
  const closeDrawer = () => dispatch(actions.closeDrawer());

  return (
    <FullScreenWithDrawer
      main={isLoading ? <Loading /> : <MainPanel />}
      drawer={<Drawer />}
      drawerHeader={<DrawerHeader />}
      isDrawerOpen={!!sideDrawer.view}
      onClose={closeDrawer}
    />
  );
}

interface MainPanelProps {}

function MainPanel(_props: MainPanelProps) {
  const { sideDrawer } = useFlightAnalysisState();
  const dispatch = useFlightAnalysisDispatch();
  const toggleStats = () => {
    dispatch(actions.toggleStats());
  };
  const toggleSettings = () => {
    dispatch(actions.toggleSettings());
  };

  return (
    <div className="flex flex-col relative w-full h-full">
      <Map></Map>
      <div className="relative">
        <div className="absolute w-full" style={{ bottom: "100%" }}>
          <Timeline />
        </div>
        <Menu
          isStatsOpen={sideDrawer.view === "stats"}
          isPlaying={false}
          isSettingsOpen={sideDrawer.view === "settings"}
          toggleStats={toggleStats}
          togglePlay={toggleStats}
          toggleSettings={toggleSettings}
        />
      </div>
    </div>
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
      return <Settings />;
    case null:
      return <></>;
  }
}
