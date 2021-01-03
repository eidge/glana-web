import { useEffect, useMemo, useState } from "react";

export function usePreventWindowScroll() {
  useEffect(() => {
    window.scrollTo(0, 0);
    window.addEventListener("scroll", preventScroll);
    return () => window.removeEventListener("scroll", preventScroll);
  }, []);
}

function preventScroll(event: Event) {
  event.preventDefault();
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 100);
  window.scrollTo(0, 0);
}

export function useWindowHeight() {
  const firstRenderAt = useMemo(() => new Date(), []);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const interval = setInterval(() => {
      if (firstRenderAt.getTime() + 15000 < new Date().getTime()) {
        clearInterval(interval);
        return;
      }
      setHeight(window.innerHeight);
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [firstRenderAt]);

  useEffect(() => {
    const setHeightFn = () => setHeight(window.innerHeight);
    window.addEventListener("resize", setHeightFn);
    return () => window.removeEventListener("resize", setHeightFn);
  }, []);

  return height;
}
