import { ReactNode, useEffect, useState } from "react";
import { usePreventWindowScroll, useWindowHeight } from "../../hooks/window";
import Button from "../button";

interface Props {
  main: ReactNode;
  drawer: ReactNode;
  drawerHeader?: ReactNode;
  isDrawerOpen: boolean;
  onClose: (() => void) | null | false;
}

const animationDuration = 200;
const animationDurationClass = "duration-200";
const drawerSizes = `w-full h-full sm:w-1/2 md:max-w-screen-sm flex-shrink-0`;
const drawerPaddingX = "px-6";
const drawerBackgroundColor = "bg-gray-900";
const innerDrawerBorderColor = "border-gray-600";
const outerDrawerBorderColor = "border-black";

export default function FullScreenWithDrawer(props: Props) {
  usePreventWindowScroll();
  const { isDrawerOpen, drawerHeader } = props;
  const height = useWindowHeight();
  const shouldPushMainLeft = useShouldPushMainLeft(isDrawerOpen);

  return (
    <div className={containerClasses()} style={{ height }}>
      <div className={mainClasses()}>{props.main}</div>
      {shouldPushMainLeft && <div className={drawerSizes}></div>}
      <div className={drawerClasses(isDrawerOpen)} style={{ height }}>
        <div className={drawerHeaderClasses()}>
          <CloseButton {...props} />
          {drawerHeader && <div>{drawerHeader}</div>}
        </div>
        {isDrawerOpen && <div className="p-6">{props.drawer}</div>}
      </div>
    </div>
  );
}

function useShouldPushMainLeft(isDrawerOpen: boolean) {
  const [animationFinished, setAnimationFinished] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => {
      setAnimationFinished(isDrawerOpen);
    }, animationDuration);
    return () => clearTimeout(id);
  }, [isDrawerOpen]);

  if (!isDrawerOpen) {
    // If the drawer is closing, then we want to return immediately instead of
    // waiting for the animation to finish. Otherwise, we would show a white
    // background div, whilst the drawer is animating away.
    return false;
  }

  return animationFinished;
}

function containerClasses() {
  return "flex flex-row fixed h-full w-full overflow-hidden gl-prevent-overscroll";
}

function mainClasses() {
  return "relative flex-grow overflow-hidden";
}

function drawerClasses(isOpen: boolean) {
  const translateClass = isOpen ? "translate-x-0" : "translate-x-full";
  return [
    "fixed right-0",
    "z-10 overflow-y-scroll overflow-x-hidden gl-prevent-overscroll",
    `transform transition ease-in-out ${animationDurationClass}`,
    `shadow border-l ${outerDrawerBorderColor} text-white ${drawerBackgroundColor}`,
    drawerSizes,
    translateClass
  ].join(" ");
}

function drawerHeaderClasses() {
  return [
    "flex flex-row sticky top-0 items-center z-10",
    `shadow-lg border-b ${innerDrawerBorderColor} ${drawerBackgroundColor}`,
    "py-3",
    drawerPaddingX
  ].join(" ");
}

function CloseButton(props: Props) {
  if (!props.onClose) return null;

  return (
    <>
      <Button
        className={`inline-block sm:hidden mr-3`}
        icon="chevronLeft"
        size="lg"
        color="white"
        onClick={props.onClose}
      />
      <Button
        className={`hidden sm:inline-block mr-3`}
        icon="close"
        size="lg"
        color="white"
        onClick={props.onClose}
      />
    </>
  );
}
