import { ReactNode, useEffect, useState } from "react";
import Div100vh from "react-div-100vh";
import Button from "../button";

interface Props {
  headerComponent?: ReactNode;
  mainComponent: ReactNode;
  secondaryComponent: ReactNode;
  isDrawerOpen: boolean;
  onClose: () => void;
}

const animationDuration = 200;

function Drawer(props: Props) {
  const [wasOpened, setWasOpened] = useState(props.isDrawerOpen);
  const classNames = [
    "drawer",
    `transform transition ease-in-out duration-${animationDuration}`,
    "fixed inset-y-0 right-0 w-full sm:w-1/2 md:max-w-screen-sm z-10 overflow-y-scroll",
    "text-white bg-gray-800 sm:border-l-2 border-gray-900",
    props.isDrawerOpen ? "translate-x-0" : "translate-x-full"
  ];

  if (props.isDrawerOpen && !wasOpened) {
    setWasOpened(true);
  }

  return (
    <>
      <div className={classNames.join(" ")}>
        <div className="sticky w-full top-0 left-0 z-20 flex flex-row items-center py-3 px-6 bg-gray-800 border-b border-gray-600 leading-none text-xl">
          <Button
            icon="chevronLeft"
            isInverted={true}
            color="white"
            size="lg"
            onClick={props.onClose}
          />
          <div className="pl-3">{wasOpened && props.headerComponent}</div>
        </div>
        <div className="px-6">{wasOpened && props.secondaryComponent}</div>
      </div>
    </>
  );
}

export default function ToggleableSplitScreen(props: Props) {
  const { isDrawerOpen } = props;
  const [animationFinished, setAnimationFinished] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => {
      setAnimationFinished(isDrawerOpen);
    }, animationDuration);
    return () => clearTimeout(id);
  }, [isDrawerOpen]);

  return (
    <Div100vh className="flex flex-row">
      <div className="relative flex-grow">{props.mainComponent}</div>
      {animationFinished && isDrawerOpen && (
        // Ghost div to push the main container to the left when the drawer is
        // open.
        <div className="w-full sm:w-1/2 md:max-w-screen-sm" />
      )}
      <Drawer {...props} />
    </Div100vh>
  );
}
