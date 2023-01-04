import React from "react";
import { ReactNode } from "react";
import Icon, { IconKey } from "./icon";

export type SizeOptions = "lg" | "md";
export type ColorOptions = "white" | "primary";
export type TypeOptions = "simple" | "full";

export interface Props {
  size: SizeOptions;
  color: ColorOptions;
  icon?: IconKey | null;
  text?: string | null;
  children?: ReactNode;
  onClick?: () => void;
  inButtonGroup?: boolean;
  type?: TypeOptions;
  className?: string;
  isPressed?: boolean;
}

function addDefaults(props: Props): Required<Props> {
  return {
    ...props,
    inButtonGroup: props.inButtonGroup || false,
    icon: props.icon || null,
    text: props.text || null,
    children: props.children || null,
    type: props.type || "simple",
    className: props.className || "",
    isPressed: props.isPressed || false,
    onClick: props.onClick || NoOp,
  };
}

function NoOp() {}

export default function Button(props: Props) {
  const { onClick, ...styleProps } = props;
  return (
    <ButtonStyle
      {...styleProps}
      element="button"
      attributes={{ type: "button", onClick: onClick }}
    />
  );
}

export function ButtonStyle(p: Props & { element: string; attributes?: {} }) {
  const props = addDefaults(p);
  const { size, icon, text, children } = props;

  return React.createElement(
    p.element,
    {
      className: buttonContainerClasses(props),
      ...p.attributes,
      style: { fontSize: 0 },
    },
    <>
      {children}
      {icon && <Icon icon={icon} size={size} />}
      {text && <span className={buttonTextClasses(props)}>{text}</span>}
    </>
  );
}

function buttonContainerClasses(props: Required<Props>) {
  const { inButtonGroup } = props;
  return [
    "gl-button",
    "inline-flex items-center justify-center cursor-pointer select-none",
    "leading-none p-2",
    "focus:outline-none",
    inButtonGroup ? "align-middle" : "rounded shadow hover:shadow-inner",
    styleClasses(props),
    props.className,
  ].join(" ");
}

const styles = {
  simple: {
    white: {
      normal: "text-white hover:bg-white hover:bg-opacity-10",
      pressed: "text-white bg-white bg-opacity-20",
    },
    primary: {
      normal: "text-primary hover:bg-primary hover:bg-opacity-10",
      pressed: "text-primary bg-white bg-opacity-20",
    },
  },
  full: {
    white: {
      normal: "text-black bg-white hover:bg-gray-200",
      pressed: "text-black bg-gray-300",
    },
    primary: {
      normal: "text-white bg-primary hover:bg-primary-600",
      pressed: "text-white bg-primary-700",
    },
  },
};

function styleClasses(props: Required<Props>) {
  const style = styles[props.type][props.color];
  if (props.isPressed) {
    return style.pressed;
  } else {
    return style.normal;
  }
}

const textSizeClasses = {
  md: {
    text: "text-base",
    iconPadding: "pl-1",
  },
  lg: {
    text: "text-2xl",
    iconPadding: "pl-2",
  },
};

function buttonTextClasses(props: Required<Props>) {
  const classes = ["leading-none"];

  classes.push(textSizeClasses[props.size].text);

  if (props.icon) {
    classes.push(textSizeClasses[props.size].iconPadding);
  }

  return classes.join(" ");
}
