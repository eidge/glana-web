import * as icons from "./icons";

export type IconKey = keyof typeof icons;

type SizeOptions = "sm" | "md" | "lg";

const iconSizeClasses: { [key in SizeOptions]: string } = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-8 h-8"
};

interface Props {
  icon: IconKey;
  size?: SizeOptions;
  className?: string;
}

export default function Icon(props: Props) {
  const classes = ["inline-block"];
  if (props.className) {
    classes.push(props.className);
  }
  classes.push(iconSizeClasses[props.size || "md"]);
  return <i className={classes.join(" ")}>{icons[props.icon]()}</i>;
}
