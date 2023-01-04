import React, { useCallback, useEffect } from "react";
import { milliseconds } from "glana/src/units/duration";
import Menu from "./menu";
import Map from "./map";
import AnimationTicker from "../../animation_ticker";
import { useFlightAnalysisDispatch, useFlightAnalysisState } from "../../store";
import { Action, actions } from "../../store/actions";
import { Settings, units } from "../../settings";
import { FlightDatum, Picture } from "../../store/models/flight_datum";
import TimelineDetails from "./timeline_details";
import analytics from "../../../analytics";
import PictureComponent from "./picture";

export default function MainScreen() {
  const { sideDrawer, isPlaying, settings, analysis, picture } =
    useFlightAnalysisState();
  const dispatch = useFlightAnalysisDispatch();

  const unitSettings = units[settings.units];

  const toggleFlights = useCallback(() => {
    dispatch(actions.toggleFlights());
  }, [dispatch]);
  const togglePlay = useCallback(() => {
    dispatch(actions.togglePlay());
  }, [dispatch]);
  const toggleSettings = useCallback(() => {
    if (!isPlaying) analytics.trackEvent("play_flight");
    dispatch(actions.toggleSettings());
  }, [dispatch, isPlaying]);
  const setFollowFlight = useCallback(
    (fd: FlightDatum) => {
      dispatch(actions.setFollowFlight(fd));
    },
    [dispatch]
  );
  const setActiveTimestamp = useCallback(
    (ts: Date) => {
      dispatch(actions.setActiveTimestamp(ts));
    },
    [dispatch]
  );
  const openPicture = useCallback(
    (picture: Picture) => {
      dispatch(actions.openPicture(picture));
    },
    [dispatch]
  );
  const closePicture = useCallback(() => {
    dispatch(actions.closePicture());
  }, [dispatch]);

  useAnimationTicker(isPlaying, dispatch, settings);

  return (
    <div className="flex flex-col relative w-full h-full">
      <Map
        isPlaying={isPlaying}
        setActiveTimestamp={setActiveTimestamp}
        analysis={analysis}
        showAirspace={settings.showAirspace}
        showWeather={settings.showWeather}
        renderFullTrack={settings.renderFullTracks}
        onOpenPicture={openPicture}
      />
      <div className="relative">
        {analysis && (
          <TimelineDetails
            flightData={analysis.flightData}
            followFlightId={analysis.followFlightId}
            timestamp={analysis.activeTimestamp}
            onClick={setFollowFlight}
            unitSettings={unitSettings}
          />
        )}
        {analysis && (
          <Menu
            isFlightsOpen={!!sideDrawer && sideDrawer.view === "flights"}
            isPlaying={isPlaying}
            isSettingsOpen={!!sideDrawer && sideDrawer.view === "settings"}
            toggleFlights={toggleFlights}
            togglePlay={togglePlay}
            toggleSettings={toggleSettings}
          />
        )}
      </div>

      {picture && <PictureComponent picture={picture} onClose={closePicture} />}
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
