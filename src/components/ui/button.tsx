import * as icons from "./icons";

export type IconKey = keyof typeof icons;
export type SizeOptions = "md" | "lg";
export type ColorOptions = "primary" | "secondary" | "white";

export interface ButtonProps {
  icon?: IconKey | null;
  size?: SizeOptions;
  color?: ColorOptions;
  inButtonGroup?: boolean;
  onClick: () => void;
}

function addDefaultProps(props: ButtonProps) {
  return {
    ...props,
    size: props.size || "md",
    icon: props.icon || null,
    color: props.color || "secondary",
    inButtonGroup:
      props.inButtonGroup === undefined ? false : props.inButtonGroup,
  };
}

const iconSizeClasses: { [key in SizeOptions]: string } = {
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

const iconComponent = (props: Required<ButtonProps>) => {
  if (!props.icon) return null;
  let IconComponent = icons[props.icon];
  return (
    <div className={iconSizeClasses[props.size]}>
      <IconComponent />
    </div>
  );
};

const sizeClasses: { [key in SizeOptions]: string } = {
  md: "btn--md",
  lg: "btn--lg",
};

const colorClasses: { [key in ColorOptions]: string } = {
  primary: "btn--primary",
  secondary: "btn--secondary",
  white: "btn--white",
};

const Button = (p: ButtonProps) => {
  const props = addDefaultProps(p);
  const classes = ["btn"];
  classes.push(sizeClasses[props.size]);
  classes.push(colorClasses[props.color]);

  if (props.inButtonGroup) {
    classes.push("btn--grouped");
  }

  return (
    <a href="#" className={classes.join(" ")} onClick={props.onClick}>
      {iconComponent(props)}
      <style global jsx>{`
        .btn {
          @apply bg-gray-600 leading-none cursor-pointer inline-block;
        }

        .btn:not(.btn--grouped),
        .btn-group {
          @apply rounded shadow-md border border-solid;
        }

        .btn-group {
          @apply overflow-hidden flex;
        }

        .btn:hover {
          @apply bg-gray-700 shadow-inner;
        }

        .btn--md {
          @apply p-2;
        }

        .btn--lg {
          @apply p-2;
        }

        .btn--primary {
          @apply bg-primary text-white border-primary-600;
        }

        .btn--primary:hover {
          @apply bg-primary-600;
        }

        .btn--secondary {
          @apply bg-gray-200 text-black border-gray-500;
        }

        .btn--secondary:hover {
          @apply bg-gray-300;
        }

        .btn--white {
          @apply bg-white text-black border-gray-200;
        }

        .btn--white:hover {
          @apply bg-gray-100;
        }
      `}</style>
    </a>
  );
};

export default Button;
