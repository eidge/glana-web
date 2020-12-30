import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import MapRenderer from "../../maps/map_renderer";
import FlightRenderer from "../../maps/flight_renderer";
import { AnalysisState } from "../../store/reducer";
import TaskRenderer from "../../maps/task_renderer";
import { createEmpty, Extent } from "ol/extent";
import Timeline from "./timeline";
import ButtonGroup from "../../../ui/components/button_group";

const PADDING = {
  top: 40,
  right: 40,
  bottom: 135,
  left: 40
};

interface Props {
  analysis: AnalysisState | null;
  isDebug: boolean;
  isPlaying: boolean;
  renderFullTrack: boolean;
  setActiveTimestamp: (ts: Date) => void;
  showAirspace: boolean;
}

export default function Map(props: Props) {
  const {
    analysis,
    isDebug,
    isPlaying,
    renderFullTrack,
    setActiveTimestamp,
    showAirspace
  } = props;
  const element = useRef(null);
  const mapRenderer = useMapRenderer(element, showAirspace);
  const zoomIn = useCallback(() => mapRenderer?.zoomIn(), [mapRenderer]);
  const zoomToFit = useCallback(() => mapRenderer?.zoomToFit(), [mapRenderer]);
  const zoomOut = useCallback(() => mapRenderer?.zoomOut(), [mapRenderer]);

  useFlightRenderers(mapRenderer, analysis, renderFullTrack);

  return (
    <div className="relative w-full h-full bg-gray-800">
      <div className="w-full h-full" ref={element}></div>
      <div className="absolute hidden lg:block top-0 left-0 ml-3 mt-3">
        <ButtonGroup
          size="lg"
          color="white"
          type="full"
          isVertical={true}
          buttons={[
            { icon: "zoomIn", onClick: zoomIn },
            { icon: "search", onClick: zoomToFit },
            { icon: "zoomOut", onClick: zoomOut }
          ]}
        />
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
  const [{ extents, flightRenderers }, setRenderState] = useState<{
    extents: Extent[];
    flightRenderers: FlightRenderer[];
  }>({ extents: [], flightRenderers: [] });
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

    const taskRenderer = task && new TaskRenderer(mapRenderer, task);
    taskRenderer?.render();

    const extents = [
      ...flightRenderers.map(r => r.getExtent()),
      taskRenderer?.getExtent() || createEmpty()
    ];

    setRenderState({ flightRenderers, extents });

    return () => {
      flightRenderers.forEach(fr => fr.destroy());
      taskRenderer?.destroy();
    };
  }, [mapRenderer, flightData, task]);

  useEffect(() => {
    if (!activeTimestamp || flightRenderers.length === 0) return;
    flightRenderers.forEach(fr => {
      fr.setActiveTimestamp(activeTimestamp);
      fr.setActive(fr.flightDatum === followFlight);
    });

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

    let timeout: NodeJS.Timeout;
    if (mapRenderer && isSummary) {
      timeout = setTimeout(() => {
        // We run the zoom to fit in a timeout to debounce multiple renders.
        mapRenderer.zoomToFit(...extents);
      }, 500);
    }
    return () => clearTimeout(timeout);
  }, [mapRenderer, flightRenderers, renderFullTrack, isSummary, extents]);
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
