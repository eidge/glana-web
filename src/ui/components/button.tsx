import { ReactNode } from "react";
import Icon, { IconKey } from "./icon";

export type SizeOptions = "lg" | "md";
export type ColorOptions = "white";
export type TypeOptions = "simple" | "full";

interface Props {
  size: SizeOptions;
  color: ColorOptions;
  icon?: IconKey | null;
  text?: string | null;
  children?: ReactNode;
  onClick: () => void;
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
    isPressed: props.isPressed || false
  };
}

export default function Button(p: Props) {
  const props = addDefaults(p);
  const { size, icon, text, onClick, children } = props;

  return (
    <button className={buttonClasses(props)} onClick={onClick} type="button">
      {children}
      {icon && <Icon icon={icon} size={size} />}
      {text && <span className={textClasses(props)}>{text}</span>}
      <style jsx>{`
        .gl-button {
          font-size: 0;
        }
      `}</style>
    </button>
  );
}

function buttonClasses(props: Required<Props>) {
  const { inButtonGroup } = props;
  return [
    "gl-button",
    "inline-flex items-center justify-center",
    "leading-none p-2",
    "focus:outline-none",
    inButtonGroup ? "align-middle" : "rounded shadow hover:shadow-inner",
    styleClasses(props),
    props.className
  ].join(" ");
}

const styles = {
  simple: {
    white: {
      normal: "text-white hover:bg-white hover:bg-opacity-10",
      pressed: "text-white bg-white bg-opacity-20"
    }
  },
  full: {
    white: {
      normal: "text-black bg-white hover:bg-gray-200",
      pressed: "text-black bg-gray-300"
    }
  }
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
    iconPadding: "pl-1"
  },
  lg: {
    text: "text-2xl",
    iconPadding: "pl-2"
  }
};

function textClasses(props: Required<Props>) {
  const classes = ["leading-none"];

  classes.push(textSizeClasses[props.size].text);

  if (props.icon) {
    classes.push(textSizeClasses[props.size].iconPadding);
  }

  return classes.join(" ");
}
