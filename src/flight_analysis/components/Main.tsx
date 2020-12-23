import { useState } from "react";
import FullScreenWithDrawer from "../../ui/components/layout/full_screen_with_drawer";
import Menu from "./menu";
import Map from "../../components/flight_analysis/map";
import { synchronizationMethods } from "glana/src/analysis/flight_group";

export default function Main() {
  const [isStatsOpen, toggleStats] = useDrawerState(true);
  const mainPanel = (
    <MainPanel isStatsOpen={isStatsOpen} toggleStats={toggleStats} />
  );
  const drawer = <Drawer />;
  const drawerHeader = <DrawerHeader />;
  return (
    <FullScreenWithDrawer
      main={mainPanel}
      drawer={drawer}
      drawerHeader={drawerHeader}
      isDrawerOpen={isStatsOpen}
      onClose={toggleStats}
    />
  );
}

function useDrawerState(isOpen = false): [boolean, () => void] {
  const [isDrawerOpen, setIsDrawerOpen] = useState(isOpen);
  const toggleStats = () => {
    setIsDrawerOpen(isOpen => !isOpen);
  };
  return [isDrawerOpen, toggleStats];
}

interface MainPanelProps {
  toggleStats: () => void;
  isStatsOpen: boolean;
}

function MainPanel(props: MainPanelProps) {
  const { toggleStats, isStatsOpen } = props;
  const openInNewTab = () => {
    window.open("http://192.168.1.105:3000");
  };

  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full">
        <Map
          flightGroup={null}
          task={null}
          activeTimestamp={null}
          followFlight={null}
          settings={{
            synchronizationMethod: synchronizationMethods.recordingStarted,
            renderFullTracks: false,
            followFlight: true,
            playbackSpeed: 250,
            units: "imperial",
            showAirspace: false
          }}
        />
      </div>
      <div className="absolute bottom-0 w-full">
        <div
          className="w-full h-32 bg-primary bg-opacity-20"
          onClick={openInNewTab}
        >
          Timeline
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
  for (let i = 0; i < 20; ++i) x.push(i);
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
