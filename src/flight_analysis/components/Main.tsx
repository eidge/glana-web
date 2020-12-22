import { useState } from "react";
import FullScreenWithDrawer from "../../ui/components/layout/FullScreenWithDrawer";

export default function Main() {
  const [isDrawerOpen, toggleDrawer] = useDrawerState();
  const mainPanel = <MainPanel toggleDrawer={toggleDrawer} />;
  const drawer = <Drawer />;
  return (
    <FullScreenWithDrawer
      main={mainPanel}
      drawer={drawer}
      isDrawerOpen={isDrawerOpen}
      onClose={toggleDrawer}
    />
  );
}

function useDrawerState(isOpen = false): [boolean, () => void] {
  const [isDrawerOpen, setIsDrawerOpen] = useState(isOpen);
  const toggleDrawer = () => {
    setIsDrawerOpen(isOpen => !isOpen);
  };
  return [isDrawerOpen, toggleDrawer];
}

interface MainPanelProps {
  toggleDrawer: () => void;
}

function MainPanel(props: MainPanelProps) {
  const openInNewTab = () => {
    window.open("http://192.168.1.105:3000");
  };
  return (
    <div
      className="relative w-full h-full border border-black"
      onClick={props.toggleDrawer}
    >
      <div className="w-full h-full border border-black">Map</div>
      <div
        className="absolute bottom-0 w-full h-32 border border-black"
        onClick={openInNewTab}
      >
        Timeline
      </div>
    </div>
  );
}

function Drawer() {
  return <div className="bg-failure-200">Drawer</div>;
}
