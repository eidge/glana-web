import { useEffect } from "react";
import { milliseconds } from "glana/src/units/duration";
import Menu from "./menu";
import Timeline from "./timeline";
import Map from "./map";
import AnimationTicker from "../../animation_ticker";
import { useFlightAnalysisDispatch, useFlightAnalysisState } from "../../store";
import { Action, actions } from "../../store/actions";
import { Settings, units } from "../../settings";
import { FlightDatum } from "../../store/reducer";
import TimelineDetails from "./timeline_details";
import analytics from "../../../analytics";

export default function MainScreen() {
  const {
    sideDrawer,
    isPlaying,
    settings,
    analysis,
    isDebug
  } = useFlightAnalysisState();
  const dispatch = useFlightAnalysisDispatch();

  const unitSettings = units[settings.units];

  const toggleFlights = () => {
    dispatch(actions.toggleFlights());
  };
  const togglePlay = () => {
    dispatch(actions.togglePlay());
  };
  const toggleSettings = () => {
    if (!isPlaying) analytics.trackEvent("play_flight");
    dispatch(actions.toggleSettings());
  };
  const setFollowFlight = (fd: FlightDatum) => {
    dispatch(actions.setFollowFlight(fd));
  };

  useAnimationTicker(isPlaying, dispatch, settings);

  return (
    <div className="flex flex-col relative w-full h-full">
      <Map
        analysis={analysis}
        showAirspace={settings.showAirspace}
        renderFullTrack={settings.renderFullTracks}
        isDebug={isDebug}
      />
      <div className="relative">
        <div className="absolute w-full" style={{ bottom: "100%" }}>
          <Timeline />
        </div>
        {analysis && (
          <TimelineDetails
            flightData={analysis.flightData}
            followFlightId={analysis.followFlightId}
            timestamp={analysis.activeTimestamp}
            onClick={setFollowFlight}
            unitSettings={unitSettings}
          />
        )}
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

function useAnimationTicker(
  isPlaying: boolean,
  dispatch: (action: Action) => void,
  settings: Settings
) {
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
}
