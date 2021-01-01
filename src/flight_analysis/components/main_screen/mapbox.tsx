import { RefObject, useEffect, useRef, useState } from "react";
import { AnalysisState, FlightDatum } from "../../store/reducer";
import Timeline from "./timeline";
import React from "react";

import mapboxgl from "mapbox-gl";
mapboxgl.accessToken =
  "pk.eyJ1IjoiZWlkZ2UiLCJhIjoiNjVmYTRkMWY0NzM0NDdhZThmYmY4MzI2ZjU2Njg5NTIifQ.7IevRmRnToydZ2fJMGLZRQ";

interface Props {
  analysis: AnalysisState | null;
  isDebug: boolean;
  isPlaying: boolean;
  renderFullTrack: boolean;
  setActiveTimestamp: (ts: Date) => void;
  showAirspace: boolean;
  showWeather: boolean;
}

export default function Mapbox(props: Props) {
  const {
    analysis,
    //isDebug,
    isPlaying,
    //renderFullTrack,
    setActiveTimestamp
    //showAirspace,
    //showWeather
  } = props;

  const elementRef = useRef<HTMLDivElement | null>(null);

  const map = useMap(elementRef);
  useRenderFlights(map, analysis);

  return (
    <div className="relative w-full h-full bg-gray-800">
      <div className="w-full h-full" ref={elementRef}></div>
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

function useMap(elementRef: RefObject<HTMLElement | null>) {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const map = new mapboxgl.Map({
      container: element,
      style: "mapbox://styles/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y",
      center: [6.359724988491934, 44.43421863689022],
      pitch: 68,
      bearing: 34,
      zoom: 12,
      failIfMajorPerformanceCaveat: true,
      attributionControl: false,
      logoPosition: "top-left"
    });
    // @ts-ignore
    window.map = map;
    map.on("load", () => {
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14
      });
      // add the DEM source as a terrain layer with exaggerated height
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

      // add a sky layer that will show when the map is highly pitched
      map.addLayer({
        id: "sky",
        // @ts-ignore - Dated types
        type: "sky",
        paint: {
          // @ts-ignore - Dated types
          "sky-type": "atmosphere",
          "sky-atmosphere-sun": [0.0, 0.0],
          "sky-atmosphere-sun-intensity": 15
        }
      });

      setMap(map);
    });
  }, [elementRef]);

  return map;
}

function useRenderFlights(
  map: mapboxgl.Map | null,
  analysis: AnalysisState | null
) {
  const { followFlightId, flightDataById } = analysis || {};
  const flight = !!followFlightId && flightDataById![followFlightId];

  useEffect(() => {
    console.log("koko");
    if (!map || !flight) return;
    const geoJson = flightToGeoJson(flight);
    const sourceId = `source-${flight.id}`;
    const layerId = `layer-${flight.id}`;
    console.log(geoJson);
    map.addSource(sourceId, geoJson);
    map.addLayer({
      id: layerId,
      source: sourceId,
      type: "line",
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": flight.color,
        "line-width": 2
      }
    });

    return () => {
      map.removeLayer(layerId);
      map.removeSource(sourceId);
    };
  }, [map, flight]);
}

function flightToGeoJson(flightDatum: FlightDatum): mapboxgl.AnySourceData {
  const coordinates = flightDatum.flight.datums.map(d => [
    d.position.longitude.value,
    d.position.latitude.value
  ]);
  return {
    type: "geojson",
    data: {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: coordinates
      },
      properties: {
        title: flightDatum.flight.id,
        color: "red"
      }
    }
  };
}
