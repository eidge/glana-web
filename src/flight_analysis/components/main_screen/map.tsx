import { useEffect, useRef } from "react";
import MapRenderer from "../../../maps/map";

interface Props {}

export default function Map(_props: Props) {
  const element = useRef(null);
  useEffect(() => {
    if (!element.current) return;

    const map = new MapRenderer(element.current!);
    map.render(false);

    return () => {
      map.destroy();
    };
  }, []);

  return <div ref={element} className="w-full h-full bg-gray-800"></div>;
}
