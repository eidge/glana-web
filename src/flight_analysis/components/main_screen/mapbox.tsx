import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { AnalysisState } from "../../store/reducer";
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
  useMap(elementRef);

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
  useEffect(() => {
    const element = elementRef.current;
    console.log(element);
    if (!element) return;
    const map = new mapboxgl.Map({
      container: element,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [6.5335, 44.2842],
      zoom: 9,
      failIfMajorPerformanceCaveat: true
    });
  }, [elementRef]);
}
