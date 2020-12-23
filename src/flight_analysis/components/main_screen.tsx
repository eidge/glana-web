import FullScreenWithDrawer from "../../ui/components/layout/full_screen_with_drawer";
import { useFlightAnalysisDispatch, useFlightAnalysisState } from "../store";
import { actions } from "../store/actions";
import Menu from "./menu";
import Timeline from "./timeline";
import Map from "./map";

export default function MainScreen() {
  const { stats } = useFlightAnalysisState();
  const dispatch = useFlightAnalysisDispatch();
  const toggleStats = () => {
    dispatch(actions.toggleStats());
  };

  const mainPanel = (
    <MainPanel isStatsOpen={stats.isOpen} toggleStats={toggleStats} />
  );
  const drawer = <Drawer />;
  const drawerHeader = <DrawerHeader />;
  return (
    <FullScreenWithDrawer
      main={mainPanel}
      drawer={drawer}
      drawerHeader={drawerHeader}
      isDrawerOpen={stats.isOpen}
      onClose={toggleStats}
    />
  );
}

interface MainPanelProps {
  toggleStats: () => void;
  isStatsOpen: boolean;
}

function MainPanel(props: MainPanelProps) {
  const { toggleStats, isStatsOpen } = props;

  return (
    <div className="flex flex-col relative w-full h-full">
      <Map></Map>
      <div className="relative">
        <div className="absolute w-full" style={{ bottom: "100%" }}>
          <Timeline />
        </div>
        <Menu
          isStatsOpen={isStatsOpen}
          isPlaying={false}
          isSettingsOpen={false}
          toggleStats={toggleStats}
          togglePlay={toggleStats}
          toggleSettings={toggleStats}
        />
      </div>
    </div>
  );
}

function Drawer() {
  const x = [];
  for (let i = 0; i < 40; ++i) x.push(i);
  return (
    <>
      {x.map(i => (
        <div key={i} className="m-6 bg-failure-200">
          Drawer
        </div>
      ))}
    </>
  );
}

function DrawerHeader() {
  return <span className="font-medium text-2xl">Stats</span>;
}
