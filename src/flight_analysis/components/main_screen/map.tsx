import { useEffect, useRef, useState } from "react";
import MapRenderer from "../../maps/map_renderer";

const PADDING = {
  top: 20,
  right: 20,
  bottom: 135,
  left: 20
};

interface Props {
  isDebug: boolean;
  showAirspace: boolean;
}

export default function Map(props: Props) {
  const { isDebug, showAirspace } = props;
  const element = useRef(null);
  const [mapRenderer, setMapRenderer] = useState<MapRenderer | null>(null);

  useEffect(() => {
    if (!element.current) return;

    const mapRenderer = new MapRenderer(element.current!, PADDING);
    setMapRenderer(mapRenderer);

    return () => {
      mapRenderer.destroy();
    };
  }, []);

  useEffect(() => {
    if (!mapRenderer) return;
    mapRenderer.setAirspaceVisibility(showAirspace);
  }, [mapRenderer, showAirspace]);

  return (
    <div className="relative w-full h-full bg-gray-800">
      <div className="w-full h-full" ref={element}></div>
      <UseableClientRectDebug isDebug={isDebug} mapRenderer={mapRenderer} />
    </div>
  );
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
