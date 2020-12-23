import { ReactNode, useEffect, useState } from "react";
import { usePreventWindowScroll, useWindowHeight } from "../../hooks/window";
import Button from "../button";

interface Props {
  header?: ReactNode;
  main: ReactNode;
  drawer: ReactNode;
  drawerHeader?: ReactNode;
  isDrawerOpen: boolean;
  onClose: () => void;
}

const animationDuration = 200;
const animationDurationClass = "duration-200";
const drawerSizes = `w-full h-full sm:w-1/2 md:max-w-screen-sm`;
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
          {drawerHeader && <div className="pl-3">{drawerHeader}</div>}
        </div>
        {isDrawerOpen && props.drawer}
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
    "flex flex-row sticky top-0 items-center",
    `shadow-lg border-b ${innerDrawerBorderColor} ${drawerBackgroundColor}`,
    "py-3",
    drawerPaddingX
  ].join(" ");
}

function CloseButton(props: Props) {
  return (
    <>
      <Button
        className={`inline-block sm:hidden`}
        icon="chevronLeft"
        size="lg"
        color="white"
        onClick={props.onClose}
      />
      <Button
        className={`hidden sm:inline-block`}
        icon="close"
        size="lg"
        color="white"
        onClick={props.onClose}
      />
    </>
  );
}
