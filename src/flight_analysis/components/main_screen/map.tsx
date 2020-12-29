import { RefObject, useEffect, useRef, useState } from "react";
import MapRenderer from "../../maps/map_renderer";
import FlightRenderer from "../../maps/flight_renderer";
import { AnalysisState } from "../../store/reducer";
import TaskRenderer from "../../maps/task_renderer";
import { createEmpty } from "ol/extent";

const PADDING = {
  top: 40,
  right: 40,
  bottom: 135,
  left: 40
};

interface Props {
  analysis: AnalysisState | null;
  showAirspace: boolean;
  renderFullTrack: boolean;
  isDebug: boolean;
}

export default function Map(props: Props) {
  const { isDebug, showAirspace, renderFullTrack, analysis } = props;
  const element = useRef(null);
  const mapRenderer = useMapRenderer(element, showAirspace);

  useFlightRenderers(mapRenderer, analysis, renderFullTrack);

  return (
    <div className="relative w-full h-full bg-gray-800">
      <div className="w-full h-full" ref={element}></div>
      <UseableClientRectDebug isDebug={isDebug} mapRenderer={mapRenderer} />
    </div>
  );
}

function useMapRenderer(
  element: RefObject<HTMLElement>,
  showAirspace: boolean
) {
  const [mapRenderer, setMapRenderer] = useState<MapRenderer | null>(null);

  useEffect(() => {
    if (!element.current) return;

    const mapRenderer = new MapRenderer(element.current!, PADDING);
    setMapRenderer(mapRenderer);

    return () => {
      mapRenderer.destroy();
    };
  }, [element]);

  useEffect(() => {
    if (!mapRenderer) return;
    mapRenderer.setAirspaceVisibility(showAirspace);
  }, [mapRenderer, showAirspace]);

  return mapRenderer;
}

function useFlightRenderers(
  mapRenderer: MapRenderer | null,
  analysis: AnalysisState | null,
  renderFullTrack: boolean
) {
  const [flightRenderers, setFlightRenderers] = useState<FlightRenderer[]>([]);
  const flightData = analysis?.flightData;
  const activeTimestamp = analysis?.activeTimestamp;
  const task = analysis?.task || null;
  const followFlightId = analysis?.followFlightId || null;
  const followFlight =
    followFlightId && analysis!.flightDataById[followFlightId];
  const isSummary = analysis?.isSummary || false;

  useEffect(() => {
    if (!mapRenderer || !flightData) return;

    const flightRenderers = flightData.map(
      fd => new FlightRenderer(mapRenderer, fd)
    );
    flightRenderers.forEach(fr => fr.render());
    setFlightRenderers(flightRenderers);

    const taskRenderer = task && new TaskRenderer(mapRenderer, task);
    taskRenderer?.render();

    mapRenderer.zoomToFit(
      ...flightRenderers.map(r => r.getExtent()),
      taskRenderer?.getExtent() || createEmpty()
    );

    return () => {
      flightRenderers.forEach(fr => fr.destroy());
      taskRenderer?.destroy();
    };
  }, [mapRenderer, flightData, task]);

  useEffect(() => {
    if (!activeTimestamp || flightRenderers.length === 0) return;
    flightRenderers.forEach(fr => fr.setActiveTimestamp(activeTimestamp));
    const followDatum =
      followFlight && followFlight.flight.datumAt(activeTimestamp);
    if (followDatum && !mapRenderer!.isVisible(followDatum.position)) {
      mapRenderer?.centerOn(followDatum.position);
    }
  }, [mapRenderer, flightRenderers, activeTimestamp, followFlight]);

  useEffect(() => {
    if (flightRenderers.length === 0) return;
    flightRenderers.forEach(fr =>
      fr.setRenderFullTrack(isSummary || renderFullTrack)
    );
  }, [flightRenderers, renderFullTrack, isSummary]);
}

function UseableClientRectDebug(props: {
  isDebug: boolean;
  mapRenderer: MapRenderer | null;
}) {
  const { isDebug, mapRenderer } = props;
  if (!isDebug || !mapRenderer) return null;

  const clientRect = mapRenderer.usableClientRect;
  const usableClientRectStyle = {
    top: clientRect.top,
    left: clientRect.left,
    width: clientRect.width,
    height: clientRect.height
  };

  return (
    <div
      className="absolute bg-white bg-opacity-60 flex flex-row items-center justify-center"
      style={usableClientRectStyle}
    >
      <div className="h-6 w-6 rounded-full border-2 border-success border-opacity-50"></div>
    </div>
  );
}
