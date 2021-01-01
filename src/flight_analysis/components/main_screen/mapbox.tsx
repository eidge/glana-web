import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import { AnalysisState, FlightDatum } from "../../store/reducer";
import Timeline from "./timeline";
import React from "react";
// @ts-ignore
import { DeckGL } from "@deck.gl/react";
// @ts-ignore
import { LineLayer, GeoJsonLayer } from "@deck.gl/layers";
import { StaticMap } from "react-map-gl";

import mapboxgl from "mapbox-gl";
import { meters } from "glana/src/units/length";
mapboxgl.accessToken =
  "pk.eyJ1IjoiZWlkZ2UiLCJhIjoiNjVmYTRkMWY0NzM0NDdhZThmYmY4MzI2ZjU2Njg5NTIifQ.7IevRmRnToydZ2fJMGLZRQ";

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiZWlkZ2UiLCJhIjoiNjVmYTRkMWY0NzM0NDdhZThmYmY4MzI2ZjU2Njg5NTIifQ.7IevRmRnToydZ2fJMGLZRQ";

// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: -122.41669,
  latitude: 37.7853,
  zoom: 13,
  pitch: 0,
  bearing: 0
};

// Data to be used by the LineLayer
const data = [
  {
    sourcePosition: [-122.41669, 37.7853],
    targetPosition: [-122.41669, 37.781]
  }
];

const emptyArray: FlightDatum[] = [];
const toRGB = (str: String) => {
  const aRgbHex = str.slice(1).match(/.{1,2}/g);
  if (!aRgbHex) return null;
  return [
    parseInt(aRgbHex[0], 16),
    parseInt(aRgbHex[1], 16),
    parseInt(aRgbHex[2], 16)
  ];
};

export default function App(props: Props) {
  const { analysis, isPlaying, setActiveTimestamp } = props;
  const flights = analysis?.flightData || emptyArray;
  const activeTimestamp = analysis?.activeTimestamp;

  const layers = useMemo(() => {
    const layers = flights.map(
      fd =>
        new GeoJsonLayer({
          id: fd.id,
          data: flightToGeoJson(fd, activeTimestamp).data,
          stroked: true,
          filled: true,
          extruded: true,
          getLineColor: toRGB(fd.color),
          getFillColor: toRGB(fd.color),
          getRadius: 100,
          getLineWidth: 2,
          lineWidthMinPixels: 2
        })
    );

    if (analysis?.task) {
      const task = {
        type: "FeatureCollection",
        features: analysis.task.turnpoints.map(tp => tp.toGeoJSON())
      };

      layers.push(
        new GeoJsonLayer({
          id: "task",
          data: task,
          stroked: true,
          filled: true,
          extruded: true,
          getElevation: 9000,
          getLineColor: [0, 0, 0, 120],
          getFillColor: [0, 0, 0, 60],
          getLineWidth: 2,
          lineWidthMinPixels: 2
        })
      );
    }

    return layers;
  }, [flights, activeTimestamp, analysis]);

  return (
    <div className="relative w-full h-full bg-gray-800">
      <div className="w-full h-full">
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
          layers={layers}
        >
          <StaticMap mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} />
        </DeckGL>
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

interface Props {
  analysis: AnalysisState | null;
  isDebug: boolean;
  isPlaying: boolean;
  renderFullTrack: boolean;
  setActiveTimestamp: (ts: Date) => void;
  showAirspace: boolean;
  showWeather: boolean;
}

const INITIAL_VIEW = {
  latitude: 6.359724988491934,
  longitude: 44.43421863689022,
  pitch: 68,
  bearing: 34,
  zoom: 12
};

function Mapbox(props: Props) {
  const {
    analysis,
    //isDebug,
    isPlaying,
    //renderFullTrack,
    setActiveTimestamp
    //showAirspace,
    //showWeather
  } = props;

  // const elementRef = useRef<HTMLDivElement | null>(null);

  // const map = useMap(elementRef);
  // useRenderFlights(map, analysis);
  //
  const layers = [];

  if (analysis) {
    layers.push(
      new GeoJsonLayer({
        id: "flight",
        data: flightToGeoJson(analysis.flightData[0]).data,
        filled: true,
        pointRadiusMinPixels: 2,
        pointRadiusScale: 2000,
        getRadius: (f: any) => 5,
        getFillColor: [200, 0, 80, 180],
        // Interactive props
        pickable: true,
        autoHighlight: true,
        onClick: (info: any) =>
          info.object &&
          alert(
            `${info.object.properties.name} (${info.object.properties.abbrev})`
          )
      })
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-800">
      <div className="w-full h-full">
        <DeckGL
          mapboxApiAccessToken={"123"}
          initialViewState={INITIAL_VIEW}
          layers={layers}
        >
          <StaticMap mapboxApiAccessToken="pk.eyJ1IjoiZWlkZ2UiLCJhIjoiNjVmYTRkMWY0NzM0NDdhZThmYmY4MzI2ZjU2Njg5NTIifQ.7IevRmRnToydZ2fJMGLZRQ" />
        </DeckGL>
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

function flightToGeoJson(
  flightDatum: FlightDatum,
  activeTimestamp: Date
): mapboxgl.AnySourceData {
  const index = flightDatum.flight.datumIndexAt(activeTimestamp);
  const coordinates = flightDatum.flight.datums
    .slice(0, index + 1)
    .map(d => [
      d.position.longitude.value,
      d.position.latitude.value,
      d.position.altitude.convertTo(meters).value * 5
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
