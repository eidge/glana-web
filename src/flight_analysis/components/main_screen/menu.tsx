import React from "react";
import Icon from "../../../ui/components/icon";
import { IconKey } from "../../../ui/components/icon";

interface Props {
  isStatsOpen: boolean;
  isPlaying: boolean;
  isSettingsOpen: boolean;
  toggleStats: () => void;
  togglePlay: () => void;
  toggleSettings: () => void;
}

export default function Menu(props: Props) {
  const {
    isStatsOpen,
    isPlaying,
    isSettingsOpen,
    toggleStats,
    togglePlay,
    toggleSettings
  } = props;

  return (
    <div className="flex flex-row items-center justify-center w-full bg-gray-800 border-t border-gray-900">
      <MenuItem
        onClick={toggleStats}
        isActive={isStatsOpen}
        icon="chartLine"
        text="flights"
        label="open stats page"
      />
      <MenuItem
        onClick={togglePlay}
        isActive={isPlaying}
        icon={isPlaying ? "pause" : "play"}
        text={isPlaying ? "pause" : "play"}
        label={isPlaying ? "pause flight" : "play flight"}
      />
      <MenuItem
        onClick={toggleSettings}
        isActive={isSettingsOpen}
        icon="cog"
        text="settings"
        label="open settings page"
      />
    </div>
  );
}

interface ButtonProps {
  icon: IconKey;
  text: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function MenuItem(props: ButtonProps) {
  const { icon, text, onClick, label } = props;

  return (
    <button
      className={menuItemClasses(props)}
      onClick={onClick}
      type="button"
      aria-label={label}
      style={{ fontSize: 0 }}
    >
      <Icon icon={icon} size="lg" />
      <div className={menuItemTextClasses(props)}>{text}</div>
    </button>
  );
}

function menuItemClasses(props: ButtonProps) {
  const classes = [
    "flex flex-col items-center justify-center w-20 p-2",
    "text-gray-400 leading-none focus:outline-none hover:bg-gray-900"
  ];

  if (props.isActive) {
    classes.push("text-white");
  }

  return classes.join(" ");
}

function menuItemTextClasses(props: ButtonProps) {
  const classes = ["text-xs text-gray-400 pt-1"];
  if (props.isActive) {
    classes.push("text-primary");
  }
  return classes.join(" ");
}
