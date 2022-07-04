import { useEffect, useRef, useState } from "react";
import Timeline from "./timeline";
import ButtonGroup from "../../../ui/components/button_group";
import React from "react";
import { isInIFrame } from "../../../utils/environment";
import MapRenderer from "../../maps/renderer";
import { AnalysisState } from "../../store/reducer";

const PADDING = {
  top: 40,
  right: 40,
  bottom: 135,
  left: 40,
};

interface Props {
  analysis: AnalysisState | null;
  isPlaying: boolean;
  renderFullTrack: boolean;
  setActiveTimestamp: (ts: Date) => void;
  showAirspace: boolean;
  showWeather: boolean;
}

export default function Map(props: Props) {
  const {
    analysis,
    isPlaying,
    setActiveTimestamp,
    showAirspace,
    showWeather,
  } = props;
  const element = useRef<HTMLDivElement | null>(null);

  const mapRenderer = useMapRenderer(element);
  useMapSettings(mapRenderer, props);
  useRenderFlights(mapRenderer, analysis);
  useRenderTask(mapRenderer, analysis);

  useWeatherLayer(mapRenderer, analysis, showWeather);
  useAirspaceLayer(mapRenderer, analysis, showAirspace);

  return (
    <div className="relative w-full h-full bg-gray-800">
      <div className="w-full h-full" ref={element}></div>
      <div className="absolute top-0 left-0 ml-3 mt-3 space-y-1">
        {mapRenderer && (
          <div className="hidden lg:block">
            <ZoomControls mapRenderer={mapRenderer} />
          </div>
        )}
        {isInIFrame() && (
          <div>
            <FramedControls />
          </div>
        )}
      </div>
      <div className="w-full absolute bottom-0 left-0">
        {analysis && (
          <Timeline
            analysis={analysis}
            isPlaying={isPlaying}
            setActiveTimestamp={setActiveTimestamp}
          />
        )}
      </div>
    </div>
  );
}

function useMapRenderer(element: React.MutableRefObject<HTMLElement | null>) {
  const [renderer, setRenderer] = useState<MapRenderer | null>(null);
  useEffect(() => {
    if (!element.current) return;

    const mapRenderer = new MapRenderer(element.current, PADDING);
    mapRenderer.initialize().then(() => setRenderer(mapRenderer));

    return () => {
      mapRenderer.destroy();
      setRenderer(null);
    };
  }, [element]);
  return renderer;
}

function useMapSettings(mapRenderer: MapRenderer | null, props: Props) {
  const { renderFullTrack, analysis } = props;
  const isSummary = analysis?.isSummary || false;

  useEffect(() => {
    if (!mapRenderer) return;
    mapRenderer.setRenderFullTracks(renderFullTrack || isSummary);
  }, [mapRenderer, renderFullTrack, isSummary]);
}

function useRenderFlights(
  mapRenderer: MapRenderer | null,
  analysis: AnalysisState | null
) {
  const flightData = analysis?.flightData;
  const activeTimestamp = analysis?.activeTimestamp;
  const activeFlight = getActiveFlight(analysis);

  useEffect(() => {
    if (!mapRenderer || !flightData) return;
    flightData.forEach((f) => mapRenderer.addFlight(f));
    // Give the UI time to hide the sidebar if it's open.
    setTimeout(() => mapRenderer.zoomToFit(), 1000);

    return () => flightData.forEach((f) => mapRenderer.removeFlight(f));
  }, [mapRenderer, flightData]);

  useEffect(() => {
    if (!mapRenderer || !activeTimestamp) return;

    mapRenderer.setTime(activeTimestamp);
  }, [mapRenderer, activeTimestamp]);

  useEffect(() => {
    if (!mapRenderer || !activeFlight) return;
    mapRenderer.setActiveFlight(activeFlight);
  }, [mapRenderer, activeFlight]);
}

function useRenderTask(
  mapRenderer: MapRenderer | null,
  analysis: AnalysisState | null
) {
  const task = analysis?.task;

  useEffect(() => {
    if (!mapRenderer || !task) return;
    mapRenderer.addTask(task);
    mapRenderer.zoomToFit();

    return () => mapRenderer.removeTask(task);
  }, [mapRenderer, task]);
}

function useWeatherLayer(
  mapRenderer: MapRenderer | null,
  analysis: AnalysisState | null,
  showWeather: boolean
) {
  useEffect(() => {
    if (!mapRenderer) return;
    mapRenderer.setCloudVisibility(showWeather);
  }, [mapRenderer, analysis?.flightGroup, showWeather]);
}

function useAirspaceLayer(
  mapRenderer: MapRenderer | null,
  analysis: AnalysisState | null,
  showAirspace: boolean
) {
  useEffect(() => {
    if (!mapRenderer) return;
    mapRenderer.setAirspaceVisibility(showAirspace);
  }, [mapRenderer, analysis?.flightGroup, showAirspace]);
}

function getActiveFlight(analysis: AnalysisState | null) {
  if (!analysis || !analysis.followFlightId) return null;
  const flight = analysis.flightDataById[analysis.followFlightId];
  return flight || null;
}

const ZoomControls = React.memo((props: { mapRenderer: MapRenderer }) => {
  const { mapRenderer } = props;
  return (
    <ButtonGroup
      size="lg"
      color="white"
      type="full"
      isVertical={true}
      buttons={[
        { icon: "zoomIn", onClick: () => mapRenderer.zoomIn() },
        { icon: "search", onClick: () => mapRenderer.zoomToFit() },
        { icon: "zoomOut", onClick: () => mapRenderer.zoomOut() },
      ]}
    />
  );
});

function FramedControls() {
  return (
    <ButtonGroup
      size="md"
      color="white"
      type="full"
      isVertical={true}
      buttons={[{ icon: "externalLink", onClick: openInNewTab }]}
    />
  );
}

function openInNewTab() {
  window.open(window.location.toString());
}
