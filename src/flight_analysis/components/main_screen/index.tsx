import { useEffect } from "react";
import { milliseconds } from "glana/src/units/duration";
import Menu from "./menu";
import Timeline from "./timeline";
import Map from "./map";
import AnimationTicker from "../../animation_ticker";
import { useFlightAnalysisDispatch, useFlightAnalysisState } from "../../store";
import { actions } from "../../store/actions";

export default function MainScreen() {
  const { sideDrawer, isPlaying, settings } = useFlightAnalysisState();
  const dispatch = useFlightAnalysisDispatch();
  const toggleStats = () => {
    dispatch(actions.toggleStats());
  };
  const togglePlay = () => {
    dispatch(actions.togglePlay());
  };
  const toggleSettings = () => {
    dispatch(actions.toggleSettings());
  };

  useEffect(() => {
    const animationTicker = new AnimationTicker((elapsedTime: number) => {
      dispatch(
        actions.advanceActiveTimestamp(
          milliseconds(elapsedTime).multiply(settings.playbackSpeed)
        )
      );
    });

    if (isPlaying) {
      animationTicker.start();
    }

    return () => {
      animationTicker.stop();
    };
  }, [isPlaying, dispatch, settings]);

  return (
    <div className="flex flex-col relative w-full h-full">
      <Map></Map>
      <div className="relative">
        <div className="absolute w-full" style={{ bottom: "100%" }}>
          <Timeline />
        </div>
        <Menu
          isStatsOpen={sideDrawer.view === "stats"}
          isPlaying={isPlaying}
          isSettingsOpen={sideDrawer.view === "settings"}
          toggleStats={toggleStats}
          togglePlay={togglePlay}
          toggleSettings={toggleSettings}
        />
      </div>
    </div>
  );
}
