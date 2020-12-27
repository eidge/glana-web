import { useEffect } from "react";
import { milliseconds } from "glana/src/units/duration";
import Menu from "./menu";
import Timeline from "./timeline";
import Map from "./map";
import AnimationTicker from "../../animation_ticker";
import { useFlightAnalysisDispatch, useFlightAnalysisState } from "../../store";
import { actions } from "../../store/actions";
import FlightLabel from "../../../ui/components/flight_label";

export default function MainScreen() {
  const {
    sideDrawer,
    isPlaying,
    settings,
    analysis
  } = useFlightAnalysisState();
  const dispatch = useFlightAnalysisDispatch();
  const toggleFlights = () => {
    dispatch(actions.toggleFlights());
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
        {analysis &&
          analysis.flightData.map(fd => (
            <div className="bg-gray-700 border-t border-gray-800 text-white py-2 leading-none flex flex-row justify-center">
              <FlightLabel flightDatum={fd} isActive={true} />
            </div>
          ))}
        <Menu
          isFlightsOpen={sideDrawer.view === "flights"}
          isPlaying={isPlaying}
          isSettingsOpen={sideDrawer.view === "settings"}
          toggleFlights={toggleFlights}
          togglePlay={togglePlay}
          toggleSettings={toggleSettings}
        />
      </div>
    </div>
  );
}
