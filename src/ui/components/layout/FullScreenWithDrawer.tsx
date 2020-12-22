import { ReactNode, useEffect, useState } from "react";

interface Props {
  header?: ReactNode;
  main: ReactNode;
  drawer: ReactNode;
  isDrawerOpen: boolean;
  onClose: () => void;
}

export default function FullScreenWithDrawer(props: Props) {
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(count => count + 1);
    setHeight(window.innerHeight);

    const interval = setInterval(() => {
      setCount(count => count + 1);
      setHeight(window.innerHeight);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [setHeight]);
  return (
    <div className="gl-container" style={{ height }}>
      <div className="gl-main">{props.main}</div>
      {props.isDrawerOpen && (
        <div className="gl-drawer" onClick={props.onClose}>
          {count}
          {props.drawer}
        </div>
      )}
      <style jsx>{`
        .gl-container {
          @apply flex flex-row fixed h-full w-full bg-success-200 overflow-hidden;
        }

        .gl-main {
          @apply h-full w-full bg-primary-200;
        }

        .gl-drawer {
          @apply w-1/3;
        }
      `}</style>
    </div>
  );
}
