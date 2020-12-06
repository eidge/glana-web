import { ReactNode } from "react";
import Icon, { IconKey } from "./icon";

const globalCSS = () => {
  return (
    <style global jsx>{`
      .btn {
        @apply bg-gray-600 leading-none cursor-pointer;
      }

      .btn:focus {
        @apply outline-none;
      }

      .btn:not(.btn--grouped),
      .btn-group {
        @apply rounded shadow align-middle inline-block;
      }

      .btn-group {
        @apply overflow-hidden inline-flex;
      }

      .btn:hover {
        @apply bg-gray-700 shadow-inner;
      }

      .btn.btn--active {
        @apply shadow-inner;
      }

      .btn--sm {
        @apply p-1;
      }

      .btn--md {
        @apply p-2;
      }

      .btn--lg {
        @apply p-2;
      }

      .btn--primary {
        @apply bg-primary text-white;
      }

      .btn--primary:hover {
        @apply bg-primary-600;
      }

      .btn--primary.btn--active {
        @apply bg-primary-800;
      }

      .btn--secondary {
        @apply bg-gray-200 text-black;
      }

      .btn--secondary:hover {
        @apply bg-gray-300;
      }

      .btn--secondary.btn--active {
        @apply bg-primary-500;
      }

      .btn--white {
        @apply bg-white text-black;
      }

      .btn--white:hover {
        @apply bg-gray-100;
      }

      .btn--white.btn--active {
        @apply bg-gray-300;
      }
    `}</style>
  );
};

export type SizeOptions = "sm" | "md" | "lg";
export type ColorOptions = "primary" | "secondary" | "white";

export interface ButtonProps {
  icon?: IconKey | null;
  size?: SizeOptions;
  color?: ColorOptions;
  inButtonGroup?: boolean;
  onClick?: () => void;
  children?: ReactNode;
  isActive?: boolean;
}

const NoOpFn = () => {};

const addDefaultProps = (props: ButtonProps) => {
  return {
    ...props,
    size: props.size || "md",
    icon: props.icon || null,
    color: props.color || "secondary",
    inButtonGroup:
      props.inButtonGroup === undefined ? false : props.inButtonGroup,
    children: props.children || null,
    onClick: props.onClick || NoOpFn,
    isActive: props.isActive || false
  };
};

const sizeClasses: { [key in SizeOptions]: string } = {
  sm: "btn--sm",
  md: "btn--md",
  lg: "btn--lg"
};

const colorClasses: { [key in ColorOptions]: string } = {
  primary: "btn--primary",
  secondary: "btn--secondary",
  white: "btn--white"
};

function buttonClasses(props: Required<ButtonProps>) {
  const classes = ["btn"];
  classes.push(sizeClasses[props.size]);
  classes.push(colorClasses[props.color]);

  if (props.inButtonGroup) {
    classes.push("btn--grouped");
  }

  if (props.isActive) {
    classes.push("btn--active");
  }

  return classes.join(" ");
}

function iconClasses(props: Required<ButtonProps>) {
  if (!props.children) return "align-middle";
  return "align-middle mr-2";
}

export default function Button(p: ButtonProps) {
  const props = addDefaultProps(p);

  return (
    <button className={buttonClasses(props)} onClick={props.onClick}>
      {props.icon && (
        <Icon
          icon={props.icon}
          size={props.size}
          className={iconClasses(props)}
        />
      )}
      {props.children}
      {globalCSS()}
    </button>
  );
}
